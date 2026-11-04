import json
import logging
import os
import re
from typing import List, Dict, Any, Optional, Tuple
import httpx
from sqlalchemy.orm import Session

from app.db.models.scheme import Scheme
from app.schemas.scheme import (
    SchemeEligibilityCheckRequest,
    SchemeEligibilityMatchItem,
    SchemeEligibilityCheckResponse,
    SchemeAssistantRequest,
    SchemeAssistantResponse,
)
from app.core.config import settings

logger = logging.getLogger("civicos.schemes")


def _call_gemini_welfare_api(
    model_name: str,
    api_key: str,
    system_prompt: str,
    user_prompt: str,
    timeout_seconds: float = 4.5,
) -> Optional[Dict[str, Any]]:
    """
    Direct, lightweight call to Gemini generateContent for Welfare Assistant.
    Enforces a strict short timeout (4.5s) to guarantee sub-5-second interactive responses.
    """
    clean_model = model_name.strip().replace("models/", "")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{clean_model}:generateContent"

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"text": f"{system_prompt}\n\n{user_prompt}"}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 800,
            "responseMimeType": "application/json",
        }
    }

    try:
        with httpx.Client(timeout=timeout_seconds, trust_env=False) as client:
            response = client.post(
                url,
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "x-goog-api-key": api_key,
                }
            )

        if response.status_code != 200:
            logger.info(f"[welfare-ai-status] Gemini returned HTTP {response.status_code}. Using deterministic fallback.")
            return None

        resp_json = response.json()
        candidates = resp_json.get("candidates", [])
        if not candidates:
            return None

        content_parts = candidates[0].get("content", {}).get("parts", [])
        if not content_parts or "text" not in content_parts[0]:
            return None

        raw_text = content_parts[0]["text"].strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        elif raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
        raw_text = raw_text.strip()

        try:
            return json.loads(raw_text)
        except json.JSONDecodeError:
            match = re.search(r'\{.*\}', raw_text, re.DOTALL)
            if match:
                return json.loads(match.group(0))
            return None

    except httpx.TimeoutException:
        logger.info(f"[welfare-ai-timeout] Gemini timed out after {timeout_seconds}s. Seamlessly activating deterministic fallback.")
        return None
    except Exception as exc:
        logger.info(f"[welfare-ai-error] Gemini unavailable ({exc}). Seamlessly activating deterministic fallback.")
        return None


def evaluate_scheme_eligibility_rule(
    scheme: Scheme,
    req: SchemeEligibilityCheckRequest,
) -> Tuple[str, float, str, List[str]]:
    """
    Deterministic rule-based eligibility evaluation.
    Returns (eligibility_status, confidence, why_you_qualify, missing_info).
    """
    rules = {}
    if scheme.eligibility_rules:
        try:
            rules = json.loads(scheme.eligibility_rules)
        except Exception:
            rules = {}

    target_groups = [g.strip().lower() for g in (scheme.target_groups or "").split(",") if g.strip()]

    score = 0.50
    reasons = []
    missing = []

    # 1. State check
    if scheme.state != "All-India":
        if req.state and req.state.lower() != scheme.state.lower():
            return "NOT_ELIGIBLE", 0.90, f"Scheme is specific to {scheme.state} residents.", []
        elif req.state:
            score += 0.15
            reasons.append(f"Resident of {scheme.state}")

    # 2. Student check
    if "students" in target_groups or rules.get("is_student"):
        if req.is_student is True:
            score += 0.35
            reasons.append("Currently enrolled as a student")
        elif req.is_student is False:
            return "NOT_ELIGIBLE", 0.95, "Scheme specifically requires active student enrollment.", []
        elif req.occupation and ("student" in req.occupation.lower() or "college" in req.occupation.lower()):
            score += 0.30
            reasons.append("Identified as student in occupation")
        else:
            missing.append("Student enrollment confirmation")

    # 3. Farmer check
    if "farmers" in target_groups or rules.get("is_farmer"):
        if req.is_farmer is True:
            score += 0.40
            reasons.append("Registered farmer / landholder")
        elif req.is_farmer is False and not req.occupation:
            return "NOT_ELIGIBLE", 0.95, "Scheme is exclusively for agricultural landholders and farmer families.", []
        elif req.occupation and "farm" in req.occupation.lower():
            score += 0.35
            reasons.append("Occupation identified as farmer/agriculture")
        else:
            missing.append("Agricultural land ownership proof")

    # 4. Age check
    if req.age:
        min_age = rules.get("min_age")
        max_age = rules.get("max_age")
        if min_age and req.age < min_age:
            return "NOT_ELIGIBLE", 0.95, f"Minimum age required is {min_age} years (Current age: {req.age}).", []
        if max_age and req.age > max_age:
            return "NOT_ELIGIBLE", 0.95, f"Maximum age limit is {max_age} years (Current age: {req.age}).", []
        if min_age or max_age:
            score += 0.15
            reasons.append(f"Age ({req.age} yrs) satisfies age requirements")

    # 5. Senior citizen check
    if "senior_citizens" in target_groups or "elderly" in target_groups:
        if req.senior_citizen is True or (req.age and req.age >= 60):
            score += 0.35
            reasons.append("Senior citizen status verified (60+ years)")
        elif req.age and req.age < 60:
            return "NOT_ELIGIBLE", 0.95, "Scheme is designated for senior citizens aged 60 and above.", []
        else:
            missing.append("Age verification (60+ yrs)")

    # 6. Income & BPL check
    if "bpl" in target_groups or rules.get("is_bpl"):
        if req.is_bpl is True:
            score += 0.30
            reasons.append("BPL / low-income household category verified")
        elif req.income_range in ["< 2.5L", "2.5L - 5L"]:
            score += 0.20
            reasons.append(f"Income bracket ({req.income_range}) is within priority limits")
        else:
            missing.append("Income / BPL ration card verification")

    # 7. Women & Gender
    if "women" in target_groups:
        if req.gender and req.gender.lower() == "female":
            score += 0.30
            reasons.append("Prioritized for women applicants and women-led enterprises")

    # 8. Homeowner check
    if rules.get("is_homeowner"):
        score += 0.15
        reasons.append("Available for independent residential meter holders")

    # Normalize score
    final_confidence = min(0.95, max(0.40, score))
    
    if final_confidence >= 0.70 and len(reasons) > 0:
        status = "LIKELY_ELIGIBLE"
        why = f"Based on your profile, you may be eligible because you meet key criteria: {', '.join(reasons)}."
    elif final_confidence >= 0.50:
        status = "POSSIBLY_ELIGIBLE"
        why = f"You may qualify for this scheme. Primary matches: {', '.join(reasons) if reasons else 'General demographic alignment'}."
    else:
        status = "MORE_INFO_NEEDED"
        why = "Additional details regarding specific eligibility criteria are required to evaluate your eligibility."

    if req.language == "ta":
        why = f"உங்கள் விவரங்களின்படி, நீங்கள் இத்திட்டத்திற்கு விண்ணப்பிக்க தகுதி பெறலாம். ({', '.join(reasons) if reasons else 'தகுதிகள் பொருந்தும்'})."

    return status, round(final_confidence, 2), why, missing


