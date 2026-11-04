import urllib.parse
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models.user import User
from app.db.models.grievance import Grievance
from app.db.models.grievance_update import GrievanceUpdate
from app.db.models.community_confirmation import CommunityConfirmation
from app.schemas.feed import (
    CivicFeedItemOut,
    CivicFeedResponse,
    FeedAuthorOut,
    FeedTimelineEventOut,
    ConfirmationResponse,
)
from app.api.deps import get_optional_current_user, get_current_citizen
from app.services.n8n_service import dispatch_grievance_event

router = APIRouter(prefix="/feed", tags=["Civic Feed"])



def build_safe_author(citizen: Optional[User]) -> FeedAuthorOut:
    """Format public author profile preserving privacy (no email, phone, or private data)."""
    if not citizen:
        return FeedAuthorOut(
            display_name="Citizen",
            avatar_url="https://api.dicebear.com/7.x/initials/svg?seed=Citizen",
            district=None,
            state=None,
        )

    raw_name = (citizen.name or "Citizen").strip()
    parts = raw_name.split()
    if len(parts) >= 2:
        display_name = f"{parts[0]} {parts[1][0]}."
    else:
        display_name = raw_name

    encoded_name = urllib.parse.quote(raw_name)
    avatar_url = f"https://api.dicebear.com/7.x/initials/svg?seed={encoded_name}"

    return FeedAuthorOut(
        display_name=display_name,
        avatar_url=avatar_url,
        district=citizen.district,
        state=citizen.state,
    )


def build_timeline_events(
    updates: List[GrievanceUpdate],
    department: str,
    language: str = "en"
) -> List[FeedTimelineEventOut]:
    """Construct structured living timeline events for public feed representation."""
    events: List[FeedTimelineEventOut] = []
    
    for idx, u in enumerate(updates):
        st = u.status.upper()
        if st == "SUBMITTED" or idx == 0:
            stage = "CITIZEN_REPORT"
            label = "Citizen Report"
            label_ta = "குடிமக்கள் புகார்"
        elif st == "TRIAGED" or (u.remarks and "AI triage" in u.remarks):
            stage = "AI_TRIAGE"
            label = "Automated AI Triage"
            label_ta = "AI வகைப்படுத்தல்"
        elif st == "RESOLVED":
            stage = "RESOLUTION"
            label = "Public Resolution"
            label_ta = "பொது தீர்வு அறிக்கை"
        else:
            stage = "OFFICIAL_UPDATE"
            label = "Official Department Update"
            label_ta = "துறை அதிகாரப்பூர்வ நடவடிக்கை"

        events.append(
            FeedTimelineEventOut(
                id=u.id,
                status=u.status,
                stage=stage,
                label=label_ta if language == "ta" else label,
                label_ta=label_ta,
                remarks=u.remarks,
                department=department,
                created_at=u.created_at,
            )
        )
    return events


def build_feed_item(
    grievance: Grievance,
    current_user: Optional[User] = None,
    language: str = "en"
) -> CivicFeedItemOut:
    """Transform canonical Grievance model into a public CivicFeedItemOut."""
    community_count = len(grievance.confirmations) if grievance.confirmations else 0
    confirmed_by_user = False
    if current_user:
        confirmed_by_user = any(c.citizen_id == current_user.id for c in (grievance.confirmations or []))

    author = build_safe_author(grievance.citizen)
    timeline = build_timeline_events(grievance.updates or [], grievance.department, language=language)

    return CivicFeedItemOut(
        id=grievance.id,
        grievance_id=grievance.id,
        tracking_id=grievance.tracking_id,
        author=author,
        title=grievance.title,
        description=grievance.description,
        location=grievance.location,
        landmark=grievance.landmark,
        category=grievance.category,
        department=grievance.department,
        priority=grievance.priority,
        status=grievance.status,
        urgency_score=grievance.urgency_score,
        ai_summary=grievance.ai_summary,
        suggested_initial_action=grievance.suggested_initial_action,
        key_entities=grievance.key_entities,
        is_verified=True,
        community_count=community_count,
        confirmed_by_current_user=confirmed_by_user,
        created_at=grievance.created_at,
        updated_at=grievance.updated_at,
        timeline=timeline,
    )


