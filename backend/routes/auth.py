from datetime import timedelta
import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from models.user import User
from schemas.user import UserCreate, UserResponse, Token, UserWithCompanyResponse
from core.security import (
    verify_password, get_password_hash, create_user_token, 
    get_current_user, require_role
)
from models.user import UserRole
from core.config import settings

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user (requires company_id)"""
    # Check if user with given email already exists
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Validate company_id is provided
    if not user_data.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company ID is required for user registration"
        )
    
    # Verify company exists
    from models import Company
    company = db.query(Company).filter(
        Company.id == user_data.company_id,
        Company.is_active == True
    ).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid company ID"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        role=user_data.role,
        name=user_data.name,
        company_id=user_data.company_id,
        job_type=user_data.job_type,
        is_active=True,
        force_password_reset=False
    )
    
    # Save user to database
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return UserResponse(
        id=db_user.id,
        email=db_user.email,
        name=db_user.name,
        role=db_user.role,
        company_id=db_user.company_id,
        is_active=db_user.is_active,
        force_password_reset=db_user.force_password_reset,
        created_at=db_user.created_at
    )

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login and get access token with multi-tenancy support"""
    # Find user by email
    user = db.query(User).filter(User.email == form_data.username).first()
    
    # Validate user exists and password is correct
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is deactivated"
        )
    
    # Create access token with multi-tenancy claims
    access_token = create_user_token(user)
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/upload-logo")
async def upload_company_logo(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role([UserRole.MANAGER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Upload company logo for manager users"""
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Validate file size (5MB limit)
    if file.size > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size must be less than 5MB"
        )
    
    # Create uploads directory if it doesn't exist
    upload_dir = "uploads/logos"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    filename = f"company_{current_user.company_id}_{current_user.id}.{file_extension}"
    file_path = os.path.join(upload_dir, filename)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save file"
        )
    
    # Update company logo URL
    from models import Company
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if company:
        company.logo_url = f"/uploads/logos/{filename}"
        db.commit()
    
    return {"message": "Logo uploaded successfully", "logo_url": f"/uploads/logos/{filename}"}

@router.get("/me", response_model=UserWithCompanyResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user information with company details"""
    # Get company information
    company_name = None
    company_id_str = None
    
    if current_user.company_id:
        from models import Company
        company = db.query(Company).filter(Company.id == current_user.company_id).first()
        if company:
            company_name = company.name
            company_id_str = company.company_id
    
    return UserWithCompanyResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role,
        company_id=current_user.company_id,
        is_active=current_user.is_active,
        force_password_reset=current_user.force_password_reset,
        created_at=current_user.created_at,
        company_name=company_name,
        company_id_str=company_id_str
    )

@router.post("/change-password")
async def change_password(
    current_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    # Verify current password
    if not verify_password(current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Validate new password
    if len(new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long"
        )
    
    # Update password
    current_user.hashed_password = get_password_hash(new_password)
    current_user.force_password_reset = False  # Clear force reset flag
    db.commit()
    
    return {"message": "Password changed successfully"}
