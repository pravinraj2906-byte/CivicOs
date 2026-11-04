from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.database import get_db
from app.db.models.scheme import Scheme
from app.schemas.scheme import (
    SchemeOut,
    SchemeDetailOut,
    SchemeEligibilityCheckRequest,
    SchemeEligibilityCheckResponse,
    SchemeAssistantRequest,
    SchemeAssistantResponse,
)
from app.services.scheme_service import (
    get_scheme_matches_deterministic,
    query_scheme_assistant,
)

router = APIRouter(prefix="/schemes", tags=["Welfare Schemes & Benefits"])


@router.get("", response_model=List[SchemeOut])
def list_schemes(
    category: Optional[str] = Query(None, description="Filter by scheme category"),
    state: Optional[str] = Query(None, description="Filter by state or All-India"),
    target_group: Optional[str] = Query(None, description="Filter by target group e.g. students, farmers, women"),
    search: Optional[str] = Query(None, description="Search query across name and description"),
    language: Optional[str] = Query("en", description="Language code: en or ta"),
    db: Session = Depends(get_db)
):
    """
    List all active verified government welfare schemes with optional filters.
    Returns structured scheme details including official application portals.
    """
    query = db.query(Scheme).filter(Scheme.is_active == True)
    
    if category and category.upper() != "ALL":
        query = query.filter(Scheme.category == category)
        
    if state:
        query = query.filter((Scheme.state == state) | (Scheme.state == "All-India"))

    if target_group:
        query = query.filter(Scheme.target_groups.ilike(f"%{target_group}%"))

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            (Scheme.name.ilike(term)) |
            (Scheme.description.ilike(term)) |
            (Scheme.category.ilike(term)) |
            (Scheme.name_ta.ilike(term)) |
            (Scheme.description_ta.ilike(term))
        )

    schemes = query.all()
    results = []
    
    for s in schemes:
        # Localize fields if language == "ta"
        name = s.name_ta if (language == "ta" and s.name_ta) else s.name
        desc = s.description_ta if (language == "ta" and s.description_ta) else s.description
        benefits = s.benefits_ta if (language == "ta" and s.benefits_ta) else s.benefits
        eligibility = s.eligibility_criteria_ta if (language == "ta" and s.eligibility_criteria_ta) else s.eligibility_criteria
        steps = s.application_steps_ta if (language == "ta" and s.application_steps_ta) else s.application_steps

        target_list = [t.strip() for t in (s.target_groups or "").split(",") if t.strip()]
        doc_list = [d.strip() for d in (s.required_documents or "").split(",") if d.strip()]

        results.append(
            SchemeOut(
                id=s.id,
                code=s.code,
                name=name,
                description=desc,
                state=s.state,
                category=s.category,
                department=s.department,
                target_groups=s.target_groups,
                eligibility_criteria=eligibility,
                eligibility_rules=s.eligibility_rules,
                benefits=benefits,
                required_documents=s.required_documents,
                official_portal=s.official_portal,
                application_steps=steps,
                source_name=s.source_name,
                source_url=s.source_url,
                last_verified=s.last_verified,
                name_ta=s.name_ta,
                description_ta=s.description_ta,
                benefits_ta=s.benefits_ta,
                eligibility_criteria_ta=s.eligibility_criteria_ta,
                application_steps_ta=s.application_steps_ta,
                is_active=s.is_active,
                created_at=s.created_at,
                target_groups_list=target_list,
                required_documents_list=doc_list,
            )
        )
    return results


@router.get("/{scheme_id}", response_model=SchemeDetailOut)
def get_scheme(
    scheme_id: int,
    language: Optional[str] = Query("en", description="Language code: en or ta"),
    db: Session = Depends(get_db)
):
    """Get full details of a verified government welfare scheme."""
    s = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not s:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scheme with ID {scheme_id} was not found.",
        )

    name = s.name_ta if (language == "ta" and s.name_ta) else s.name
    desc = s.description_ta if (language == "ta" and s.description_ta) else s.description
    benefits = s.benefits_ta if (language == "ta" and s.benefits_ta) else s.benefits
    eligibility = s.eligibility_criteria_ta if (language == "ta" and s.eligibility_criteria_ta) else s.eligibility_criteria
    steps = s.application_steps_ta if (language == "ta" and s.application_steps_ta) else s.application_steps

    target_list = [t.strip() for t in (s.target_groups or "").split(",") if t.strip()]
    doc_list = [d.strip() for d in (s.required_documents or "").split(",") if d.strip()]

    return SchemeDetailOut(
        id=s.id,
        code=s.code,
        name=name,
        description=desc,
        state=s.state,
        category=s.category,
        department=s.department,
        target_groups=s.target_groups,
        eligibility_criteria=eligibility,
        eligibility_rules=s.eligibility_rules,
        benefits=benefits,
        required_documents=s.required_documents,
        official_portal=s.official_portal,
        application_steps=steps,
        source_name=s.source_name,
        source_url=s.source_url,
        last_verified=s.last_verified,
        name_ta=s.name_ta,
        description_ta=s.description_ta,
        benefits_ta=s.benefits_ta,
        eligibility_criteria_ta=s.eligibility_criteria_ta,
        application_steps_ta=s.application_steps_ta,
        is_active=s.is_active,
        created_at=s.created_at,
        target_groups_list=target_list,
        required_documents_list=doc_list,
    )


@router.post("/eligibility", response_model=SchemeEligibilityCheckResponse)
def check_eligibility(
    payload: SchemeEligibilityCheckRequest,
    db: Session = Depends(get_db)
):
    """
    Evaluates citizen demographic and socio-economic attributes against controlled scheme rules.
    Returns matched schemes with confidence scores and personalized explanations.
    """
    matches = get_scheme_matches_deterministic(db, payload)
    
    # Generate demographic summary
    age_part = f"{payload.age} yrs" if payload.age else "Adult"
    occ_part = payload.occupation or ("Student" if payload.is_student else ("Farmer" if payload.is_farmer else "Citizen"))
    loc_part = f"{payload.district or payload.state or 'Karnataka'} ({payload.residence_type or 'Urban'})"
    summary = f"{age_part} • {occ_part} • {loc_part}"

    explanation = (
        f"Evaluated {len(matches)} potential government welfare matches for your profile. "
        "Review specific scheme benefits and required documents to begin your application."
    )
    if payload.language == "ta":
        explanation = f"உங்கள் விவரங்களுக்கு {len(matches)} அரசு நலத்திட்டங்கள் கண்டறியப்பட்டுள்ளன. பலன்கள் மற்றும் ஆவணங்களை சரிபார்த்து விண்ணப்பிக்கவும்."

    return SchemeEligibilityCheckResponse(
        citizen_context_summary=summary,
        matches=matches,
        explanation=explanation,
        source="GEMINI" if settings.GEMINI_API_KEY else "FALLBACK",
    )


@router.post("/assistant", response_model=SchemeAssistantResponse)
def scheme_assistant(
    payload: SchemeAssistantRequest,
    db: Session = Depends(get_db)
):
    """
    AI Benefits Assistant: Discovers and explains welfare schemes for natural-language queries.
    Uses controlled/verified scheme records as grounded knowledge source of truth.
    """
    if not payload.query.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Query cannot be empty.",
        )
    return query_scheme_assistant(db, payload)
