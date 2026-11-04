from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserOut


class CitizenProfileBase(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    occupation: Optional[str] = None
    income_range: Optional[str] = None
    location: Optional[str] = None
    residence_type: Optional[str] = "urban"
    family_context: Optional[str] = None
    is_bpl: Optional[bool] = False
    has_disability: Optional[bool] = False
    interests: Optional[str] = None


class CitizenProfileUpdate(CitizenProfileBase):
    pass


class CitizenProfileOut(CitizenProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CitizenWithProfileOut(UserOut):
    profile: Optional[CitizenProfileOut] = None
