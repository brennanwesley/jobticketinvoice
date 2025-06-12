from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, DBAPIError
import logging

from database import get_db
from models import User, Company
from models.user import UserRole
from schemas.user import ManagerSignupWithCompany, UserWithCompanyResponse
from core.security import get_password_hash

router = APIRouter(prefix="/manager-signup", tags=["manager-signup"])
logger = logging.getLogger(__name__)

@router.post("/", response_model=UserWithCompanyResponse, status_code=status.HTTP_201_CREATED)
async def manager_signup_with_company(
    signup_data: ManagerSignupWithCompany,
    db: Session = Depends(get_db)
):
    """
    Manager signup with company creation
    Creates both a new company and a manager user account
    """
    try:
        # Check if user already exists with this email
        existing_user = db.query(User).filter(User.email == signup_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists"
            )
        
        # Check if company with normalized name already exists
        normalized_company_name = Company.normalize_name(signup_data.company_name)
        existing_company = db.query(Company).filter(
            Company.normalized_name == normalized_company_name
        ).first()
        
        if existing_company:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Company with name '{signup_data.company_name}' already exists"
            )
        
        # Hash the password
        hashed_password = get_password_hash(signup_data.password)
        
        # Create the company first (we need a temporary user_id for created_by)
        new_company = Company(
            name=signup_data.company_name,
            normalized_name=normalized_company_name,
            address=signup_data.company_address,
            phone=signup_data.company_phone,
            logo_url=signup_data.company_logo_url,
            created_by=None  # We'll update this after creating the user
        )
        
        db.add(new_company)
        db.flush()  # Get the company ID without committing
        
        # Create the manager user
        new_user = User(
            email=signup_data.email,
            hashed_password=hashed_password,
            name=signup_data.name,
            role=UserRole.MANAGER,
            company_id=new_company.id,
            is_active=True,
            force_password_reset=False
        )
        
        db.add(new_user)
        db.flush()  # Get the user ID
        
        # Update the company's created_by field
        new_company.created_by = new_user.id
        
        # Commit both records
        db.commit()
        db.refresh(new_user)
        db.refresh(new_company)
        
        # Prepare response with company information
        user_response = UserWithCompanyResponse(
            id=new_user.id,
            email=new_user.email,
            name=new_user.name,
            job_type=new_user.job_type,
            role=new_user.role,
            company_id=new_user.company_id,
            is_active=new_user.is_active,
            force_password_reset=new_user.force_password_reset,
            created_at=new_user.created_at,
            company_name=new_company.name,
            company_id_str=new_company.company_id
        )
        
        logger.info(f"Manager signup completed: user {new_user.email} with company '{new_company.name}'")
        return user_response
        
    except HTTPException:
        db.rollback()
        raise
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error during manager signup: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user or company with this information already exists"
        )
    except DBAPIError as e:
        db.rollback()
        logger.error(f"Database error during manager signup: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create manager account and company"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error during manager signup: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create manager account and company"
        )

@router.get("/check-company-availability/{company_name}")
async def check_company_name_availability(
    company_name: str,
    db: Session = Depends(get_db)
):
    """
    Check if a company name is available for registration
    """
    try:
        if not company_name or len(company_name.strip()) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company name must be at least 2 characters long"
            )
        
        normalized_name = Company.normalize_name(company_name)
        existing_company = db.query(Company).filter(
            Company.normalized_name == normalized_name
        ).first()
        
        return {
            "available": existing_company is None,
            "company_name": company_name.strip(),
            "normalized_name": normalized_name
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking company name availability: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check company name availability"
        )
