from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import secrets
from datetime import datetime, timedelta
from database import Base

class TechnicianInvitation(Base):
    """Model for managing technician invitations"""
    __tablename__ = "technician_invitations"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Invitation details
    token = Column(String(64), unique=True, index=True, nullable=False, default=lambda: secrets.token_urlsafe(48))
    email = Column(String(255), nullable=False, index=True)
    name = Column(String(255), nullable=True)
    
    # Company and creator relationships
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    invited_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Status and timing
    is_used = Column(Boolean, default=False, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.utcnow() + timedelta(hours=48))
    used_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Optional message from manager
    invitation_message = Column(Text, nullable=True)
    
    # Relationships
    company = relationship("Company")
    inviter = relationship("User", foreign_keys=[invited_by])
    
    @property
    def is_expired(self) -> bool:
        """Check if invitation has expired"""
        return datetime.utcnow() > self.expires_at
    
    @property
    def is_valid(self) -> bool:
        """Check if invitation is valid (not used and not expired)"""
        return not self.is_used and not self.is_expired
    
    def mark_as_used(self):
        """Mark invitation as used"""
        self.is_used = True
        self.used_at = func.now()
    
    def __repr__(self):
        return f"<TechnicianInvitation {self.email} for {self.company.name if self.company else 'Unknown Company'}>"
