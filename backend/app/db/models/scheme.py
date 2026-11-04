from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime
from app.db.database import Base


class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)  # e.g., "SCH_001"
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    state = Column(String(100), default="All-India", nullable=False)  # "All-India" or state name
    category = Column(String(100), nullable=False)  # "Education", "Farmers", "Women", "Housing", "Health", "Employment", "Senior Citizens", "Financial Support"
    department = Column(String(255), nullable=True)
    
    # Controlled Scheme Knowledge & Eligibility
    target_groups = Column(Text, nullable=True)  # Comma-separated or JSON: "students,youth,bpl"
    eligibility_criteria = Column(Text, nullable=True)  # Human-readable criteria
    eligibility_rules = Column(Text, nullable=True)  # JSON-encoded rule dictionary for deterministic engine
    benefits = Column(Text, nullable=True)  # Bullet points of key financial & social benefits
    required_documents = Column(Text, nullable=True)  # JSON array or newline-separated document checklist
    
    # Official Application Verification
    official_portal = Column(String(500), nullable=True)  # Verified official government URL
    application_steps = Column(Text, nullable=True)  # Step-by-step guidance
    source_name = Column(String(255), nullable=True)  # Official Ministry or Department
    source_url = Column(String(500), nullable=True)  # Official source verification URL
    last_verified = Column(String(50), default="2026-08-01", nullable=True)

    # Multi-language (Tamil Localization)
    name_ta = Column(String(255), nullable=True)
    description_ta = Column(Text, nullable=True)
    benefits_ta = Column(Text, nullable=True)
    eligibility_criteria_ta = Column(Text, nullable=True)
    application_steps_ta = Column(Text, nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
