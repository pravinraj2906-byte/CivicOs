from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.database import Base


class Grievance(Base):
    __tablename__ = "grievances"

    id = Column(Integer, primary_key=True, index=True)
    tracking_id = Column(String(50), unique=True, index=True, nullable=False)  # e.g., "GRV-2026-0001"
    citizen_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(255), nullable=True)
    landmark = Column(String(255), nullable=True)
    
    category = Column(String(100), default="General", nullable=False)
    priority = Column(String(50), default="MEDIUM", nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    department = Column(String(100), default="Municipal_Corp", nullable=False)
    status = Column(String(50), default="SUBMITTED", nullable=False)  # SUBMITTED, TRIAGED, IN_PROGRESS, RESOLVED, REJECTED
    
    assigned_officer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    ai_summary = Column(Text, nullable=True)
    urgency_score = Column(Float, nullable=True)
    suggested_initial_action = Column(Text, nullable=True)
    key_entities = Column(Text, nullable=True)  # JSON-encoded string list
    ai_source = Column(String(50), default="GEMINI", nullable=True)  # GEMINI or FALLBACK
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    citizen = relationship("User", back_populates="grievances", foreign_keys=[citizen_id])
    assigned_officer = relationship("User", back_populates="assigned_grievances", foreign_keys=[assigned_officer_id])
    updates = relationship("GrievanceUpdate", back_populates="grievance", cascade="all, delete-orphan", order_by="GrievanceUpdate.created_at.asc()")
    confirmations = relationship("CommunityConfirmation", back_populates="grievance", cascade="all, delete-orphan")

    @property
    def community_count(self) -> int:
        return len(self.confirmations) if self.confirmations else 0


