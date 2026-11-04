from fastapi import APIRouter, Depends, status
from app.api.deps import get_current_user
from app.db.models.user import User
from app.schemas.ai import AITriageRequest, AITriageResponse
from app.services.gemini_service import triage_grievance

router = APIRouter(prefix="/ai", tags=["AI Intelligence"])


@router.post("/analyze-grievance", response_model=AITriageResponse, status_code=status.HTTP_200_OK)
def analyze_grievance(
    payload: AITriageRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Analyze a citizen grievance using the Gemini AI Intelligence Layer.
    Returns structured categorization, assigned department, severity priority,
    urgency score, summary, suggested initial action, and key entities.
    
    If Gemini API key is not configured or an error occurs, seamlessly provides
    a deterministic rule-based fallback result with 'source': 'FALLBACK'.
    """
    triage_result, source = triage_grievance(
        title=payload.title,
        description=payload.description,
        location=payload.location,
        landmark=payload.landmark,
    )

    return AITriageResponse(
        category=triage_result.category,
        assigned_department=triage_result.assigned_department,
        priority=triage_result.priority,
        urgency_score=triage_result.urgency_score,
        summary=triage_result.summary,
        suggested_initial_action=triage_result.suggested_initial_action,
        key_entities=triage_result.key_entities,
        source=source,
    )
