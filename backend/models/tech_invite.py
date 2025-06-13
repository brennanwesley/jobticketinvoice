from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timedelta
from database import Base

class TechInvite(Base):
    """Model for managing tech onboarding invites with JWT tokens"""
    __tablename__ = "tech_invites"
    
    # Primary key
    invite_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    
    # Tech details
    tech_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(20), nullable=True)
    
    # Company relationship
    company_id = Column(String(36), ForeignKey("companies.company_id"), nullable=False)
    
    # Invite status and timing
    status = Column(String(20), default="pending", nullable=False)  # pending, accepted, expired, cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False, 
                       default=lambda: datetime.utcnow() + timedelta(hours=48))
    used_at = Column(DateTime(timezone=True), nullable=True)
    
    # Creator tracking
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    company = relationship("Company", back_populates="tech_invites")
    creator = relationship("User", foreign_keys=[created_by])
    
    @property
    def is_expired(self) -> bool:
        """Check if invite has expired"""
        return datetime.utcnow() > self.expires_at
    
    @property
    def is_valid(self) -> bool:
        """Check if invite is valid (pending and not expired)"""
        return self.status == "pending" and not self.is_expired
    
    def mark_as_used(self):
        """Mark invite as accepted/used"""
        self.status = "accepted"
        self.used_at = datetime.utcnow()
    
    def mark_as_expired(self):
        """Mark invite as expired"""
        self.status = "expired"
    
    def mark_as_cancelled(self):
        """Mark invite as cancelled"""
        self.status = "cancelled"
