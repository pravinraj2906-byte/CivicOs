import json
import logging
import os
import re
import time
import urllib.parse
from typing import Optional, Tuple, List
import httpx
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.ai import (
    AllowedCategory,
    AllowedDepartment,
    AllowedPriority,
    GrievanceTriageResult,
)

logger = logging.getLogger("civicos.gemini")

# Category mapping to responsible department
CATEGORY_TO_DEPARTMENT = {
    AllowedCategory.ROADS_INFRASTRUCTURE.value: AllowedDepartment.PUBLIC_WORKS.value,
    AllowedCategory.WATER_SANITATION.value: AllowedDepartment.WATER_SANITATION.value,
    AllowedCategory.ELECTRICITY_ENERGY.value: AllowedDepartment.ELECTRICITY_BOARD.value,
    AllowedCategory.PUBLIC_HEALTH.value: AllowedDepartment.HEALTH_DEPT.value,
    AllowedCategory.WASTE_MANAGEMENT.value: AllowedDepartment.MUNICIPAL_CORP.value,
}

SYSTEM_INSTRUCTION = """You are an AI civic grievance triage assistant for CivicOS.
Your job is:
1. Understand the citizen's complaint.
2. Identify the primary issue.
3. Select the appropriate category from ONLY:
   - Roads & Infrastructure
   - Water & Sanitation
   - Electricity & Energy
   - Public Health
   - Waste Management
4. Select the appropriate department from ONLY:
   - Public_Works
   - Water_Sanitation
   - Electricity_Board
   - Health_Dept
   - Municipal_Corp
5. Determine priority from ONLY:
   - LOW
   - MEDIUM
   - HIGH
   - CRITICAL
6. Calculate an urgency score between 0.0 and 1.0 (float).
7. Produce a concise 1-2 sentence executive summary.
8. Recommend the first appropriate departmental action.
9. Extract key entities (location names, landmarks, equipment, issue identifiers) as a list of strings.

Rules:
- Do not invent facts or assume government actions have occurred.
- Do not provide legal advice or fabricate policies.
- You must return ONLY valid JSON matching this schema:
{
  "category": "...",
  "assigned_department": "...",
  "priority": "LOW | MEDIUM | HIGH | CRITICAL",
  "urgency_score": 0.85,
  "summary": "...",
  "suggested_initial_action": "...",
  "key_entities": ["..."]
}
- Be conservative when information is uncertain.
"""