def get_scheme_matches_deterministic(
    db: Session,
    req: SchemeEligibilityCheckRequest,
) -> List[SchemeEligibilityMatchItem]:
    """Evaluates all active schemes deterministically against citizen criteria."""
    schemes = db.query(Scheme).filter(Scheme.is_active == True).all()
    results = []

    for scheme in schemes:
        status, conf, why, missing = evaluate_scheme_eligibility_rule(scheme, req)
        if status != "NOT_ELIGIBLE":
            docs = [d.strip() for d in (scheme.required_documents or "").split(",") if d.strip()]
            
            name = scheme.name_ta if (req.language == "ta" and scheme.name_ta) else scheme.name
            benefits = scheme.benefits_ta if (req.language == "ta" and scheme.benefits_ta) else scheme.benefits
            steps = scheme.application_steps_ta if (req.language == "ta" and scheme.application_steps_ta) else scheme.application_steps

            results.append(
                SchemeEligibilityMatchItem(
                    scheme_id=scheme.id,
                    scheme_code=scheme.code,
                    scheme_name=name,
                    category=scheme.category,
                    eligibility_status=status,
                    confidence=conf,
                    why_you_qualify=why,
                    benefits_summary=benefits,
                    required_documents=docs,
                    application_steps=steps,
                    official_portal=scheme.official_portal,
                    source_name=scheme.source_name,
                    missing_information=missing,
                )
            )

    # Sort by confidence descending
    results.sort(key=lambda x: (x.eligibility_status == "LIKELY_ELIGIBLE", x.confidence), reverse=True)
    return results


