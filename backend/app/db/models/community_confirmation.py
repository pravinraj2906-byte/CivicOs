from datetime import datetime, timezone
from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.database import Base


class CommunityConfirmation(Base):
    __tablename__ = 'community_confirmations'

    id = Column(Integer, primary_key=True, index=True)
    grievance_id = Column(Integer, ForeignKey('grievances.id', ondelete='CASCADE'), nullable=False, index=True)
    citizen_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint('grievance_id', 'citizen_id', name='uq_grievance_citizen_confirmation'),
    )

    # Relationships
    grievance = relationship('Grievance', back_populates='confirmations')
    citizen = relationship('User', back_populates='community_confirmations')