def classify_grievance_fallback(
    title: str,
    description: str,
    location: Optional[str] = None,
    landmark: Optional[str] = None,
    user_category: Optional[str] = None,
) -> GrievanceTriageResult:
    """
    Deterministic rule-based fallback classifier for civic grievances.
    Ensures 100% demo and test reliability when AI service is unavailable,
    unconfigured, timed out, or returns invalid schemas.
    """
    combined_text = f"{title} {description} {location or ''} {landmark or ''} {user_category or ''}".lower()

    # 1. Category and Department Detection
    category_keywords = {
        AllowedCategory.WASTE_MANAGEMENT.value: [
            "garbage", "waste", "trash", "dump", "debris", "litter", "sweep",
            "bin", "refuse", "compost", "stench", "smell", "rotting", "stink",
            "cleaning", "sweeper", "dustbin"
        ],
        AllowedCategory.WATER_SANITATION.value: [
            "water", "pipe", "leak", "drainage", "sewage", "flood", "drain",
            "sewer", "contamination", "pipeline", "tap", "valve", "clog", "gutter",
            "overflow", "canal", "drinking water", "manhole overflow", "bwssb", "supply"
        ],
        AllowedCategory.ELECTRICITY_ENERGY.value: [
            "electricity", "power", "transformer", "wire", "blackout", "pole",
            "voltage", "current", "spark", "shock", "generator", "outage", "cable",
            "streetlight", "street light", "short circuit", "bescom"
        ],
        AllowedCategory.PUBLIC_HEALTH.value: [
            "hospital", "disease", "health", "mosquito", "dengue", "malaria",
            "epidemic", "clinic", "doctor", "hygiene", "fever", "outbreak",
            "fogging", "larvae", "infection", "phc"
        ],
        AllowedCategory.ROADS_INFRASTRUCTURE.value: [
            "road", "pothole", "street", "bridge", "footpath", "traffic", "pavement",
            "sidewalk", "divider", "asphalt", "tar", "flyover", "signal", "zebra crossing",
            "bbmp", "crater"
        ],
    }

    scores = {}
    for cat, keywords in category_keywords.items():
        score = sum(1 for kw in keywords if kw in combined_text)
        scores[cat] = score

    best_category = max(scores, key=scores.get)
    if scores[best_category] == 0:
        # Fallback to user_category if valid, else default to Roads & Infrastructure
        if user_category and user_category in CATEGORY_TO_DEPARTMENT:
            best_category = user_category
        else:
            best_category = AllowedCategory.ROADS_INFRASTRUCTURE.value

    best_dept = CATEGORY_TO_DEPARTMENT.get(best_category, AllowedDepartment.PUBLIC_WORKS.value)

    # 2. Priority & Urgency Calculation
    critical_keywords = [
        "emergency", "danger", "burst", "fire", "sparking", "electrocution",
        "collapsed", "fatal", "disaster", "hazard", "casualty", "life-threatening", "critical"
    ]
    high_keywords = [
        "severe", "urgent", "flooding", "flood", "overflow", "blackout", "foul smell",
        "strong smell", "exposed", "exposed wire", "epidemic", "outbreak", "school",
        "hospital", "four days", "two days", "3 days", "days", "accident", "risk", "hazard",
        "power failure", "no electricity", "power outage", "entire area", "yesterday",
        "no water", "interruption", "water supply", "several families"
    ]
    medium_keywords = [
        "broken", "damage", "damaged", "leak", "leaking", "blocked", "difficulty",
        "pothole", "delay", "not working", "repair", "issue", "problem"
    ]

    if any(kw in combined_text for kw in critical_keywords):
        priority = AllowedPriority.CRITICAL.value
        urgency_score = 0.92
    elif any(kw in combined_text for kw in high_keywords):
        priority = AllowedPriority.HIGH.value
        urgency_score = 0.82
    elif any(kw in combined_text for kw in medium_keywords):
        priority = AllowedPriority.MEDIUM.value
        urgency_score = 0.60
    else:
        priority = AllowedPriority.LOW.value
        urgency_score = 0.35

    # 3. Suggested Initial Action
    action_templates = {
        AllowedCategory.WASTE_MANAGEMENT.value: "Deploy municipal sanitation vehicle and waste clearance crew for immediate collection.",
        AllowedCategory.WATER_SANITATION.value: "Dispatch water supply & sanitation field engineers to inspect pipeline/drainage and isolate issue.",
        AllowedCategory.ROADS_INFRASTRUCTURE.value: "Dispatch public works road maintenance crew for immediate on-site inspection and asphalt patch repair.",
        AllowedCategory.ELECTRICITY_ENERGY.value: "Dispatch electricity board line maintenance crew and inspect equipment/cables for safety.",
        AllowedCategory.PUBLIC_HEALTH.value: "Alert local public health officer and schedule sanitation/fumigation team inspection.",
    }
    suggested_action = action_templates.get(
        best_category,
        "Dispatch departmental inspection team to assess the site."
    )

    # 4. Key Entities Extraction
    entities = []
    if location:
        entities.append(location)
    if landmark:
        entities.append(landmark)

    # Extract capitalized location/subject words or salient nouns
    words = re.findall(r'\b[A-Z][a-z0-9]+\b', f"{title} {description}")
    for word in words:
        if word not in entities and word.lower() not in {"the", "and", "our", "this", "there", "has", "been", "near"}:
            entities.append(word)

    # 5. Summary Generation
    summary = f"{title.strip()}. {description.strip()}"
    if len(summary) > 180:
        summary = summary[:177] + "..."

    return GrievanceTriageResult(
        category=best_category,
        assigned_department=best_dept,
        priority=priority,
        urgency_score=urgency_score,
        summary=summary,
        suggested_initial_action=suggested_action,
        key_entities=entities[:5],
    )


