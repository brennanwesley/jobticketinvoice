from sqlalchemy import Column, Integer, String, DateTime, Enum, Text
from sqlalchemy.sql import func
import enum
from database import Base

class UserRole(str, enum.Enum):
    """User role enum"""
    TECH = "tech"
    MANAGER = "manager"
    ADMIN = "admin"

class JobType(str, enum.Enum):
    """Job type enum"""
    PUMP_TECH = "pump_service_technician"
    ROUSTABOUT = "roustabout"
    ELECTRICIAN = "electrician"
    PIPELINE = "pipeline_operator"
    TRUCK_DRIVER = "truck_driver"
    OTHER = "other"

class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default=UserRole.TECH, nullable=False)
    name = Column(String, nullable=True)
    company_name = Column(String, nullable=True)
    job_type = Column(String, nullable=True)
    logo_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<User {self.email}>"
