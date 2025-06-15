"""
Tech Onboarding Invite System Routes
Secure manager-controlled onboarding of field technicians
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from typing import List
import logging

from database import get_db
from models import User, Company, TechInvite
from models.user import UserRole
from schemas.tech_invite import (
    TechInviteCreate, TechInviteResponse, TechInviteTokenResponse,
    TechInviteValidationResponse, TechInviteRedemptionRequest, TechInviteRedemptionResponse,
    TechInviteEmailRequest, TechInviteEmailResponse
)
from core.security import get_current_user, require_role, get_password_hash, create_user_token
from core.invite_tokens import InviteTokenService
from core.email_service import email_service
from core.config import settings

router = APIRouter(prefix="/tech-invites", tags=["tech-invites"])
logger = logging.getLogger(__name__)

@router.post("/", response_model=TechInviteTokenResponse, status_code=status.HTTP_201_CREATED)
async def create_tech_invite(
    invite_data: TechInviteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.MANAGER, UserRole.ADMIN]))
):
    """
    Generate a secure tech invite token (Manager/Admin only)
    Creates database record and returns JWT token for SMS/Email delivery
    """
    try:
        # Check if user already exists with this email
        existing_user = db.query(User).filter(User.email == invite_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists"
            )
        
        # Check if there's already a pending invite for this email in this company
        existing_invite = db.query(TechInvite).filter(
            TechInvite.email == invite_data.email,
            TechInvite.company_id == current_user.company.company_id,
            TechInvite.status == "pending"
        ).first()
        
        if existing_invite and existing_invite.is_valid:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Pending invite already exists for this email"
            )
        
        # Create new tech invite record
        tech_invite = TechInvite(
            tech_name=invite_data.tech_name,
            email=invite_data.email,
            phone=invite_data.phone,
            company_id=current_user.company.company_id,
            created_by=current_user.id
        )
        
        db.add(tech_invite)
        db.commit()
        db.refresh(tech_invite)
        
        # Generate secure JWT token
        token = InviteTokenService.generate_invite_token(
            invite_id=tech_invite.invite_id,
            company_id=current_user.company.company_id,
            tech_name=invite_data.tech_name,
            email=invite_data.email
        )
        
        # Generate signup links for SMS/Email
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        signup_link = InviteTokenService.generate_signup_link(token, frontend_url)
        
        logger.info(f"Created tech invite {tech_invite.invite_id} for {invite_data.email} by {current_user.email}")
        
        return TechInviteTokenResponse(
            invite_id=tech_invite.invite_id,
            token=token,
            expires_at=tech_invite.expires_at,
            sms_link=signup_link,
            email_link=signup_link
        )
        
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error creating tech invite: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Invite creation failed due to data conflict"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating tech invite: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create tech invite"
        )

@router.get("/validate", response_model=TechInviteValidationResponse)
async def validate_invite_token(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Validate an invite token and return pre-fill data
    Used by /signup-tech page to validate and populate form
    """
    try:
        # Validate JWT token structure and claims
        payload = InviteTokenService.validate_invite_token(token)
        
        # Extract invite details from token
        invite_id = payload.get("invite_id")
        company_id = payload.get("company_id")
        
        # Verify invite exists in database and is still valid
        tech_invite = db.query(TechInvite).filter(
            TechInvite.invite_id == invite_id,
            TechInvite.company_id == company_id
        ).first()
        
        if not tech_invite:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invite not found"
            )
        
        if not tech_invite.is_valid:
            status_msg = "expired" if tech_invite.is_expired else tech_invite.status
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail=f"Invite is {status_msg}"
            )
        
        # Get company name for display
        company = db.query(Company).filter(Company.company_id == company_id).first()
        company_name = company.name if company else "Unknown Company"
        
        logger.info(f"Validated invite token for {tech_invite.email} (invite_id: {invite_id})")
        
        return TechInviteValidationResponse(
            valid=True,
            message="Invite token is valid",
            tech_name=tech_invite.tech_name,
            email=tech_invite.email,
            company_name=company_name,
            expires_at=tech_invite.expires_at
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions (token validation errors)
        raise
    except Exception as e:
        logger.error(f"Error validating invite token: {str(e)}")
        return TechInviteValidationResponse(
            valid=False,
            message="Invalid or expired invite token"
        )

@router.post("/redeem", response_model=TechInviteRedemptionResponse)
async def redeem_invite_token(
    redemption_data: TechInviteRedemptionRequest,
    db: Session = Depends(get_db)
):
    """
    Redeem an invite token to create tech user account
    Single-use token redemption with automatic user creation
    """
    try:
        # Validate JWT token
        payload = InviteTokenService.validate_invite_token(redemption_data.token)
        
        # Extract invite details
        invite_id = payload.get("invite_id")
        company_id = payload.get("company_id")
        tech_name = payload.get("tech_name")
        email = payload.get("email")
        
        # Verify invite exists and is valid
        tech_invite = db.query(TechInvite).filter(
            TechInvite.invite_id == invite_id,
            TechInvite.company_id == company_id
        ).first()
        
        if not tech_invite:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invite not found"
            )
        
        if not tech_invite.is_valid:
            status_msg = "expired" if tech_invite.is_expired else tech_invite.status
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail=f"Invite is {status_msg}"
            )
        
        # Check if user already exists (race condition protection)
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User account already exists"
            )
        
        # Get company for user creation
        company = db.query(Company).filter(Company.company_id == company_id).first()
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found"
            )
        
        # Create new tech user account
        hashed_password = get_password_hash(redemption_data.password)
        new_user = User(
            email=email,
            name=tech_name,
            hashed_password=hashed_password,
            role=UserRole.TECH,
            company_id=company.id,
            is_active=True,
            force_password_reset=False  # User just set their own password
        )
        
        db.add(new_user)
        
        # Mark invite as used
        tech_invite.mark_as_used()
        
        # Commit transaction
        db.commit()
        db.refresh(new_user)
        
        # Generate access token for immediate login
        access_token = create_user_token(new_user)
        
        logger.info(f"Successfully redeemed invite {invite_id} - created user {new_user.id} ({email})")
        
        return TechInviteRedemptionResponse(
            success=True,
            message="Account created successfully",
            user_id=new_user.id,
            access_token=access_token,
            token_type="bearer"
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error during invite redemption: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Account creation failed - user may already exist"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error redeeming invite token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create account"
        )

