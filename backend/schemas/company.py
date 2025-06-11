from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class CompanyBase(BaseModel):
    """Base company schema"""
    name: str = Field(..., min_length=1, max_length=255, description="Company name")
    address: Optional[str] = Field(None, max_length=1000, description="Company address")
    phone: Optional[str] = Field(None, max_length=20, description="Company phone number")
    logo_url: Optional[str] = Field(None, description="Company logo URL")

class CompanyCreate(CompanyBase):
    """Schema for creating a new company"""
    
    @validator('name')
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Company name cannot be empty')
        if len(v.strip()) < 2:
            raise ValueError('Company name must be at least 2 characters long')
        return v.strip()
    
    @validator('phone')
    def validate_phone(cls, v):
        if v is not None:
            # Basic phone validation - remove spaces and check if it contains only digits, +, -, (, )
            cleaned = v.replace(' ', '').replace('-', '').replace('(', '').replace(')', '').replace('+', '')
            if not cleaned.isdigit():
                raise ValueError('Phone number can only contain digits, spaces, hyphens, parentheses, and plus sign')
        return v

class CompanyUpdate(BaseModel):
    """Schema for updating company information"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    address: Optional[str] = Field(None, max_length=1000)
    phone: Optional[str] = Field(None, max_length=20)
    logo_url: Optional[str] = None
    
    @validator('name')
    def validate_name(cls, v):
        if v is not None:
            if not v or not v.strip():
                raise ValueError('Company name cannot be empty')
            if len(v.strip()) < 2:
                raise ValueError('Company name must be at least 2 characters long')
            return v.strip()
        return v

class CompanyResponse(CompanyBase):
    """Schema for company response"""
    id: int
    company_id: str
    normalized_name: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class CompanyListResponse(BaseModel):
    """Schema for company list response"""
    id: int
    company_id: str
    name: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
