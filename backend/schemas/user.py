from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from models.user import UserRole, JobType

class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    name: Optional[str] = None
    job_type: Optional[str] = None
    logo_url: Optional[str] = None

class UserCreate(UserBase):
    """User creation schema"""
    password: str
    role: Optional[str] = UserRole.TECH
    company_id: Optional[int] = None
    
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

class ManagerSignupWithCompany(BaseModel):
    """Manager signup schema with company creation"""
    # User fields
    email: EmailStr
    password: str
    name: str
    
    # Company fields
    company_name: str
    company_address: Optional[str] = None
    company_phone: Optional[str] = None
    company_logo_url: Optional[str] = None
    
    @field_validator('name')
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Name is required')
        return v.strip()
    
    @field_validator('company_name')
    def validate_company_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Company name is required')
        if len(v.strip()) < 2:
            raise ValueError('Company name must be at least 2 characters long')
        return v.strip()
    
    @field_validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class UserLogin(BaseModel):
    """User login schema"""
    email: EmailStr
    password: str

class UserResponse(UserBase):
    """User response schema"""
    id: int
    role: str
    company_id: Optional[int]
    is_active: bool
    force_password_reset: bool
    created_at: datetime
    
    model_config = {
        "from_attributes": True
    }

class UserWithCompanyResponse(UserResponse):
    """User response schema with company information"""
    company_name: Optional[str] = None
    company_id_str: Optional[str] = None  # company.company_id

class Token(BaseModel):
    """Token schema"""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """Token data schema"""
    user_id: Optional[int] = None
    company_id: Optional[int] = None
    role: Optional[str] = None
