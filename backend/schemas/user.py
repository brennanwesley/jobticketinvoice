from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from models.user import UserRole, JobType

class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    name: Optional[str] = None
    company_name: Optional[str] = None
    job_type: Optional[str] = None
    logo_url: Optional[str] = None

class UserCreate(UserBase):
    """User creation schema"""
    password: str
    role: Optional[str] = UserRole.TECH
    
    @field_validator('role')
    def validate_role(cls, v):
        """Validate role is one of the allowed values"""
        if v not in [role.value for role in UserRole]:
            raise ValueError(f"Role must be one of: {', '.join([role.value for role in UserRole])}")
        return v
        
    @field_validator('job_type')
    def validate_job_type(cls, v):
        """Validate job_type is one of the allowed values or None"""
        if v is not None and v not in [job_type.value for job_type in JobType]:
            raise ValueError(f"Job type must be one of: {', '.join([job_type.value for job_type in JobType])}")
        return v

class UserLogin(BaseModel):
    """User login schema"""
    email: EmailStr
    password: str

class UserResponse(UserBase):
    """User response schema"""
    id: int
    role: str
    created_at: datetime
    
    model_config = {
        "from_attributes": True
    }

class Token(BaseModel):
    """Token schema"""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """Token data schema"""
    user_id: Optional[int] = None
