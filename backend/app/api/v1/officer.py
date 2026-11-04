from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models.user import User
from app.db.models.grievance import Grievance
from app.db.models.grievance_update import GrievanceUpdate
from app.schemas.grievance import (
    GrievanceOut,
    GrievanceDetailOut,
    GrievanceStatusPatch,
)
from app.api.deps import get_current_officer
from app.services.n8n_service import dispatch_grievance_event


router = APIRouter(prefix="/officer", tags=["Officer Operations"])


@router.get("/grievances", response_model=List[GrievanceOut])
def list_officer_grievances(
    status_filter: Optional[str] = Query(None, alias="status"),
    department_filter: Optional[str] = Query(None, alias="department"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    current_officer: User = Depends(get_current_officer),
    db: Session = Depends(get_db)
):
    """
    List grievances for government officers.
    Officers can filter by status, department, and priority.
    """
    query = db.query(Grievance)

    # If officer has an assigned department, default or allow filtering
    if department_filter:
        query = query.filter(Grievance.department == department_filter)
    elif current_officer.department:
        # By default show grievances matching officer's department or unassigned
        query = query.filter(
            (Grievance.department == current_officer.department) |
            (Grievance.department == "Municipal_Corp")
        )

    if status_filter:
        query = query.filter(Grievance.status == status_filter.upper())
    
    if priority_filter:
        query = query.filter(Grievance.priority == priority_filter.upper())

    return query.order_by(Grievance.created_at.desc()).all()


@router.get("/grievances/{grievance_id}", response_model=GrievanceDetailOut)
def get_officer_grievance_detail(
    grievance_id: str,
    current_officer: User = Depends(get_current_officer),
    db: Session = Depends(get_db)
):
    """Retrieve complete grievance details with full audit timeline for departmental officer review."""
    if grievance_id.isdigit():
        grievance = db.query(Grievance).filter(Grievance.id == int(grievance_id)).first()
    else:
        grievance = db.query(Grievance).filter(Grievance.tracking_id == grievance_id).first()

    if not grievance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Grievance '{grievance_id}' was not found.",
        )

    return grievance


@router.patch("/grievances/{grievance_id}/status", response_model=GrievanceDetailOut)
def update_grievance_status(
    grievance_id: str,
    status_patch: GrievanceStatusPatch,
    background_tasks: BackgroundTasks,
    current_officer: User = Depends(get_current_officer),
    db: Session = Depends(get_db)
):
    """
    Update the status of a grievance (e.g. IN_PROGRESS, RESOLVED, REJECTED)
    and create an immutable audit trail entry with officer remarks.
    """
    if grievance_id.isdigit():
        grievance = db.query(Grievance).filter(Grievance.id == int(grievance_id)).first()
    else:
        grievance = db.query(Grievance).filter(Grievance.tracking_id == grievance_id).first()

    if not grievance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Grievance '{grievance_id}' was not found.",
        )

    normalized_status = status_patch.status.upper()
    valid_statuses = ["SUBMITTED", "TRIAGED", "IN_PROGRESS", "RESOLVED", "REJECTED"]
    if normalized_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{status_patch.status}'. Allowed statuses: {valid_statuses}",
        )

    # Update grievance record
    grievance.status = normalized_status
    grievance.assigned_officer_id = current_officer.id
    grievance.updated_at = datetime.now(timezone.utc)

    # Insert audit entry
    update_log = GrievanceUpdate(
        grievance_id=grievance.id,
        officer_id=current_officer.id,
        status=normalized_status,
        remarks=status_patch.remarks or f"Status updated to {normalized_status} by Officer {current_officer.name}",
    )
    db.add(update_log)
    db.commit()
    db.refresh(grievance)

    # Dispatch n8n automation event (non-blocking background task, failsafe)
    status_event = "GRIEVANCE_RESOLVED" if normalized_status == "RESOLVED" else "GRIEVANCE_STATUS_CHANGED"
    background_tasks.add_task(
        dispatch_grievance_event,
        grievance=grievance,
        event_type=status_event,
        latest_remarks=update_log.remarks,
    )

    return grievance