def _call_gemini_api(
    model_name: str,
    api_key: str,
    title: str,
    description: str,
    location: Optional[str] = None,
    landmark: Optional[str] = None,
    user_category: Optional[str] = None,
) -> Optional[GrievanceTriageResult]:
    """
    Executes a single generateContent request to a specified Gemini model.
    Logs only the safe host and path (never the API key).
    Returns GrievanceTriageResult on success or None on failure.
    """
    clean_model = model_name.strip().replace("models/", "")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{clean_model}:generateContent?key={api_key}"

    logger.info(
        f"Connecting to Gemini API: Host='generativelanguage.googleapis.com', "
        f"Path='/v1beta/models/{clean_model}:generateContent'"
    )

    user_prompt = f"""Citizen Grievance to Triage:
Title: {title}
Description: {description}
Location: {location or 'Not specified'}
Landmark: {landmark or 'Not specified'}
User Suggested Category: {user_category or 'None'}

Please analyze this civic issue and return the structured JSON triage result according to the schema.
"""

    gen_config = {
        "temperature": 0.1,
        "max_output_tokens": 2048,
        "response_mime_type": "application/json",
    }
    if "flash" in clean_model:
        gen_config["thinkingConfig"] = {"thinkingBudget": 0}

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": f"{SYSTEM_INSTRUCTION}\n\n{user_prompt}"
                    }
                ]
            }
        ],
        "generationConfig": gen_config
    }

    try:
        with httpx.Client(timeout=18.0, trust_env=False) as client:
            response = client.post(
                url,
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "x-goog-api-key": api_key,
                }
            )

        if response.status_code != 200:
            logger.warning(
                f"Gemini API model '{clean_model}' returned HTTP status {response.status_code}: {response.text[:160]}"
            )
            return None

        resp_json = response.json()
        candidates = resp_json.get("candidates", [])
        if not candidates:
            logger.warning(f"Gemini response for model '{clean_model}' contained no candidates.")
            return None

        content_parts = candidates[0].get("content", {}).get("parts", [])
        if not content_parts or "text" not in content_parts[0]:
            logger.warning(f"Gemini response for model '{clean_model}' contained no text part.")
            return None

        raw_text = content_parts[0]["text"]
        cleaned_text = raw_text.strip()
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[7:]
        elif cleaned_text.startswith("```"):
            cleaned_text = cleaned_text[3:]
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[:-3]
        cleaned_text = cleaned_text.strip()

        try:
            parsed_data = json.loads(cleaned_text)
        except json.JSONDecodeError:
            match = re.search(r'\{.*\}', cleaned_text, re.DOTALL)
            if match:
                parsed_data = json.loads(match.group(0))
            else:
                raise

        triage_result = GrievanceTriageResult.model_validate(parsed_data)
        logger.info(
            f"Gemini triage successful using model '{clean_model}': Category='{triage_result.category}', "
            f"Dept='{triage_result.assigned_department}', Priority='{triage_result.priority}'"
        )
        return triage_result

    except (json.JSONDecodeError, ValueError, ValidationError) as val_err:
        logger.warning(f"Gemini output for model '{clean_model}' failed validation: {val_err}")
        return None
    except (httpx.TimeoutException, httpx.RequestError) as net_err:
        logger.warning(f"HTTPX error on model '{clean_model}': {net_err}")
        return None
    except Exception as exc:
        logger.error(f"Unexpected error calling Gemini model '{clean_model}': {exc}")
        return None


def triage_grievance(
    title: str,
    description: str,
    location: Optional[str] = None,
    landmark: Optional[str] = None,
    user_category: Optional[str] = None,
) -> Tuple[GrievanceTriageResult, str]:
    """
    Analyzes a civic grievance using Google Gemini AI structured output.
    Returns a tuple of (GrievanceTriageResult, source) where source is 'GEMINI' or 'FALLBACK'.
    
    Guarantees:
    - Never raises unhandled exceptions to route callers.
    - Falls back to deterministic rule-based triage if API key is missing,
      network times out, or output schema validation fails.
    - Never modifies the database directly.
    - Protects the API key from appearing in logs or error traces.
    """
    # 1. Resolve and validate API key
    raw_api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    api_key = raw_api_key.strip().strip("'\"") if raw_api_key else None

    if not api_key:
        logger.info("GEMINI_API_KEY is not configured. Utilizing deterministic rule-based fallback.")
        fallback_result = classify_grievance_fallback(title, description, location, landmark, user_category)
        return fallback_result, "FALLBACK"

    configured_model = (settings.GEMINI_MODEL or "gemini-3.5-flash-lite").strip().replace("models/", "")
    
    # 2. Try configured model first
    triage_result = _call_gemini_api(
        model_name=configured_model,
        api_key=api_key,
        title=title,
        description=description,
        location=location,
        landmark=landmark,
        user_category=user_category,
    )
    if triage_result is not None:
        return triage_result, "GEMINI"

    # 3. If configured model failed (e.g. rate limit / 429 / 404) and is a known Google model,
    # attempt backup supported lite/flash models
    known_models = ["gemini-2.5-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.6-flash"]
    if configured_model in known_models:
        for backup_model in ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.5-flash"]:
            if backup_model != configured_model:
                logger.info(f"Retrying grievance triage with backup model: {backup_model}")
                triage_result = _call_gemini_api(
                    model_name=backup_model,
                    api_key=api_key,
                    title=title,
                    description=description,
                    location=location,
                    landmark=landmark,
                    user_category=user_category,
                )
                if triage_result is not None:
                    return triage_result, "GEMINI"

    # All attempts exhausted -> deterministic fallback
    logger.warning("Gemini AI unavailable. Engaging deterministic fallback.")
    return classify_grievance_fallback(title, description, location, landmark, user_category), "FALLBACK"
