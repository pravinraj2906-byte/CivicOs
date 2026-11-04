from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, field_validator


class FeedAuthorOut(BaseModel):
    display_name: str
    avatar_url: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class FeedTimelineEventOut(BaseModel):
    id: int
    status: str
    stage: str  # CITIZEN_REPORT, AI_TRIAGE, OFFICIAL_UPDATE, RESOLUTION
    label: str
    label_ta: Optional[str] = None
    remarks: Optional[str] = None
    department: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CivicFeedItemOut(BaseModel):
    id: int
    grievance_id: int
    tracking_id: str
    author: FeedAuthorOut
    title: str
    description: str
    location: Optional[str] = None
    landmark: Optional[str] = None
    category: str
    department: str
    priority: str
    status: str
    urgency_score: Optional[float] = None
    ai_summary: Optional[str] = None
    suggested_initial_action: Optional[str] = None
    key_entities: Optional[List[str]] = None
    is_verified: bool = True
    community_count: int = 0
    confirmed_by_current_user: bool = False
    created_at: datetime
    updated_at: datetime
    timeline: List[FeedTimelineEventOut] = []

    @field_validator('key_entities', mode='before')
    @classmethod
    def parse_key_entities(cls, v):
        if isinstance(v, str):
            try:
                import json
                return json.loads(v)
            except Exception:
                return [e.strip() for e in v.split(',') if e.strip()]
        return v

    model_config = ConfigDict(from_attributes=True)


class CivicFeedResponse(BaseModel):
    items: List[CivicFeedItemOut]
    total: int
    page: int
    limit: int
    total_pages: int
    has_more: bool


class ConfirmationResponse(BaseModel):
    grievance_id: int
    tracking_id: str
    community_count: int
    confirmed: bool
    message: str
