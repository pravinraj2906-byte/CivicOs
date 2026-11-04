import json
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models.user import User
from app.db.models.grievance import Grievance
from app.db.models.grievance_update import GrievanceUpdate
from app.schemas.grievance import (
    GrievanceCreate,
    GrievanceDetailOut,
)
from app.api.deps import get_current_user, get_current_citizen
from app.services.gemini_service import triage_grievance
from app.services.n8n_service import dispatch_grievance_event


router = APIRouter(prefix="/grievances", tags=["Grievances"])


def generate_tracking_id() -> str:
    """Generate a clean, readable tracking ID for civic grievances."""
    short_uuid = uuid.uuid4().hex[:6].upper()
    return f"GRV-2026-{short_uuid}"



@router.post("", response_model=GrievanceDetailOut, status_code=status.HTTP_201_CREATED)
def submit_grievance(
    grievance_in: GrievanceCreate,
    background_tasks: BackgroundTasks,
    current_citizen: User = Depends(get_current_citizen),
    db: Session = Depends(get_db)
):
    """
    Citizen submits a new civic complaint.
    Automatically analyzed and triaged by the Gemini AI Intelligence Layer.
    Stores AI-assigned category, department, priority, urgency score, summary, and action,
    setting initial status to 'TRIAGED'.
    """
    tracking_id = generate_tracking_id()
    
    # Run AI triage (with guaranteed deterministic fallback)
    triage_result, ai_source = triage_grievance(
        title=grievance_in.title,
        description=grievance_in.description,
        location=grievance_in.location,
        landmark=grievance_in.landmark,
        user_category=grievance_in.category,
    )

    new_grievance = Grievance(
        tracking_id=tracking_id,
        citizen_id=current_citizen.id,
        title=grievance_in.title,
        description=grievance_in.description,
        location=grievance_in.location,
        landmark=grievance_in.landmark,
        category=triage_result.category,
        priority=triage_result.priority,
        department=triage_result.assigned_department,
        status="TRIAGED",
        ai_summary=triage_result.summary,
        urgency_score=triage_result.urgency_score,
        suggested_initial_action=triage_result.suggested_initial_action,
        key_entities=json.dumps(triage_result.key_entities),
        ai_source=ai_source,
    )
    db.add(new_grievance)
    db.commit()
    db.refresh(new_grievance)

    # 1. Record initial submission audit entry
    submission_log = GrievanceUpdate(
        grievance_id=new_grievance.id,
        officer_id=None,
        status="SUBMITTED",
        remarks="Grievance submitted by citizen via CivicOS portal.",
    )
    db.add(submission_log)

    # 2. Record AI triage audit entry
    triage_log = GrievanceUpdate(
        grievance_id=new_grievance.id,
        officer_id=None,
        status="TRIAGED",
        remarks=f"Automated AI triage ({ai_source}): Category '{triage_result.category}', Priority '{triage_result.priority}', Dept '{triage_result.assigned_department}'.",
    )
    db.add(triage_log)
    
    db.commit()
    db.refresh(new_grievance)

    # 3. Dispatch n8n automation event (non-blocking background task, failsafe)
    event_type = "GRIEVANCE_CRITICAL" if new_grievance.priority == "CRITICAL" else "GRIEVANCE_CREATED"
    background_tasks.add_task(
        dispatch_grievance_event,
        grievance=new_grievance,
        event_type=event_type,
    )

    return new_grievance



@router.get("/{grievance_id}", response_model=GrievanceDetailOut)
def get_grievance_by_id(
    grievance_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific grievance with its full audit timeline history.
    Accessible by the filing citizen, assigned officer, or admin.
    """
    # Allow querying by either integer ID or tracking ID string
    if grievance_id.isdigit():
        grievance = db.query(Grievance).filter(Grievance.id == int(grievance_id)).first()
    else:
        grievance = db.query(Grievance).filter(Grievance.tracking_id == grievance_id).first()

    if not grievance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Grievance '{grievance_id}' was not found.",
        )

    # Enforce access control
    if current_user.role == "citizen" and grievance.citizen_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this grievance.",
        )

    return grievance
