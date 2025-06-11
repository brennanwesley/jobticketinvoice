from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
import logging

from database import get_db
from models import Company, User
from models.user import UserRole
from schemas.company import CompanyCreate, CompanyUpdate, CompanyResponse, CompanyListResponse
from core.security import get_current_user, require_role

router = APIRouter(prefix="/companies", tags=["companies"])
logger = logging.getLogger(__name__)

@router.post("/", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
async def create_company(
    company_data: CompanyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """
    Create a new company (Admin only)
    """
    try:
        # Check if company with normalized name already exists
        normalized_name = Company.normalize_name(company_data.name)
        existing_company = db.query(Company).filter(
            Company.normalized_name == normalized_name
        ).first()
        
        if existing_company:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Company with name '{company_data.name}' already exists"
            )
        
        # Create new company
        new_company = Company(
            name=company_data.name,
            normalized_name=normalized_name,
            address=company_data.address,
            phone=company_data.phone,
            logo_url=company_data.logo_url,
            created_by=current_user.id
        )
        
        db.add(new_company)
        db.commit()
        db.refresh(new_company)
        
        logger.info(f"Company '{company_data.name}' created by user {current_user.id}")
        return new_company
        
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error creating company: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Company with this name already exists"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating company: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create company"
        )

@router.get("/", response_model=List[CompanyListResponse])
async def list_companies(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """
    List all companies (Admin only)
    """
    try:
        companies = db.query(Company).filter(
            Company.is_active == True
        ).offset(skip).limit(limit).all()
        
        return companies
        
    except Exception as e:
        logger.error(f"Error listing companies: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve companies"
        )

@router.get("/my-company", response_model=CompanyResponse)
async def get_my_company(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get current user's company information
    """
    try:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User is not associated with any company"
            )
        
        company = db.query(Company).filter(
            Company.id == current_user.company_id,
            Company.is_active == True
        ).first()
        
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found"
            )
        
        return company
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user's company: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve company information"
        )

@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get company by ID (users can only access their own company, admins can access any)
    """
    try:
        # Check permissions
        if current_user.role != UserRole.ADMIN and current_user.company_id != company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You can only access your own company information"
            )
        
        company = db.query(Company).filter(
            Company.id == company_id,
            Company.is_active == True
        ).first()
        
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found"
            )
        
        return company
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting company {company_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve company"
        )

@router.put("/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: int,
    company_update: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update company information (managers can update their own company, admins can update any)
    """
    try:
        # Check permissions
        if (current_user.role not in [UserRole.ADMIN, UserRole.MANAGER] or 
            (current_user.role == UserRole.MANAGER and current_user.company_id != company_id)):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Insufficient permissions to update this company"
            )
        
        company = db.query(Company).filter(
            Company.id == company_id,
            Company.is_active == True
        ).first()
        
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found"
            )
        
        # Update fields if provided
        update_data = company_update.model_dump(exclude_unset=True)
        
        # Handle name change with normalization check
        if "name" in update_data:
            new_normalized_name = Company.normalize_name(update_data["name"])
            
            # Check if another company already has this normalized name
            existing_company = db.query(Company).filter(
                Company.normalized_name == new_normalized_name,
                Company.id != company_id
            ).first()
            
            if existing_company:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Company with name '{update_data['name']}' already exists"
                )
            
            company.name = update_data["name"]
            company.normalized_name = new_normalized_name
        
        # Update other fields
        for field, value in update_data.items():
            if field != "name" and hasattr(company, field):
                setattr(company, field, value)
        
        db.commit()
        db.refresh(company)
        
        logger.info(f"Company {company_id} updated by user {current_user.id}")
        return company
        
    except HTTPException:
        raise
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error updating company: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Company with this name already exists"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating company {company_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update company"
        )

@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """
    Deactivate a company (soft delete, Admin only)
    """
    try:
        company = db.query(Company).filter(
            Company.id == company_id,
            Company.is_active == True
        ).first()
        
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found"
            )
        
        # Soft delete - set is_active to False
        company.is_active = False
        db.commit()
        
        logger.info(f"Company {company_id} deactivated by admin user {current_user.id}")
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deactivating company {company_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to deactivate company"
        )
