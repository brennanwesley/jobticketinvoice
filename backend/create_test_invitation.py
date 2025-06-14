#!/usr/bin/env python3
"""
Create a test invitation token for testing the technician signup flow
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_db
from models import User, Company, TechnicianInvitation
from models.user import UserRole, JobType
from datetime import datetime, timedelta
import secrets

def create_test_invitation():
    """Create a test invitation for technician signup testing"""
    
    # Get database session
    db = next(get_db())
    
    try:
        # Find a manager user to create the invitation
        manager = db.query(User).filter(
            User.role == UserRole.MANAGER,
            User.is_active == True
        ).first()
        
        if not manager:
            print("No active manager found. Creating a test manager first...")
            
            # Create a test company
            test_company = Company(
                name="Test Company",
                address="123 Test St",
                phone="555-123-4567",
                created_by=None  # Will be updated after manager creation
            )
            db.add(test_company)
            db.flush()  # Get the company ID
            
            # Create a test manager
            from core.security import get_password_hash
            manager = User(
                email="test.manager@example.com",
                hashed_password=get_password_hash("testpassword123"),
                name="Test Manager",
                role=UserRole.MANAGER,
                company_id=test_company.id,
                is_active=True
            )
            db.add(manager)
            db.flush()
            
            # Update company created_by
            test_company.created_by = manager.id
            db.commit()
            
            print(f"Created test manager: {manager.email} (Company: {test_company.name})")
        
        # Create a test invitation
        invitation_token = secrets.token_urlsafe(32)
        test_email = "test.technician@example.com"
        
        # Check if invitation already exists
        existing_invitation = db.query(TechnicianInvitation).filter(
            TechnicianInvitation.email == test_email,
            TechnicianInvitation.company_id == manager.company_id,
            TechnicianInvitation.is_used == False
        ).first()
        
        if existing_invitation:
            print(f"Existing invitation found for {test_email}")
            print(f"Token: {existing_invitation.token}")
            print(f"Expires: {existing_invitation.expires_at}")
            print(f"Test URL: http://localhost:3000/signup-tech?token={existing_invitation.token}")
            return existing_invitation.token
        
        # Create new invitation
        invitation = TechnicianInvitation(
            email=test_email,
            name="Test Technician",
            job_type=JobType.GENERAL_MAINTENANCE,
            company_id=manager.company_id,
            invited_by=manager.id,
            token=invitation_token,
            expires_at=datetime.utcnow() + timedelta(hours=48),
            invitation_message="Welcome to our team! Please complete your registration."
        )
        
        db.add(invitation)
        db.commit()
        
        print("✅ Test invitation created successfully!")
        print(f"📧 Email: {test_email}")
        print(f"🔑 Token: {invitation_token}")
        print(f"⏰ Expires: {invitation.expires_at}")
        print(f"🏢 Company: {manager.company.name}")
        print(f"👤 Invited by: {manager.name}")
        print()
        print(f"🌐 Test URL: http://localhost:3000/signup-tech?token={invitation_token}")
        print()
        print("You can now test the technician signup flow by visiting the URL above!")
        
        return invitation_token
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating test invitation: {str(e)}")
        return None
    finally:
        db.close()

if __name__ == "__main__":
    create_test_invitation()
