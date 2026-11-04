from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.database import Base


class CitizenProfile(Base):
    __tablename__ = "citizen_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Citizen Twin socio-economic attributes
    age = Column(Integer, nullable=True)
    gender = Column(String(50), nullable=True)
    occupation = Column(String(100), nullable=True)
    income_range = Column(String(50), nullable=True)  # e.g., "< 2.5L", "2.5L - 5L", "5L - 10L", "> 10L"
    location = Column(String(255), nullable=True)
    residence_type = Column(String(50), nullable=True, default="urban")  # urban, rural, semi-urban
    family_context = Column(String(255), nullable=True)  # e.g., "4 members (2 adults, 2 children)"
    is_bpl = Column(Boolean, default=False, nullable=False)
    has_disability = Column(Boolean, default=False, nullable=False)
    interests = Column(Text, nullable=True)  # JSON or comma-separated tags
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    user = relationship("User", back_populates="citizen_profile")
