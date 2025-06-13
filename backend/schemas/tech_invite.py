from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional
from datetime import datetime

class TechInviteCreate(BaseModel):
    """Schema for creating a tech invite"""
    tech_name: str = Field(..., min_length=2, max_length=255, description="Full name of the technician")
    email: EmailStr = Field(..., description="Email address of the technician")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number of the technician")
    
    @validator('email')
    def validate_email(cls, v):
        return v.lower().strip()
    
    @validator('tech_name')
    def validate_name(cls, v):
        return v.strip()
    
    @validator('phone')
    def validate_phone(cls, v):
        if v is not None:
            # Remove all non-digit characters for validation
            digits_only = ''.join(filter(str.isdigit, v))
            if len(digits_only) < 10:
                raise ValueError('Phone number must contain at least 10 digits')
            return v.strip()
        return v

class TechInviteResponse(BaseModel):
    """Schema for tech invite response"""
    invite_id: str
    tech_name: str
    email: str
    phone: Optional[str]
    status: str
    created_at: datetime
    expires_at: datetime
    
    class Config:
        from_attributes = True

class TechInviteTokenResponse(BaseModel):
    """Schema for tech invite token generation response"""
    invite_id: str
    token: str
    expires_at: datetime
    sms_link: Optional[str] = None
    email_link: Optional[str] = None

class TechInviteValidationResponse(BaseModel):
    """Schema for tech invite token validation response"""
    valid: bool
    message: str
    tech_name: Optional[str] = None
    email: Optional[str] = None
    company_name: Optional[str] = None
    expires_at: Optional[datetime] = None

class TechInviteRedemptionRequest(BaseModel):
    """Schema for tech invite token redemption"""
    token: str = Field(..., description="JWT invite token")
    password: str = Field(..., min_length=8, description="Password for the new tech account")
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        # Add more password complexity requirements if needed
        return v

class TechInviteRedemptionResponse(BaseModel):
    """Schema for tech invite redemption response"""
    success: bool
    message: str
    user_id: Optional[int] = None
    access_token: Optional[str] = None
    token_type: Optional[str] = "bearer"
