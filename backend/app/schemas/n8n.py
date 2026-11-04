from datetime import datetime, timezone
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field


class N8nGrievancePayload(BaseModel):
    """
    Standard, sanitized, privacy-safe event payload for n8n workflow automation.
    Contains strictly operational and triage metadata.
    Never exposes passwords, tokens, API keys, Aadhaar numbers, or private citizen credentials.
    """
    event: str = Field(..., description="The authoritative event type: GRIEVANCE_CREATED, GRIEVANCE_CRITICAL, GRIEVANCE_STATUS_CHANGED, COMMUNITY_IMPACT_CHANGED, GRIEVANCE_RESOLVED")
    event_id: str = Field(..., description="Unique deterministic event identifier for idempotency")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat(), description="ISO 8601 UTC timestamp of dispatch")
    grievance_id: int = Field(..., description="Unique database ID of the grievance")
    tracking_id: str = Field(..., description="Public human-readable tracking identifier (e.g. GRV-2026-XXXXXX)")
    title: str = Field(..., description="Grievance title")
    category: str = Field(..., description="AI-triaged civic category")
    department: str = Field(..., description="Responsible government department")
    priority: str = Field(..., description="Authoritative grievance priority (LOW, MEDIUM, HIGH, CRITICAL)")
    urgency_score: Optional[float] = Field(None, description="AI urgency score (0.0 to 1.0)")
    status: str = Field(..., description="Current lifecycle status (SUBMITTED, TRIAGED, IN_PROGRESS, RESOLVED, REJECTED)")
    community_count: int = Field(0, description="Real verified citizen confirmation count")
    impact_classification: str = Field("NO_CONFIRMATION", description="NO_CONFIRMATION | COMMUNITY_CONFIRMED | HIGH_COMMUNITY_IMPACT | WIDESPREAD_IMPACT | MASS_IMPACT")
    is_critical: bool = Field(False, description="True if priority is CRITICAL")
    is_high_priority: bool = Field(False, description="True if priority is CRITICAL or HIGH")
    location_summary: Optional[str] = Field(None, description="Location of the issue")
    landmark: Optional[str] = Field(None, description="Nearby landmark")
    ai_summary: Optional[str] = Field(None, description="Concise executive summary from AI triage")
    suggested_initial_action: Optional[str] = Field(None, description="Recommended operational action")
    latest_remarks: Optional[str] = Field(None, description="Latest officer audit remarks")
    created_at: Optional[str] = Field(None, description="Grievance creation timestamp")
    updated_at: Optional[str] = Field(None, description="Grievance last updated timestamp")
    age_hours: float = Field(0.0, description="Elapsed hours since grievance creation")
    sla_status: str = Field("NORMAL", description="NORMAL | APPROACHING_SLA | SLA_BREACH_WARNING")
    source: str = Field("CivicOS-Backend", description="Originating system identifier")


class N8nWebhookResponse(BaseModel):
    """Result model returned by the n8n dispatch service."""
    success: bool
    status_code: Optional[int] = None
    event: str
    tracking_id: str
    message: str
