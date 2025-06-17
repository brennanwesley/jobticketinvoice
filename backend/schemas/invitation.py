from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional
from datetime import datetime

class InvitationBase(BaseModel):
    """Base invitation schema"""
    email: EmailStr = Field(..., description="Email address of the technician to invite")
    name: Optional[str] = Field(None, max_length=255, description="Full name of the technician")
    invitation_message: Optional[str] = Field(None, max_length=1000, description="Optional message from manager")

class TechnicianInviteByEmail(InvitationBase):
    """Schema for inviting a technician by email"""
    
    @validator('email')
    def validate_email(cls, v):
        if not v or '@' not in v:
            raise ValueError('Valid email address is required')
        return v.lower().strip()
    
    @validator('name')
    def validate_name(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) < 2:
                raise ValueError('Name must be at least 2 characters long')
            return v
        return v

class TechnicianCreateDirect(BaseModel):
    """Schema for directly creating a technician account"""
    email: EmailStr = Field(..., description="Email address of the technician")
    name: str = Field(..., min_length=2, max_length=255, description="Full name of the technician")
    temporary_password: str = Field(..., min_length=8, description="Temporary password (will be forced to reset)")
    
    @validator('email')
    def validate_email(cls, v):
        return v.lower().strip()
    
    @validator('name')
    def validate_name(cls, v):
        return v.strip()
    
    @validator('temporary_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Temporary password must be at least 8 characters long')
        return v

class InvitationAccept(BaseModel):
    """Schema for accepting an invitation"""
    token: str = Field(..., description="Invitation token")
    password: str = Field(..., min_length=8, description="Password for the new account")
    name: Optional[str] = Field(None, max_length=255, description="Full name (if not provided in invitation)")
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        # Add more password complexity requirements as needed
        return v

class InvitationResponse(BaseModel):
    """Schema for invitation response"""
    id: int
    email: str
    name: Optional[str]
    is_used: bool
    expires_at: datetime
    created_at: datetime
    invitation_message: Optional[str]
    
    class Config:
        from_attributes = True

class InvitationListResponse(BaseModel):
    """Schema for listing invitations"""
    id: int
    email: str
    name: Optional[str]
    is_used: bool
    expires_at: datetime
    created_at: datetime
    is_expired: bool
    
    class Config:
        from_attributes = True

class InvitationStatusResponse(BaseModel):
    """Schema for invitation status check"""
    valid: bool
    message: str
    invitation: Optional[InvitationResponse] = None
