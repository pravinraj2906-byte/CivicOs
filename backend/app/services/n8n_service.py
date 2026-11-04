import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, Tuple
import httpx

from app.core.config import settings
from app.db.models.grievance import Grievance
from app.schemas.n8n import N8nGrievancePayload, N8nWebhookResponse

logger = logging.getLogger("civicos.n8n")


def classify_community_impact(count: int) -> str:
    """
    Authoritative community impact threshold classification.
    Thresholds:
      0       -> NO_CONFIRMATION
      1 - 4   -> COMMUNITY_CONFIRMED
      5 - 9   -> HIGH_COMMUNITY_IMPACT
      10 - 24 -> WIDESPREAD_IMPACT
      25+     -> MASS_IMPACT
    """
    if count >= 25:
        return "MASS_IMPACT"
    if count >= 10:
        return "WIDESPREAD_IMPACT"
    if count >= 5:
        return "HIGH_COMMUNITY_IMPACT"
    if count >= 1:
        return "COMMUNITY_CONFIRMED"
    return "NO_CONFIRMATION"


def calculate_sla_status(
    priority: str,
    created_at: Optional[datetime],
    status: str,
    now: Optional[datetime] = None,
) -> Tuple[float, str]:
    """
    Calculate elapsed grievance age and SLA urgency classification.
    SLA Windows:
      CRITICAL -> 12h threshold (Approaching: 8h, Warning: 12h+)
      HIGH     -> 24h threshold (Approaching: 18h, Warning: 24h+)
      STANDARD -> 48h threshold (Approaching: 36h, Warning: 48h+)
    """
    if not created_at:
        return 0.0, "NORMAL"
    
    current_time = now or datetime.now(timezone.utc)
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    
    elapsed_seconds = max(0.0, (current_time - created_at).total_seconds())
    age_hours = round(elapsed_seconds / 3600.0, 2)

    normalized_status = (status or "").upper()
    if normalized_status in ("RESOLVED", "REJECTED"):
        return age_hours, "NORMAL"

    prio = (priority or "MEDIUM").upper()
    if prio == "CRITICAL":
        if age_hours >= 12.0:
            return age_hours, "SLA_BREACH_WARNING"
        elif age_hours >= 8.0:
            return age_hours, "APPROACHING_SLA"
    elif prio == "HIGH":
        if age_hours >= 24.0:
            return age_hours, "SLA_BREACH_WARNING"
        elif age_hours >= 18.0:
            return age_hours, "APPROACHING_SLA"
    else:
        if age_hours >= 48.0:
            return age_hours, "SLA_BREACH_WARNING"
        elif age_hours >= 36.0:
            return age_hours, "APPROACHING_SLA"

    return age_hours, "NORMAL"


def build_n8n_payload(
    grievance: Grievance,
    event_type: str = "GRIEVANCE_CREATED",
    community_count: Optional[int] = None,
    latest_remarks: Optional[str] = None,
) -> N8nGrievancePayload:
    """
    Construct a privacy-safe, standardized operational payload for n8n.
    Guarantees that no passwords, tokens, API keys, or private credentials are included.
    """
    now = datetime.now(timezone.utc)
    prio = (grievance.priority or "MEDIUM").upper()
    is_critical = prio == "CRITICAL"
    is_high = prio in ("CRITICAL", "HIGH")
    
    # Calculate community count from relationship if not passed
    c_count = community_count
    if c_count is None:
        try:
            c_count = len(grievance.confirmations) if grievance.confirmations else 0
        except Exception:
            c_count = 0

    impact_class = classify_community_impact(c_count)

    # If latest_remarks not passed, try finding the last update remarks
    remarks = latest_remarks
    if remarks is None:
        try:
            if grievance.updates:
                remarks = grievance.updates[-1].remarks
        except Exception:
            remarks = None

    # Calculate SLA status & age
    age_hours, sla_status = calculate_sla_status(
        priority=prio,
        created_at=getattr(grievance, "created_at", None),
        status=grievance.status,
        now=now,
    )

    created_iso = grievance.created_at.isoformat() if getattr(grievance, "created_at", None) else None
    updated_iso = grievance.updated_at.isoformat() if getattr(grievance, "updated_at", None) else None

    # Deterministic event_id for idempotency
    event_id = f"EVT_{event_type}_{grievance.id}_{int(now.timestamp())}"

    return N8nGrievancePayload(
        event=event_type,
        event_id=event_id,
        timestamp=now.isoformat(),
        grievance_id=grievance.id,
        tracking_id=grievance.tracking_id,
        title=grievance.title,
        category=grievance.category,
        department=str(grievance.department),
        priority=prio,
        urgency_score=grievance.urgency_score,
        status=grievance.status,
        community_count=c_count,
        impact_classification=impact_class,
        is_critical=is_critical,
        is_high_priority=is_high,
        location_summary=grievance.location,
        landmark=grievance.landmark,
        ai_summary=grievance.ai_summary,
        suggested_initial_action=grievance.suggested_initial_action,
        latest_remarks=remarks,
        created_at=created_iso,
        updated_at=updated_iso,
        age_hours=age_hours,
        sla_status=sla_status,
        source="CivicOS-Backend",
    )


