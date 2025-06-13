from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from database import Base

class Company(Base):
    """Company model for multi-tenancy support"""
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Unique company identifier for secure references
    company_id = Column(String(36), unique=True, index=True, nullable=False, default=lambda: str(uuid.uuid4()))
    
    # Company information
    name = Column(String(255), nullable=False, index=True)
    normalized_name = Column(String(255), nullable=False, index=True)  # For uniqueness checks
    address = Column(Text, nullable=True)
    phone = Column(String(20), nullable=True)
    logo_url = Column(Text, nullable=True)
    
    # Audit fields
    created_by = Column(Integer, nullable=True)  # User ID of the manager who created the company (nullable for manager signup)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Status fields
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    users = relationship("User", back_populates="company")
    job_tickets = relationship("JobTicket", back_populates="company")
    audit_logs = relationship("AuditLog", back_populates="company")
    tech_invites = relationship("TechInvite", back_populates="company")
    
    # Ensure normalized company names are unique
    __table_args__ = (
        UniqueConstraint('normalized_name', name='uix_company_normalized_name'),
    )
    
    @staticmethod
    def normalize_name(name: str) -> str:
        """Normalize company name for uniqueness checks"""
        if not name:
            return ""
        return name.strip().lower().replace(" ", "").replace("-", "").replace("_", "")
    
    def __repr__(self):
        return f"<Company {self.name} ({self.company_id})>"
