from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta
from typing import List
import secrets
import logging

from database import get_db
from models import User, Company, TechnicianInvitation
from models.user import UserRole, JobType
from schemas.invitation import (
    TechnicianInviteByEmail, TechnicianCreateDirect, InvitationAccept,
    InvitationResponse, InvitationListResponse, InvitationStatusResponse
)
from schemas.user import UserResponse
from core.security import get_current_user, require_role, get_password_hash
from core.email import send_invitation_email

router = APIRouter(prefix="/invitations", tags=["invitations"])
logger = logging.getLogger(__name__)

@router.post("/invite-technician", response_model=InvitationResponse, status_code=status.HTTP_201_CREATED)
async def invite_technician_by_email(
    invitation_data: TechnicianInviteByEmail,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.MANAGER, UserRole.ADMIN]))
):
    """
    Send an email invitation to a technician (Manager/Admin only)
    """
    try:
        # Check if user already exists with this email
        existing_user = db.query(User).filter(User.email == invitation_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists"
            )
        
        # Check if there's already a pending invitation for this email in this company
        existing_invitation = db.query(TechnicianInvitation).filter(
            TechnicianInvitation.email == invitation_data.email,
            TechnicianInvitation.company_id == current_user.company_id,
            TechnicianInvitation.is_used == False
        ).first()
        
        if existing_invitation and not existing_invitation.is_expired:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Pending invitation already exists for this email"
            )
        
        # Create new invitation
        new_invitation = TechnicianInvitation(
            email=invitation_data.email,
            name=invitation_data.name,
            job_type=invitation_data.job_type,
            invitation_message=invitation_data.message,
            company_id=current_user.company_id,
            invited_by=current_user.id
        )
        
        db.add(new_invitation)
        db.commit()
        db.refresh(new_invitation)
        
        # Send invitation email in background
        try:
            email_sent = send_invitation_email(
                to_email=invitation_data.email,
                technician_name=invitation_data.name,
                company_name=current_user.company.name,
                inviter_name=current_user.name,
                invitation_token=new_invitation.token,
                invitation_message=invitation_data.message
            )
            
            if not email_sent:
                logger.warning(f"Failed to send invitation email to {invitation_data.email}")
            else:
                logger.info(f"Invitation email sent successfully to {invitation_data.email}")
                
        except Exception as e:
            logger.error(f"Error sending invitation email: {str(e)}")
            # Don't fail the invitation creation if email fails
        
        logger.info(f"Technician invitation sent to {invitation_data.email} by user {current_user.id}")
        return new_invitation
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating technician invitation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send invitation"
        )

@router.post("/create-technician-direct", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_technician_directly(
    technician_data: TechnicianCreateDirect,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.MANAGER, UserRole.ADMIN]))
):
    """
    Create a technician account directly without email invitation (Manager/Admin only)
    """
    logger.info("🚀 create_technician_directly endpoint called")
    logger.info(f"👤 Current user: {current_user.email if current_user else 'None'}")
    logger.info(f"🏢 Current user company: {current_user.company_id if current_user else 'None'}")
    logger.info(f"📋 Technician data: {technician_data.dict()}")
    
    try:
        logger.info(f"🔍 Checking if user exists with email: {technician_data.email}")
        # Check if user already exists with this email
        existing_user = db.query(User).filter(User.email == technician_data.email).first()
        if existing_user:
            logger.warning(f"❌ User already exists with email: {technician_data.email}")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists"
            )
        
        logger.info("🔐 Hashing password...")
        # Create new technician user
        hashed_password = get_password_hash(technician_data.temporary_password)
        
        logger.info("👤 Creating new user object...")
        new_user = User(
            email=technician_data.email,
            hashed_password=hashed_password,
            name=technician_data.name,
            role=UserRole.TECH,
            job_type=technician_data.job_type,
            company_id=current_user.company_id,
            is_active=True,
            force_password_reset=True  # Force password reset on first login
        )
        
        logger.info(f"💾 Saving user to database: {new_user.email}")
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"✅ Technician account created successfully for {technician_data.email} by user {current_user.id}")
        return new_user
        
    except HTTPException:
        logger.error("❌ HTTPException occurred, re-raising")
        raise
    except IntegrityError as e:
        db.rollback()
        logger.error(f"❌ Database integrity error creating technician: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Unexpected error creating technician: {str(e)}")
        logger.error(f"❌ Exception type: {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create technician account: {str(e)}"
        )

