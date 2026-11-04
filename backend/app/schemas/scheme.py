from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class SchemeBase(BaseModel):
    code: str
    name: str
    description: str
    state: str = "All-India"
    category: str
    department: Optional[str] = None
    target_groups: Optional[str] = None
    eligibility_criteria: Optional[str] = None
    eligibility_rules: Optional[str] = None
    benefits: Optional[str] = None
    required_documents: Optional[str] = None
    official_portal: Optional[str] = None
    application_steps: Optional[str] = None
    source_name: Optional[str] = None
    source_url: Optional[str] = None
    last_verified: Optional[str] = "2026-08-01"
    name_ta: Optional[str] = None
    description_ta: Optional[str] = None
    benefits_ta: Optional[str] = None
    eligibility_criteria_ta: Optional[str] = None
    application_steps_ta: Optional[str] = None
    is_active: bool = True


class SchemeOut(SchemeBase):
    id: int
    created_at: datetime
    # Helper parsed fields
    target_groups_list: List[str] = Field(default_factory=list)
    required_documents_list: List[str] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class SchemeDetailOut(SchemeOut):
    pass


# -------------------------------------------------------------
# Scheme Eligibility Checking Models
# -------------------------------------------------------------
class SchemeEligibilityCheckRequest(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None  # "male", "female", "other"
    is_student: Optional[bool] = None
    occupation: Optional[str] = None
    income_range: Optional[str] = None  # "< 2.5L", "2.5L - 5L", "5L - 8L", "> 8L"
    annual_income: Optional[float] = None
    is_bpl: Optional[bool] = False
    is_farmer: Optional[bool] = False
    has_disability: Optional[bool] = False
    state: Optional[str] = "Karnataka"
    district: Optional[str] = None
    residence_type: Optional[str] = "urban"  # "urban", "rural"
    senior_citizen: Optional[bool] = None
    language: Optional[str] = "en"  # "en" or "ta"


class SchemeEligibilityMatchItem(BaseModel):
    scheme_id: int
    scheme_code: str
    scheme_name: str
    category: str
    eligibility_status: str = "LIKELY_ELIGIBLE"  # "LIKELY_ELIGIBLE", "POSSIBLY_ELIGIBLE", "NOT_ELIGIBLE", "MORE_INFO_NEEDED"
    confidence: float = 0.85
    why_you_qualify: str
    benefits_summary: Optional[str] = None
    required_documents: List[str] = Field(default_factory=list)
    application_steps: Optional[str] = None
    official_portal: Optional[str] = None
    source_name: Optional[str] = None
    missing_information: List[str] = Field(default_factory=list)


class SchemeEligibilityCheckResponse(BaseModel):
    citizen_context_summary: str
    matches: List[SchemeEligibilityMatchItem]
    explanation: Optional[str] = None
    source: str = "GEMINI"  # "GEMINI" or "FALLBACK"


# -------------------------------------------------------------
# Scheme AI Assistant Models
# -------------------------------------------------------------
class SchemeAssistantRequest(BaseModel):
    query: str
    citizen_profile: Optional[Dict[str, Any]] = None
    language: Optional[str] = "en"  # "en" or "ta"


class SchemeAssistantResponse(BaseModel):
    answer: str
    matches: List[SchemeEligibilityMatchItem] = Field(default_factory=list)
    suggested_prompts: List[str] = Field(default_factory=list)
    source: str = "GEMINI"  # "GEMINI" or "FALLBACK"


# -------------------------------------------------------------
# Legacy Recommendation Compatibility Models
# -------------------------------------------------------------
class SchemeRecommendationItem(BaseModel):
    scheme_id: int
    scheme_code: str
    scheme_name: str
    category: str
    match_confidence: float
    why_you_qualify: str
    potential_benefits: Optional[str] = None
    application_steps: Optional[str] = None
    official_portal: Optional[str] = None


class SchemeRecommendationResponse(BaseModel):
    citizen_id: int
    generated_at: datetime
    citizen_context_summary: str
    recommendations: List[SchemeRecommendationItem]