@router.get("/", response_model=List[TechInviteResponse])
async def list_tech_invites(
    skip: int = 0,
    limit: int = 100,
    status_filter: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.MANAGER, UserRole.ADMIN]))
):
    """
    List tech invites for the current user's company (Manager/Admin only)
    Supports filtering by status and pagination
    """
    try:
        query = db.query(TechInvite).filter(
            TechInvite.company_id == current_user.company.company_id
        )
        
        # Apply status filter if provided
        if status_filter:
            query = query.filter(TechInvite.status == status_filter)
        
        # Apply pagination
        invites = query.offset(skip).limit(limit).all()
        
        # Update expired invites
        for invite in invites:
            if invite.status == "pending" and invite.is_expired:
                invite.mark_as_expired()
        
        db.commit()
        
        return invites
        
    except Exception as e:
        logger.error(f"Error listing tech invites: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve invites"
        )

@router.delete("/{invite_id}")
async def cancel_tech_invite(
    invite_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.MANAGER, UserRole.ADMIN]))
):
    """
    Cancel a pending tech invite (Manager/Admin only)
    """
    try:
        tech_invite = db.query(TechInvite).filter(
            TechInvite.invite_id == invite_id,
            TechInvite.company_id == current_user.company.company_id
        ).first()
        
        if not tech_invite:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invite not found"
            )
        
        if tech_invite.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot cancel invite with status: {tech_invite.status}"
            )
        
        tech_invite.mark_as_cancelled()
        db.commit()
        
        logger.info(f"Cancelled tech invite {invite_id} by {current_user.email}")
        
        return {"message": "Invite cancelled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error cancelling tech invite: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel invite"
        )

@router.post("/send-email", response_model=TechInviteEmailResponse, status_code=status.HTTP_200_OK)
async def send_tech_invite_email(
    email_request: TechInviteEmailRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.MANAGER, UserRole.ADMIN]))
):
    """
    Send tech invite via email using SendGrid (Manager/Admin only)
    Creates invite record and sends secure onboarding link via email
    """
    try:
        # Validate user has company access
        if not current_user.company:
            logger.error(f"User {current_user.email} does not have an associated company")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User must be associated with a company to send invitations"
            )
        
        # Check if user already exists with this email
        existing_user = db.query(User).filter(User.email == email_request.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists"
            )
        
        # Check if there's already a pending invite for this email in this company
        existing_invite = db.query(TechInvite).filter(
            TechInvite.email == email_request.email,
            TechInvite.company_id == current_user.company.company_id,
            TechInvite.status == "pending"
        ).first()
        
        if existing_invite:
            # Update existing invite
            invite_record = existing_invite
            logger.info(f"Updating existing invite for {email_request.email}")
        else:
            # Create new invite record
            invite_record = TechInvite(
                tech_name=email_request.tech_name,
                email=email_request.email,
                company_id=current_user.company.company_id,
                created_by=current_user.id,
                delivery_method="email"
            )
            db.add(invite_record)
        
        # Update delivery method and status
        invite_record.delivery_method = "email"
        invite_record.status = "pending"
        
        # Generate secure invite token
        token_service = InviteTokenService()
        invite_token = token_service.create_invite_token(
            invite_id=invite_record.invite_id,
            tech_name=email_request.tech_name,
            email=email_request.email,
            company_id=current_user.company.company_id
        )
        
        # Send email via SendGrid
        email_sent = await email_service.send_tech_invitation(
            tech_name=email_request.tech_name,
            tech_email=email_request.email,
            company_name=current_user.company.company_name,
            invite_token=invite_token
        )
        
        if not email_sent:
            db.rollback()
            logger.error(f"Failed to send email to {email_request.email}")
            return TechInviteEmailResponse(
                success=False,
                message="Unable to send invite. Please try again later."
            )
        
        # Commit the database changes
        db.commit()
        
        logger.info(f"Tech invite email sent successfully to {email_request.email}")
        return TechInviteEmailResponse(
            success=True,
            message=f"Invitation sent successfully to {email_request.email}",
            invite_id=invite_record.invite_id
        )
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error sending tech invite email: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send invitation email"
        )
