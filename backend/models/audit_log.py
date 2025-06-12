"""
Audit Log model for tracking system events and user actions
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

from database import Base

class AuditLog(Base):
    """
    Audit log model for tracking all system events and user actions
    Provides comprehensive logging for compliance and debugging
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    
    # User and company information for multi-tenancy
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    company_id = Column(String(36), ForeignKey("companies.company_id"), nullable=False, index=True)
    
    # Event information
    action = Column(String(100), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)  # security, user, company, technician, system, etc.
    description = Column(Text, nullable=True)
    details = Column(JSON, nullable=True)  # Additional structured data
    
    # Target information (what was acted upon)
    target_id = Column(String(100), nullable=True, index=True)
    target_type = Column(String(50), nullable=True, index=True)  # user, company, job_ticket, etc.
    
    # Request information
    ip_address = Column(String(45), nullable=True, index=True)  # IPv6 support
    user_agent = Column(Text, nullable=True)
    
    # Timestamp
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")
    company = relationship("Company", back_populates="audit_logs")
    
    def __repr__(self):
        return f"<AuditLog(id={self.id}, action='{self.action}', category='{self.category}', timestamp='{self.timestamp}')>"
    
    @property
    def formatted_timestamp(self):
        """Return formatted timestamp for display"""
        if self.timestamp:
            return self.timestamp.strftime("%Y-%m-%d %H:%M:%S UTC")
        return "Unknown"
    
    @property
    def is_security_event(self):
        """Check if this is a security-related event"""
        return self.category and self.category.lower() == "security"
    
    def to_dict(self):
        """Convert audit log to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "company_id": self.company_id,
            "action": self.action,
            "category": self.category,
            "description": self.description,
            "details": self.details,
            "target_id": self.target_id,
            "target_type": self.target_type,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "formatted_timestamp": self.formatted_timestamp,
            "is_security_event": self.is_security_event
        }
