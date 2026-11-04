from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class AllowedCategory(str, Enum):
    ROADS_INFRASTRUCTURE = "Roads & Infrastructure"
    WATER_SANITATION = "Water & Sanitation"
    ELECTRICITY_ENERGY = "Electricity & Energy"
    PUBLIC_HEALTH = "Public Health"
    WASTE_MANAGEMENT = "Waste Management"


class AllowedDepartment(str, Enum):
    PUBLIC_WORKS = "Public_Works"
    WATER_SANITATION = "Water_Sanitation"
    ELECTRICITY_BOARD = "Electricity_Board"
    HEALTH_DEPT = "Health_Dept"
    MUNICIPAL_CORP = "Municipal_Corp"


class AllowedPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class GrievanceTriageResult(BaseModel):
    """
    Validated structured result of civic grievance AI triage.
    Enforces strict typing, category constraints, priority levels, and urgency bounds.
    """
    category: str = Field(description="Primary category of the grievance")
    assigned_department: str = Field(description="Responsible government department")
    priority: str = Field(description="Assigned severity priority: LOW, MEDIUM, HIGH, CRITICAL")
    urgency_score: float = Field(ge=0.0, le=1.0, description="Urgency score from 0.0 (lowest) to 1.0 (highest)")
    summary: str = Field(description="Concise 1-2 sentence executive summary of the issue")
    suggested_initial_action: str = Field(description="Recommended first action for the department")
    key_entities: List[str] = Field(default_factory=list, description="Extracted locations, equipment, or key entities")

    @field_validator("category", mode="before")
    @classmethod
    def validate_category(cls, v: str) -> str:
        if not isinstance(v, str):
            raise ValueError("Category must be a string")
        v_clean = v.strip()
        valid_map = {c.value.lower(): c.value for c in AllowedCategory}
        synonyms = {
            "roads and infrastructure": AllowedCategory.ROADS_INFRASTRUCTURE.value,
            "roads_infrastructure": AllowedCategory.ROADS_INFRASTRUCTURE.value,
            "water and sanitation": AllowedCategory.WATER_SANITATION.value,
            "water_sanitation": AllowedCategory.WATER_SANITATION.value,
            "electricity and energy": AllowedCategory.ELECTRICITY_ENERGY.value,
            "electricity_energy": AllowedCategory.ELECTRICITY_ENERGY.value,
            "public_health": AllowedCategory.PUBLIC_HEALTH.value,
            "waste_management": AllowedCategory.WASTE_MANAGEMENT.value,
        }
        v_lower = v_clean.lower()
        if v_lower in valid_map:
            return valid_map[v_lower]
        if v_lower in synonyms:
            return synonyms[v_lower]
        valid_values = {c.value for c in AllowedCategory}
        raise ValueError(f"Invalid category '{v}'. Must be one of: {sorted(list(valid_values))}")

    @field_validator("assigned_department", mode="before")
    @classmethod
    def validate_department(cls, v: str) -> str:
        if not isinstance(v, str):
            raise ValueError("Department must be a string")
        v_clean = v.strip()
        valid_map = {d.value.lower(): d.value for d in AllowedDepartment}
        synonyms = {
            "public works": AllowedDepartment.PUBLIC_WORKS.value,
            "public_works": AllowedDepartment.PUBLIC_WORKS.value,
            "water sanitation": AllowedDepartment.WATER_SANITATION.value,
            "water & sanitation": AllowedDepartment.WATER_SANITATION.value,
            "water and sanitation": AllowedDepartment.WATER_SANITATION.value,
            "water_sanitation": AllowedDepartment.WATER_SANITATION.value,
            "electricity board": AllowedDepartment.ELECTRICITY_BOARD.value,
            "electricity & energy": AllowedDepartment.ELECTRICITY_BOARD.value,
            "electricity and energy": AllowedDepartment.ELECTRICITY_BOARD.value,
            "electricity_board": AllowedDepartment.ELECTRICITY_BOARD.value,
            "health dept": AllowedDepartment.HEALTH_DEPT.value,
            "health department": AllowedDepartment.HEALTH_DEPT.value,
            "health_dept": AllowedDepartment.HEALTH_DEPT.value,
            "public health": AllowedDepartment.HEALTH_DEPT.value,
            "municipal corp": AllowedDepartment.MUNICIPAL_CORP.value,
            "municipal corporation": AllowedDepartment.MUNICIPAL_CORP.value,
            "municipal_corp": AllowedDepartment.MUNICIPAL_CORP.value,
            "waste management": AllowedDepartment.MUNICIPAL_CORP.value,
        }
        v_lower = v_clean.lower()
        if v_lower in valid_map:
            return valid_map[v_lower]
        if v_lower in synonyms:
            return synonyms[v_lower]
        valid_values = {d.value for d in AllowedDepartment}
        raise ValueError(f"Invalid department '{v}'. Must be one of: {sorted(list(valid_values))}")

    @field_validator("priority", mode="before")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        if not isinstance(v, str):
            raise ValueError("Priority must be a string")
        v_upper = v.strip().upper()
        valid_values = {p.value for p in AllowedPriority}
        if v_upper not in valid_values:
            raise ValueError(f"Invalid priority '{v}'. Must be one of: {sorted(list(valid_values))}")
        return v_upper

    @field_validator("urgency_score", mode="before")
    @classmethod
    def validate_urgency(cls, v: float) -> float:
        try:
            val = float(v)
        except (ValueError, TypeError):
            raise ValueError(f"Invalid urgency score '{v}'. Must be a float.")
        clamped = max(0.0, min(1.0, val))
        return round(clamped, 2)


class AITriageRequest(BaseModel):
    """Payload for standalone AI analysis endpoint."""
    title: str = Field(min_length=3, description="Title or subject of the grievance")
    description: str = Field(min_length=5, description="Detailed explanation of the issue")
    location: Optional[str] = Field(None, description="Location or area of the incident")
    landmark: Optional[str] = Field(None, description="Nearby landmark")


class AITriageResponse(GrievanceTriageResult):
    """Response model for standalone AI analysis endpoint."""
    source: str = Field(description="Source of triage analysis: 'GEMINI' or 'FALLBACK'")