def query_scheme_assistant(
    db: Session,
    req: SchemeAssistantRequest,
) -> SchemeAssistantResponse:
    """
    Answers citizen questions and discovers matching schemes using controlled scheme dataset.
    Gemini provides natural language reasoning grounded in the verified scheme database.
    Deterministic keyword & rule matcher acts as safety fallback.
    """
    schemes = db.query(Scheme).filter(Scheme.is_active == True).all()
    
    # Format grounded knowledge base of verified schemes
    scheme_catalog_context = []
    for s in schemes:
        scheme_catalog_context.append({
            "id": s.id,
            "code": s.code,
            "name": s.name,
            "name_ta": s.name_ta,
            "category": s.category,
            "target_groups": s.target_groups,
            "eligibility_criteria": s.eligibility_criteria,
            "benefits": s.benefits,
            "required_documents": s.required_documents,
            "official_portal": s.official_portal,
            "application_steps": s.application_steps,
        })

    # Prepare Gemini prompt
    system_prompt = """You are the CivicOS Government Welfare Schemes & Citizen Benefits Assistant.
Your mission is to help Indian citizens discover and apply for genuine welfare schemes they may qualify for.

STRICT ACCURACY RULES:
1. ONLY recommend and reference schemes present in the provided VERIFIED SCHEMES CATALOG.
2. NEVER invent government schemes, benefits, eligibility rules, or application URLs.
3. Use respectful, helpful, and accessible language.
4. Never state guaranteed eligibility; use 'You may be eligible' or 'Based on your profile, you qualify to apply'.
5. Return ONLY valid JSON adhering strictly to this schema:
{
  "answer": "A clear, empathetic 1-2 paragraph summary answering the citizen's query in simple terms.",
  "matched_scheme_ids": [1, 2],
  "personalized_reasons": {
    "1": "Short explanation of why citizen may qualify for scheme 1 based on their query.",
    "2": "Short explanation of why citizen may qualify for scheme 2."
  },
  "suggested_prompts": ["Prompt 1", "Prompt 2", "Prompt 3"]
}
"""

    user_prompt = f"""CITIZEN QUERY:
"{req.query}"

CITIZEN PROFILE:
{json.dumps(req.citizen_profile or {}, indent=2)}

PREFERRED LANGUAGE:
{req.language} (If 'ta', please write the 'answer' in clean, clear Tamil and suggested prompts in Tamil; otherwise English).

VERIFIED SCHEMES CATALOG (SOURCE OF TRUTH):
{json.dumps(scheme_catalog_context, indent=2)}
"""

    api_key = settings.GEMINI_API_KEY
    if api_key:
        configured_model = (settings.GEMINI_MODEL or "gemini-3.5-flash-lite").strip().replace("models/", "")
        gemini_result = _call_gemini_welfare_api(
            model_name=configured_model,
            api_key=api_key,
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            timeout_seconds=4.5,
        )
        if gemini_result and isinstance(gemini_result, dict) and "answer" in gemini_result:
            try:
                matched_ids = gemini_result.get("matched_scheme_ids", [])
                reasons_map = gemini_result.get("personalized_reasons", {})
                prompts = gemini_result.get("suggested_prompts", [])
                
                matched_items = []
                for s in schemes:
                    if s.id in matched_ids or str(s.id) in reasons_map:
                        docs = [d.strip() for d in (s.required_documents or "").split(",") if d.strip()]
                        name = s.name_ta if (req.language == "ta" and s.name_ta) else s.name
                        benefits = s.benefits_ta if (req.language == "ta" and s.benefits_ta) else s.benefits
                        steps = s.application_steps_ta if (req.language == "ta" and s.application_steps_ta) else s.application_steps
                        why = str(reasons_map.get(str(s.id), reasons_map.get(s.id, f"Matches your profile for {s.category}.")))
                        
                        matched_items.append(
                            SchemeEligibilityMatchItem(
                                scheme_id=s.id,
                                scheme_code=s.code,
                                scheme_name=name,
                                category=s.category,
                                eligibility_status="LIKELY_ELIGIBLE",
                                confidence=0.92,
                                why_you_qualify=why,
                                benefits_summary=benefits,
                                required_documents=docs,
                                application_steps=steps,
                                official_portal=s.official_portal,
                                source_name=s.source_name,
                                missing_information=[],
                            )
                        )

                if matched_items or gemini_result.get("answer"):
                    return SchemeAssistantResponse(
                        answer=gemini_result["answer"],
                        matches=matched_items,
                        suggested_prompts=prompts if prompts else (
                            ["நான் ஒரு மாணவர்", "நான் ஒரு விவசாயி", "பெண்கள் சுயதொழில் கடன்", "இலவச மருத்துவ காப்பீடு"]
                            if req.language == "ta"
                            else ["What schemes are available for college students?", "Government subsidies for rooftop solar", "Financial aid for small farmers", "Health insurance benefits under Ayushman Bharat"]
                        ),
                        source="GEMINI",
                    )
            except Exception as parse_err:
                logger.warning(f"Error mapping Gemini welfare results: {parse_err}. Using deterministic fallback.")

    # Fallback / Deterministic Discovery
    query_lower = req.query.lower()
    matched_items = []
    
    # Keyword matching against categories and target groups
    for s in schemes:
        match_score = 0.0
        text_to_search = f"{s.name} {s.description} {s.category} {s.target_groups} {s.eligibility_criteria}".lower()
        
        words = re.findall(r'\w+', query_lower)
        matching_words = [w for w in words if len(w) > 3 and w in text_to_search]
        
        # English and Tamil keyword matching
        if ("student" in query_lower or "scholarship" in query_lower or "மாணவ" in query_lower or "கல்வி" in query_lower) and ("student" in s.target_groups or "education" in s.category.lower()):
            match_score += 0.85
        if ("farmer" in query_lower or "agriculture" in query_lower or "விவசாய" in query_lower or "பயிர்" in query_lower) and ("farmer" in s.target_groups or "farmers" in s.category.lower()):
            match_score += 0.85
        if ("woman" in query_lower or "women" in query_lower or "பெண்" in query_lower or "தாய்" in query_lower) and ("women" in s.target_groups or "women" in s.category.lower()):
            match_score += 0.85
        if ("house" in query_lower or "housing" in query_lower or "வீடு" in query_lower or "வீட்டு" in query_lower) and ("housing" in s.category.lower() or "house" in text_to_search or "வீடு" in text_to_search):
            match_score += 0.85
        if ("senior" in query_lower or "elderly" in query_lower or "pension" in query_lower or "முதியோர்" in query_lower or "ஓய்வூதிய" in query_lower) and ("senior" in text_to_search or "pension" in text_to_search or "முதியோர்" in text_to_search):
            match_score += 0.85
        if ("solar" in query_lower or "electricity" in query_lower or "மின்சாரம்" in query_lower or "சூரிய" in query_lower) and ("solar" in text_to_search or "electricity" in text_to_search or "மின்சார" in text_to_search):
            match_score += 0.85
        if ("health" in query_lower or "medical" in query_lower or "hospital" in query_lower or "மருத்துவ" in query_lower or "சிகிச்சை" in query_lower) and ("health" in s.category.lower() or "medical" in text_to_search or "மருத்துவ" in text_to_search):
            match_score += 0.85
        if ("loan" in query_lower or "business" in query_lower or "vendor" in query_lower or "கடன்" in query_lower or "வியாபார" in query_lower or "தொழில்" in query_lower) and ("employment" in s.category.lower() or "loan" in text_to_search or "கடன்" in text_to_search or "women" in s.category.lower()):
            match_score += 0.85
            
        if len(matching_words) > 0:
            match_score += len(matching_words) * 0.15

        if match_score > 0.3:
            docs = [d.strip() for d in (s.required_documents or "").split(",") if d.strip()]
            name = s.name_ta if (req.language == "ta" and s.name_ta) else s.name
            benefits = s.benefits_ta if (req.language == "ta" and s.benefits_ta) else s.benefits
            steps = s.application_steps_ta if (req.language == "ta" and s.application_steps_ta) else s.application_steps
            why = f"Matches your search criteria for {s.category}. Key benefits: {s.benefits[:100]}..." if req.language != "ta" else f"உங்கள் தேடல் விவரங்களுடன் பொருந்துகிறது. பலன்கள்: {benefits[:100]}..."

            matched_items.append(
                SchemeEligibilityMatchItem(
                    scheme_id=s.id,
                    scheme_code=s.code,
                    scheme_name=name,
                    category=s.category,
                    eligibility_status="LIKELY_ELIGIBLE",
                    confidence=min(0.95, round(match_score, 2)),
                    why_you_qualify=why,
                    benefits_summary=benefits,
                    required_documents=docs,
                    application_steps=steps,
                    official_portal=s.official_portal,
                    source_name=s.source_name,
                    missing_information=[],
                )
            )

    matched_items.sort(key=lambda x: x.confidence, reverse=True)
    top_matches = matched_items[:4] if matched_items else []

    if req.language == "ta":
        answer = f"உங்கள் கேள்விக்கு தொடர்புடைய {len(top_matches)} அரசு நலத்திட்டங்கள் கண்டறியப்பட்டுள்ளன. விண்ணப்பிக்கும் முறைகள் மற்றும் ஆவணங்களை கீழே காண்க." if top_matches else "உங்கள் கேள்விக்கு நேரடியாக பொருந்தும் திட்டங்கள் கிடைக்கவில்லை. பிற வகை அல்லது விவரங்களை தேர்வு செய்யவும்."
        suggested = ["நான் ஒரு மாணவர்", "நான் ஒரு விவசாயி", "பெண்கள் சுயதொழில் கடன்", "இலவச மருத்துவ காப்பீடு"]
    else:
        answer = f"Found {len(top_matches)} government welfare schemes that match your query. Review eligibility criteria, required documents, and official application portals below." if top_matches else "No exact scheme matches found for your query. Try searching by specific category (Students, Farmers, Housing, Women, Health)."
        suggested = ["What schemes are available for college students?", "Government subsidies for rooftop solar", "Financial aid for small farmers", "Health insurance benefits under Ayushman Bharat"]

    return SchemeAssistantResponse(
        answer=answer,
        matches=top_matches,
        suggested_prompts=suggested,
        source="FALLBACK",
    )
