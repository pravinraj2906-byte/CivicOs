from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="citizen")  # citizen, officer, admin
    department = Column(String(100), nullable=True)  # For officers: Water_Sanitation, Public_Works, etc.
    state = Column(String(100), nullable=True, default="Karnataka")
    district = Column(String(100), nullable=True, default="Bengaluru Urban")
    preferred_language = Column(String(20), nullable=False, default="en")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    citizen_profile = relationship("CitizenProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    grievances = relationship("Grievance", back_populates="citizen", foreign_keys="Grievance.citizen_id", cascade="all, delete-orphan")
    assigned_grievances = relationship("Grievance", back_populates="assigned_officer", foreign_keys="Grievance.assigned_officer_id")
    grievance_updates = relationship("GrievanceUpdate", back_populates="officer")
    community_confirmations = relationship("CommunityConfirmation", back_populates="citizen", cascade="all, delete-orphan")

