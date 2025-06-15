from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
import logging

from database import get_db
from models.user import User, UserRole
from schemas.user import UserResponse
from core.security import get_password_hash, require_role

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tech-accounts", tags=["tech-accounts"])

class TechAccountCreate(BaseModel):
    """Schema for creating a technician account directly"""
    full_name: str = Field(..., min_length=2, max_length=255, description="Full name of the technician")
    email: EmailStr = Field(..., description="Email address of the technician")
    phone: Optional[str] = Field(None, description="Phone number of the technician")
    password: str = Field(..., min_length=8, description="Password for the technician account")
    
    @validator('email')
    def validate_email(cls, v):
        return v.lower().strip()
    
    @validator('full_name')
    def validate_name(cls, v):
        return v.strip()
    
    @validator('phone')
    def validate_phone(cls, v):
        if v:
            return v.strip()
        return v

@router.post("/create", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_tech_account(
    tech_data: TechAccountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.MANAGER, UserRole.ADMIN]))
):
    """
    Create a technician account directly
    """
    try:
        # Check if user already exists with this email
        existing_user = db.query(User).filter(User.email == tech_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists"
            )
        
        # Hash the password securely
        hashed_password = get_password_hash(tech_data.password)
        
        # Create new user with role: "tech", status: "active", linked to manager's company
        new_user = User(
            email=tech_data.email,
            hashed_password=hashed_password,
            name=tech_data.full_name,
            phone=tech_data.phone,
            role=UserRole.TECH,
            company_id=current_user.company_id,
            is_active=True,
            force_password_reset=False  # User can use the password they set
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"Tech account created for {tech_data.email} by manager {current_user.id}")
        return new_user
        
    except HTTPException:
        raise
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error creating tech account: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating tech account: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create tech account"
        )
