#!/usr/bin/env python3
"""
Create a test admin user for testing audit functionality
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import DATABASE_URL
from models.user import User
from models.company import Company
from core.security import get_password_hash
import logging
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_test_user():
    """Create a test admin user"""
    
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    try:
        logger.info("Creating test admin user...")
        
        with SessionLocal() as session:
            # Check if user already exists
            existing_user = session.query(User).filter(User.email == "admin@test.com").first()
            if existing_user:
                logger.info("Test admin user already exists")
                return existing_user
            
            # Create a test company first
            test_company = Company(
                company_id=str(uuid.uuid4()),
                name="Test Company",
                normalized_name="test company",
                created_by=1,  # Will be updated after user creation
                is_active=True
            )
            session.add(test_company)
            session.flush()  # Get the company ID
            
            # Create test admin user
            test_user = User(
                email="admin@test.com",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                name="Test Admin",
                company_id=test_company.company_id,
                is_active=True,
                force_password_reset=False
            )
            session.add(test_user)
            session.flush()  # Get the user ID
            
            # Update company created_by
            test_company.created_by = test_user.id
            
            session.commit()
            
            logger.info(f"Test admin user created:")
            logger.info(f"  Email: admin@test.com")
            logger.info(f"  Password: admin123")
            logger.info(f"  Role: admin")
            logger.info(f"  Company: {test_company.name}")
            
            return test_user
            
    except Exception as e:
        logger.error(f"Error creating test user: {e}")
        raise

if __name__ == "__main__":
    create_test_user()