@router.get("", response_model=CivicFeedResponse)
def get_civic_feed(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by status: SUBMITTED, TRIAGED, IN_PROGRESS, RESOLVED"),
    category: Optional[str] = Query(None, description="Filter by category"),
    department: Optional[str] = Query(None, description="Filter by department"),
    priority: Optional[str] = Query(None, description="Filter by priority: LOW, MEDIUM, HIGH, CRITICAL"),
    search: Optional[str] = Query(None, description="Search title, description, or location"),
    sort_by: str = Query("recent", description="Sort order: recent | impact | urgency"),
    language: str = Query("en", description="Language code: en | ta"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """
    Public Civic Feed API: Retrieves canonical, community-validated civic posts.
    Includes community confirmation counts, live department updates, and public resolution stories.
    Privacy-by-design: Strips confidential citizen identity and private documents.
    """
    query = db.query(Grievance)

    if status:
        query = query.filter(Grievance.status == status.upper())
    if category and category.upper() != "ALL":
        query = query.filter(Grievance.category.ilike(f"%{category}%"))
    if department and department.upper() != "ALL":
        query = query.filter(Grievance.department == department)
    if priority:
        query = query.filter(Grievance.priority == priority.upper())
    if search and search.strip():
        term = f"%{search.strip()}%".lower()
        query = query.filter(
            (func.lower(Grievance.title).ilike(term)) |
            (func.lower(Grievance.description).ilike(term)) |
            (func.lower(Grievance.location).ilike(term)) |
            (func.lower(Grievance.landmark).ilike(term))
        )

    # Sorting
    if sort_by == "impact":
        conf_sub = (
            db.query(
                CommunityConfirmation.grievance_id,
                func.count(CommunityConfirmation.id).label("c_count")
            )
            .group_by(CommunityConfirmation.grievance_id)
            .subquery()
        )
        query = (
            query.outerjoin(conf_sub, Grievance.id == conf_sub.c.grievance_id)
            .order_by(desc(func.coalesce(conf_sub.c.c_count, 0)), Grievance.created_at.desc())
        )
    elif sort_by == "urgency":
        query = query.order_by(desc(Grievance.urgency_score), Grievance.created_at.desc())
    else:
        # Default: newest first
        query = query.order_by(Grievance.created_at.desc())

    total = query.count()
    total_pages = (total + limit - 1) // limit if total > 0 else 1
    offset = (page - 1) * limit
    grievances = query.offset(offset).limit(limit).all()

    items = [build_feed_item(g, current_user=current_user, language=language) for g in grievances]

    return CivicFeedResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
        has_more=page < total_pages,
    )


@router.get("/{grievance_id}", response_model=CivicFeedItemOut)
def get_feed_post_by_id(
    grievance_id: str,
    language: str = Query("en", description="Language code: en | ta"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve a single canonical Civic Feed post by grievance ID or tracking ID."""
    if grievance_id.isdigit():
        grievance = db.query(Grievance).filter(Grievance.id == int(grievance_id)).first()
    else:
        grievance = db.query(Grievance).filter(Grievance.tracking_id == grievance_id).first()

    if not grievance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Civic post for grievance '{grievance_id}' was not found.",
        )

    return build_feed_item(grievance, current_user=current_user, language=language)


@router.post("/{grievance_id}/confirm", response_model=ConfirmationResponse)
def confirm_civic_issue(
    grievance_id: str,
    background_tasks: BackgroundTasks,
    current_citizen: User = Depends(get_current_citizen),
    db: Session = Depends(get_db),
):
    """
    Citizen confirms 'I HAVE THIS PROBLEM TOO' on a civic grievance.
    Increments canonical community confirmation counter and updates public visibility.
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

    # Check for existing confirmation
    existing = (
        db.query(CommunityConfirmation)
        .filter(
            CommunityConfirmation.grievance_id == grievance.id,
            CommunityConfirmation.citizen_id == current_citizen.id
        )
        .first()
    )

    if not existing:
        new_conf = CommunityConfirmation(
            grievance_id=grievance.id,
            citizen_id=current_citizen.id
        )
        db.add(new_conf)
        db.commit()

    total_count = (
        db.query(CommunityConfirmation)
        .filter(CommunityConfirmation.grievance_id == grievance.id)
        .count()
    )

    # Dispatch n8n automation event (non-blocking background task, failsafe)
    background_tasks.add_task(
        dispatch_grievance_event,
        grievance=grievance,
        event_type="COMMUNITY_IMPACT_CHANGED",
        community_count=total_count,
    )

    return ConfirmationResponse(
        grievance_id=grievance.id,
        tracking_id=grievance.tracking_id,
        community_count=total_count,
        confirmed=True,
        message="Community confirmation recorded successfully.",
    )



@router.delete("/{grievance_id}/confirm", response_model=ConfirmationResponse)
def remove_community_confirmation(
    grievance_id: str,
    current_citizen: User = Depends(get_current_citizen),
    db: Session = Depends(get_db),
):
    """Citizen removes their 'I HAVE THIS PROBLEM TOO' confirmation."""
    if grievance_id.isdigit():
        grievance = db.query(Grievance).filter(Grievance.id == int(grievance_id)).first()
    else:
        grievance = db.query(Grievance).filter(Grievance.tracking_id == grievance_id).first()

    if not grievance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Grievance '{grievance_id}' was not found.",
        )

    existing = (
        db.query(CommunityConfirmation)
        .filter(
            CommunityConfirmation.grievance_id == grievance.id,
            CommunityConfirmation.citizen_id == current_citizen.id
        )
        .first()
    )

    if existing:
        db.delete(existing)
        db.commit()

    total_count = (
        db.query(CommunityConfirmation)
        .filter(CommunityConfirmation.grievance_id == grievance.id)
        .count()
    )

    return ConfirmationResponse(
        grievance_id=grievance.id,
        tracking_id=grievance.tracking_id,
        community_count=total_count,
        confirmed=False,
        message="Community confirmation removed.",
    )