@router.post("/accept/{token}", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def accept_invitation(
    token: str,
    acceptance_data: InvitationAccept,
    db: Session = Depends(get_db)
):
    """
    Accept a technician invitation and create account
    """
    try:
        # Validate token matches the one in the request body
        if token != acceptance_data.token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token mismatch"
            )
        
        # Find the invitation
        invitation = db.query(TechnicianInvitation).filter(
            TechnicianInvitation.token == token
        ).first()
        
        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid invitation token"
            )
        
        # Check if invitation is valid
        if not invitation.is_valid:
            if invitation.is_used:
                detail = "Invitation has already been used"
            elif invitation.is_expired:
                detail = "Invitation has expired"
            else:
                detail = "Invalid invitation"
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=detail
            )
        
        # Check if user already exists with this email
        existing_user = db.query(User).filter(User.email == invitation.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists"
            )
        
        # Create new user account
        hashed_password = get_password_hash(acceptance_data.password)
        
        # Use name from acceptance data if provided, otherwise from invitation
        user_name = acceptance_data.name if acceptance_data.name else invitation.name
        
        new_user = User(
            email=invitation.email,
            hashed_password=hashed_password,
            name=user_name,
            role=UserRole.TECH,
            job_type=invitation.job_type,
            company_id=invitation.company_id,
            is_active=True,
            force_password_reset=False
        )
        
        db.add(new_user)
        
        # Mark invitation as used
        invitation.mark_as_used()
        
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"Invitation accepted and user created for {invitation.email}")
        return new_user
        
    except HTTPException:
        raise
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error accepting invitation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error accepting invitation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to accept invitation"
        )

@router.get("/check/{token}", response_model=InvitationStatusResponse)
async def check_invitation_status(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Check the status of an invitation token
    """
    try:
        invitation = db.query(TechnicianInvitation).filter(
            TechnicianInvitation.token == token
        ).first()
        
        if not invitation:
            return InvitationStatusResponse(
                valid=False,
                message="Invalid invitation token",
                invitation=None
            )
        
        if invitation.is_used:
            return InvitationStatusResponse(
                valid=False,
                message="Invitation has already been used",
                invitation=invitation
            )
        
        if invitation.is_expired:
            return InvitationStatusResponse(
                valid=False,
                message="Invitation has expired",
                invitation=invitation
            )
        
        return InvitationStatusResponse(
            valid=True,
            message="Invitation is valid",
            invitation=invitation
        )
        
    except Exception as e:
        logger.error(f"Error checking invitation status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check invitation status"
        )

@router.get("/", response_model=List[InvitationListResponse])
async def list_company_invitations(
    skip: int = 0,
    limit: int = 100,
    include_used: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.MANAGER, UserRole.ADMIN]))
):
    """
    List invitations for the current user's company (Manager/Admin only)
    """
    try:
        query = db.query(TechnicianInvitation).filter(
            TechnicianInvitation.company_id == current_user.company_id
        )
        
        if not include_used:
            query = query.filter(TechnicianInvitation.is_used == False)
        
        invitations = query.offset(skip).limit(limit).all()
        
        # Add is_expired property to each invitation for the response
        invitation_responses = []
        for invitation in invitations:
            invitation_dict = invitation.__dict__.copy()
            invitation_dict['is_expired'] = invitation.is_expired
            invitation_responses.append(InvitationListResponse(**invitation_dict))
        
        return invitation_responses
        
    except Exception as e:
        logger.error(f"Error listing invitations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve invitations"
        )

@router.delete("/{invitation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_invitation(
    invitation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.MANAGER, UserRole.ADMIN]))
):
    """
    Cancel a pending invitation (Manager/Admin only)
    """
    try:
        invitation = db.query(TechnicianInvitation).filter(
            TechnicianInvitation.id == invitation_id,
            TechnicianInvitation.company_id == current_user.company_id,
            TechnicianInvitation.is_used == False
        ).first()
        
        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found or already used"
            )
        
        # Mark as used to effectively cancel it
        invitation.mark_as_used()
        db.commit()
        
        logger.info(f"Invitation {invitation_id} cancelled by user {current_user.id}")
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error cancelling invitation {invitation_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel invitation"
        )
