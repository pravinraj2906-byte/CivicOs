from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models.user import User
from app.db.models.citizen_profile import CitizenProfile
from app.db.models.grievance import Grievance
from app.db.models.grievance_update import GrievanceUpdate
from app.db.models.scheme import Scheme
from app.schemas.citizen_profile import (
    CitizenProfileUpdate,
    CitizenProfileOut,
    CitizenWithProfileOut,
)
from app.schemas.grievance import GrievanceOut, GrievanceDetailOut, GrievanceFeedbackIn
from app.schemas.scheme import (
    SchemeRecommendationResponse,
    SchemeRecommendationItem,
)
from app.api.deps import get_current_citizen
from app.services.n8n_service import dispatch_grievance_event

router = APIRouter(prefix="/citizens", tags=["Citizens"])


@router.get("/me", response_model=CitizenWithProfileOut)
def get_current_citizen_details(
    current_citizen: User = Depends(get_current_citizen),
    db: Session = Depends(get_db)
):
    """Retrieve the current citizen user account along with their Citizen Twin profile."""
    profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == current_citizen.id).first()
    
    # Return composed response
    return CitizenWithProfileOut(
        id=current_citizen.id,
        name=current_citizen.name,
        email=current_citizen.email,
        role=current_citizen.role,
        department=current_citizen.department,
        state=current_citizen.state,
        district=current_citizen.district,
        preferred_language=current_citizen.preferred_language,
        created_at=current_citizen.created_at,
        profile=CitizenProfileOut.model_validate(profile) if profile else None,
    )


@router.put("/me/profile", response_model=CitizenProfileOut)
def update_citizen_profile(
    profile_in: CitizenProfileUpdate,
    current_citizen: User = Depends(get_current_citizen),
    db: Session = Depends(get_db)
):
    """Update or initialize the citizen's Citizen Twin socio-economic attributes."""
    profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == current_citizen.id).first()
    if not profile:
        profile = CitizenProfile(user_id=current_citizen.id)
        db.add(profile)

    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/me/grievances", response_model=List[GrievanceOut])
def get_my_grievances(
    current_citizen: User = Depends(get_current_citizen),
    db: Session = Depends(get_db)
):
    """Get all grievances submitted by the currently logged-in citizen."""
    grievances = (
        db.query(Grievance)
        .filter(Grievance.citizen_id == current_citizen.id)
        .order_by(Grievance.created_at.desc())
        .all()
    )
    return grievances


@router.get("/me/recommendations", response_model=SchemeRecommendationResponse)
def get_scheme_recommendations(
    current_citizen: User = Depends(get_current_citizen),
    db: Session = Depends(get_db)
):
    """
    Get personalized government welfare scheme recommendations based on Citizen Twin context.
    Note: Phase 1 provides seeded/mock recommendations adhering to the Gemini contract.
    Gemini LLM live matching will be activated in Phase 2.
    """
    profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == current_citizen.id).first()
    schemes = db.query(Scheme).filter(Scheme.is_active == True).limit(5).all()

    # Formulate demographic summary
    age_str = f"{profile.age} yrs" if profile and profile.age else "Adult"
    occ_str = profile.occupation if profile and profile.occupation else "Citizen"
    loc_str = profile.location if profile and profile.location else (current_citizen.district or "Urban")
    context_summary = f"{age_str} • {occ_str} • {loc_str}"

    # Build recommendations matching the citizen's context
    recommendations: List[SchemeRecommendationItem] = []
    
    if schemes:
        for idx, scheme in enumerate(schemes):
            # Dynamic mock scoring based on profile
            confidence = 0.95 - (idx * 0.05)
            why_qualify = (
                f"Matches your profile as a {occ_str} residing in {loc_str}. "
                f"Eligibility criteria for {scheme.name} align with your demographic profile."
            )
            
            recommendations.append(
                SchemeRecommendationItem(
                    scheme_id=scheme.id,
                    scheme_code=scheme.code,
                    scheme_name=scheme.name,
                    category=scheme.category,
                    match_confidence=round(confidence, 2),
                    why_you_qualify=why_qualify,
                    potential_benefits=scheme.benefits or "Financial subsidy and technical assistance.",
                    application_steps="Submit standard application online via the state portal."
                )
            )
    else:
        # Fallback if no schemes in DB
        recommendations.append(
            SchemeRecommendationItem(
                scheme_id=1,
                scheme_code="SCH_001",
                scheme_name="PM Surya Ghar: Muft Bijli Yojana",
                category="Energy & Sustainability",
                match_confidence=0.92,
                why_you_qualify="Eligible for residential rooftop solar installation subsidies.",
                potential_benefits="Up to ₹78,000 subsidy on solar panel installation.",
                application_steps="Apply on National Portal with electricity bill."
            )
        )

    return SchemeRecommendationResponse(
        citizen_id=current_citizen.id,
        generated_at=datetime.now(timezone.utc),
        citizen_context_summary=context_summary,
        recommendations=recommendations
    )


@router.post("/me/grievances/{grievance_id}/feedback", response_model=GrievanceDetailOut)
def submit_grievance_feedback(
    grievance_id: str,
    feedback_in: GrievanceFeedbackIn,
    background_tasks: BackgroundTasks,
    current_citizen: User = Depends(get_current_citizen),
    db: Session = Depends(get_db)
):
    """
    Citizen provides feedback / confirmation on a resolved grievance.
    Closes the civic loop:
    - If confirmed resolved: records citizen confirmation audit entry.
    - If problem persists: records follow-up audit entry without creating disconnected duplicates.
    """
    if grievance_id.isdigit():
        grievance = db.query(Grievance).filter(
            Grievance.id == int(grievance_id),
            Grievance.citizen_id == current_citizen.id
        ).first()
    else:
        grievance = db.query(Grievance).filter(
            Grievance.tracking_id == grievance_id,
            Grievance.citizen_id == current_citizen.id
        ).first()

    if not grievance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Grievance '{grievance_id}' was not found in your filed reports.",
        )

    # Record feedback audit entry
    if feedback_in.is_resolved:
        remark_text = f"Citizen confirmed resolution: '{feedback_in.comment or 'Confirmed resolved'}' (Rating: {feedback_in.rating or 'YES'})."
        status_tag = "RESOLVED"
    else:
        remark_text = f"Citizen reported issue persists: '{feedback_in.comment or 'Problem continues after resolution attempt'}'. Re-opened for operational follow-up."
        status_tag = "IN_PROGRESS"
        grievance.status = "IN_PROGRESS"  # Re-open in work queue for follow-up
        grievance.updated_at = datetime.now(timezone.utc)

    update_log = GrievanceUpdate(
        grievance_id=grievance.id,
        officer_id=None,
        status=status_tag,
        remarks=remark_text,
    )
    db.add(update_log)
    db.commit()
    db.refresh(grievance)

    # Dispatch n8n event
    background_tasks.add_task(
        dispatch_grievance_event,
        grievance=grievance,
        event_type="GRIEVANCE_FEEDBACK",
        latest_remarks=remark_text,
    )

    return grievance
