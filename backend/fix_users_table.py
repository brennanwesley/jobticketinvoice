#!/usr/bin/env python3
"""
Fix users table to add missing multi-tenancy columns
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from database import DATABASE_URL
import logging
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_users_table():
    """Add missing columns to users table and migrate data"""
    
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    try:
        logger.info("Starting users table fix...")
        
        with SessionLocal() as session:
            # Check if company_id column exists
            try:
                result = session.execute(text("SELECT company_id FROM users LIMIT 1")).fetchone()
                logger.info("Users table already has company_id column, no fix needed")
                return
            except:
                logger.info("Users table missing company_id column, fixing...")
            
            # Step 1: Add new columns to users table
            logger.info("Adding new columns to users table...")
            
            # Add company_id column
            session.execute(text("ALTER TABLE users ADD COLUMN company_id VARCHAR(36)"))
            
            # Add security columns
            session.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1"))
            session.execute(text("ALTER TABLE users ADD COLUMN force_password_reset BOOLEAN DEFAULT 0"))
            session.execute(text("ALTER TABLE users ADD COLUMN last_login DATETIME"))
            
            session.commit()
            logger.info("New columns added successfully")
            
            # Step 2: Create a default company for existing users
            logger.info("Creating default company for existing users...")
            
            # Get existing users with company_name
            existing_users = session.execute(
                text("SELECT id, company_name FROM users WHERE company_name IS NOT NULL")
            ).fetchall()
            
            company_mapping = {}
            
            for user in existing_users:
                company_name = user[1]
                if company_name and company_name not in company_mapping:
                    # Create a new company
                    company_id = str(uuid.uuid4())
                    normalized_name = company_name.lower().strip()
                    
                    session.execute(text("""
                        INSERT INTO companies (company_id, name, normalized_name, created_by, is_active)
                        VALUES (:company_id, :name, :normalized_name, :created_by, 1)
                    """), {
                        'company_id': company_id,
                        'name': company_name,
                        'normalized_name': normalized_name,
                        'created_by': user[0]
                    })
                    
                    company_mapping[company_name] = company_id
                    logger.info(f"Created company: {company_name} with ID: {company_id}")
            
            session.commit()
            
            # Step 3: Update users with company_id
            logger.info("Updating users with company_id...")
            
            for user in existing_users:
                user_id = user[0]
                company_name = user[1]
                if company_name and company_name in company_mapping:
                    company_id = company_mapping[company_name]
                    session.execute(text("""
                        UPDATE users SET company_id = :company_id WHERE id = :user_id
                    """), {
                        'company_id': company_id,
                        'user_id': user_id
                    })
            
            session.commit()
            logger.info("Users updated with company_id successfully")
            
            # Step 4: Update job_tickets with company_id if the column doesn't exist
            try:
                session.execute(text("SELECT company_id FROM job_tickets LIMIT 1"))
                logger.info("Job tickets table already has company_id column")
            except:
                logger.info("Adding company_id to job_tickets table...")
                session.execute(text("ALTER TABLE job_tickets ADD COLUMN company_id VARCHAR(36)"))
                
                # Update job tickets with company_id based on user
                session.execute(text("""
                    UPDATE job_tickets 
                    SET company_id = (
                        SELECT users.company_id 
                        FROM users 
                        WHERE users.id = job_tickets.user_id
                    )
                    WHERE user_id IS NOT NULL
                """))
                
                session.commit()
                logger.info("Job tickets updated with company_id successfully")
            
            logger.info("Users table fix completed successfully!")
            
    except Exception as e:
        logger.error(f"Error during users table fix: {e}")
        raise

if __name__ == "__main__":
    fix_users_table()