def dispatch_grievance_event(
    grievance: Grievance,
    event_type: str = "GRIEVANCE_CREATED",
    community_count: Optional[int] = None,
    latest_remarks: Optional[str] = None,
    custom_url: Optional[str] = None,
) -> N8nWebhookResponse:
    """
    Dispatch an operational event to the configured n8n webhook.
    
    Resilience Guarantees:
    - Never raises exceptions to the calling grievance workflow.
    - Never blocks backend operations (enforces a strict short timeout).
    - If n8n is disabled, returns gracefully.
    - If n8n is offline, returns gracefully and logs a safe warning.
    - Preserves backend authority: CivicOS remains the source of truth.
    """
    tracking_id = grievance.tracking_id
    
    # 1. Check if n8n is enabled
    if not settings.N8N_ENABLED and not custom_url:
        logger.debug(f"[n8n-skip] Automation disabled. Skipping event '{event_type}' for {tracking_id}.")
        return N8nWebhookResponse(
            success=False,
            event=event_type,
            tracking_id=tracking_id,
            message="n8n automation is disabled in configuration (N8N_ENABLED=False).",
        )

    target_url = custom_url or settings.N8N_WEBHOOK_URL
    if not target_url:
        logger.debug(f"[n8n-skip] No webhook URL configured for {tracking_id}.")
        return N8nWebhookResponse(
            success=False,
            event=event_type,
            tracking_id=tracking_id,
            message="N8N_WEBHOOK_URL is not configured.",
        )

    # 2. Build structured, sanitized payload
    try:
        payload_obj = build_n8n_payload(
            grievance=grievance,
            event_type=event_type,
            community_count=community_count,
            latest_remarks=latest_remarks,
        )
        payload_dict = payload_obj.model_dump()
    except Exception as build_err:
        logger.error(f"[n8n-error] Failed to construct n8n payload for {tracking_id}: {build_err}")
        return N8nWebhookResponse(
            success=False,
            event=event_type,
            tracking_id=tracking_id,
            message=f"Payload build error: {build_err}",
        )

    # 3. Prepare headers including shared secret and idempotency key
    headers: Dict[str, str] = {
        "Content-Type": "application/json",
        "User-Agent": "CivicOS-Automation-Client/1.0",
        "X-CivicOS-Event": event_type,
        "X-CivicOS-Event-ID": payload_obj.event_id,
        "X-CivicOS-Tracking-ID": tracking_id,
    }
    if settings.N8N_WEBHOOK_SECRET:
        headers["X-CivicOS-Secret"] = settings.N8N_WEBHOOK_SECRET
        headers["X-N8N-Webhook-Secret"] = settings.N8N_WEBHOOK_SECRET

    timeout_seconds = settings.N8N_TIMEOUT_SECONDS or 3.0

    # 4. Dispatch webhook with robust exception handling
    try:
        with httpx.Client(timeout=timeout_seconds) as client:
            response = client.post(
                target_url,
                json=payload_dict,
                headers=headers,
            )

        if response.is_success:
            logger.info(
                f"[n8n-success] Webhook delivered for {tracking_id} [event={event_type}, priority={payload_obj.priority}, dept={payload_obj.department}, impact={payload_obj.impact_classification}, status_code={response.status_code}]"
            )
            return N8nWebhookResponse(
                success=True,
                status_code=response.status_code,
                event=event_type,
                tracking_id=tracking_id,
                message="Event successfully delivered to n8n webhook.",
            )
        else:
            logger.warning(
                f"[n8n-warn] Webhook returned non-2xx status for {tracking_id} [event={event_type}, status_code={response.status_code}]: {response.text[:200]}"
            )
            return N8nWebhookResponse(
                success=False,
                status_code=response.status_code,
                event=event_type,
                tracking_id=tracking_id,
                message=f"n8n webhook returned HTTP {response.status_code}.",
            )

    except httpx.TimeoutException:
        logger.warning(
            f"[n8n-timeout] Webhook timed out after {timeout_seconds}s for {tracking_id} [event={event_type}]. Grievance creation unaffected."
        )
        return N8nWebhookResponse(
            success=False,
            event=event_type,
            tracking_id=tracking_id,
            message=f"n8n webhook timed out after {timeout_seconds}s.",
        )
    except httpx.ConnectError as conn_err:
        logger.warning(
            f"[n8n-offline] n8n server unreachable for {tracking_id} [event={event_type}]: {conn_err}. Grievance creation unaffected."
        )
        return N8nWebhookResponse(
            success=False,
            event=event_type,
            tracking_id=tracking_id,
            message="n8n webhook server is unreachable / offline.",
        )
    except Exception as exc:
        logger.warning(
            f"[n8n-error] Unexpected error dispatching webhook for {tracking_id} [event={event_type}]: {exc}. Grievance creation unaffected."
        )
        return N8nWebhookResponse(
            success=False,
            event=event_type,
            tracking_id=tracking_id,
            message=f"Webhook dispatch error: {exc}",
        )
