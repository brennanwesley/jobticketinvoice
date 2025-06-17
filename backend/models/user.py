from sqlalchemy import Column, Integer, String, DateTime, Enum, Text, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from database import Base

class UserRole(str, enum.Enum):
    """User role enum"""
    TECH = "tech"
    MANAGER = "manager"
    ADMIN = "admin"

class User(Base):
    """User model with multi-tenancy support"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default=UserRole.TECH, nullable=False)
    name = Column(String, nullable=True)
    logo_url = Column(Text, nullable=True)
    
    # Multi-tenancy: Company relationship
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    
    # Security and status fields
    is_active = Column(Boolean, default=True, nullable=False)
    force_password_reset = Column(Boolean, default=False, nullable=False)
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    company = relationship("Company", back_populates="users")
    audit_logs = relationship("AuditLog", back_populates="user")
    invoices = relationship("Invoice", back_populates="user")
    
    def __repr__(self):
        return f"<User {self.email} ({self.role})>"
