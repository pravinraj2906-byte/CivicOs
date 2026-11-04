from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, field_validator
from app.schemas.user import UserOut


class GrievanceCreate(BaseModel):
    title: str
    description: str
    location: Optional[str] = None
    landmark: Optional[str] = None
    category: Optional[str] = "General"


class GrievanceStatusPatch(BaseModel):
    status: str  # SUBMITTED, TRIAGED, IN_PROGRESS, RESOLVED, REJECTED
    remarks: Optional[str] = None


class GrievanceFeedbackIn(BaseModel):
    is_resolved: bool
    rating: Optional[str] = None  # YES, PARTLY, NO
    comment: Optional[str] = None


class GrievanceUpdateOut(BaseModel):
    id: int
    grievance_id: int
    officer_id: Optional[int] = None
    status: str
    remarks: Optional[str] = None
    created_at: datetime
    officer: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)


class GrievanceOut(BaseModel):
    id: int
    tracking_id: str
    citizen_id: int
    title: str
    description: str
    location: Optional[str] = None
    landmark: Optional[str] = None
    category: str
    priority: str
    department: str
    status: str
    assigned_officer_id: Optional[int] = None
    ai_summary: Optional[str] = None
    urgency_score: Optional[float] = None
    suggested_initial_action: Optional[str] = None
    key_entities: Optional[List[str]] = None
    ai_source: Optional[str] = None
    community_count: int = 0
    created_at: datetime
    updated_at: datetime


    @field_validator("key_entities", mode="before")
    @classmethod
    def parse_key_entities(cls, v):
        if isinstance(v, str):
            try:
                import json
                return json.loads(v)
            except Exception:
                return [e.strip() for e in v.split(",") if e.strip()]
        return v

    model_config = ConfigDict(from_attributes=True)


class GrievanceDetailOut(GrievanceOut):
    citizen: Optional[UserOut] = None
    assigned_officer: Optional[UserOut] = None
    updates: List[GrievanceUpdateOut] = []
