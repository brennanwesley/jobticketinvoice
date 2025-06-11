"""
Database migration script for multi-tenancy support
Adds Company and TechnicianInvitation tables and updates existing tables
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from database import DATABASE_URL, Base
from models import Company, TechnicianInvitation, User, JobTicket
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_migration():
    """Run the multi-tenancy migration"""
    
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    try:
        logger.info("Starting multi-tenancy migration...")
        
        with SessionLocal() as session:
            # Check if companies table already exists
            try:
                result = session.execute(text("SELECT COUNT(*) FROM companies")).fetchone()
                logger.info("Companies table already exists, skipping migration")
                return
            except:
                logger.info("Companies table doesn't exist, proceeding with migration...")
            
            # Step 1: Backup existing data
            logger.info("Backing up existing user data...")
            existing_users = session.execute(
                text("SELECT id, email, hashed_password, role, name, company_name, job_type, created_at, updated_at FROM users")
            ).fetchall()
            
            existing_job_tickets = session.execute(
                text("SELECT * FROM job_tickets")
            ).fetchall()
            
            # Get column names for job_tickets
            job_ticket_columns = [col[0] for col in session.execute(text("PRAGMA table_info(job_tickets)")).fetchall()]
            
            logger.info(f"Backed up {len(existing_users)} users and {len(existing_job_tickets)} job tickets")
            
            # Step 2: Drop existing tables (SQLite approach)
            logger.info("Dropping existing tables...")
            session.execute(text("DROP TABLE IF EXISTS job_tickets"))
            session.execute(text("DROP TABLE IF EXISTS users"))
            session.commit()
            
            # Step 3: Create all tables with new schema
            logger.info("Creating new tables with updated schema...")
            Base.metadata.create_all(bind=engine)
            
            # Step 4: Create companies from existing user data
            logger.info("Creating companies from existing user data...")
            company_map = {}
            
            for user_data in existing_users:
                user_id, email, hashed_password, role, name, company_name, job_type, created_at, updated_at = user_data
                
                if not company_name:
                    company_name = f"Company for {email}"
                
                normalized_name = Company.normalize_name(company_name)
                
                if normalized_name not in company_map:
                    # Create new company
                    new_company = Company(
                        name=company_name,
                        normalized_name=normalized_name,
                        created_by=user_id
                    )
                    session.add(new_company)
                    session.flush()  # Get the ID
                    
                    company_map[normalized_name] = new_company.id
                    logger.info(f"Created company '{company_name}'")
            
            session.commit()
            
            # Step 5: Recreate users with company_id
            logger.info("Recreating users with company relationships...")
            user_id_map = {}  # old_id -> new_id
            
            for user_data in existing_users:
                old_user_id, email, hashed_password, role, name, company_name, job_type, created_at, updated_at = user_data
                
                if not company_name:
                    company_name = f"Company for {email}"
                
                normalized_name = Company.normalize_name(company_name)
                company_id = company_map[normalized_name]
                
                # Insert user with new schema
                result = session.execute(
                    text("""
                        INSERT INTO users (email, hashed_password, role, name, job_type, company_id, is_active, force_password_reset, created_at, updated_at)
                        VALUES (:email, :hashed_password, :role, :name, :job_type, :company_id, :is_active, :force_password_reset, :created_at, :updated_at)
                    """),
                    {
                        "email": email,
                        "hashed_password": hashed_password,
                        "role": role,
                        "name": name,
                        "job_type": job_type,
                        "company_id": company_id,
                        "is_active": True,
                        "force_password_reset": False,
                        "created_at": created_at,
                        "updated_at": updated_at
                    }
                )
                
                # Get the new user ID
                new_user_id = result.lastrowid
                user_id_map[old_user_id] = new_user_id
                
                logger.info(f"Recreated user {email} with company_id {company_id}")
            
            session.commit()
            
            # Step 6: Recreate job tickets with company_id
            logger.info("Recreating job tickets with company relationships...")
            
            for ticket_data in existing_job_tickets:
                # Convert tuple to dict using column names
                ticket_dict = dict(zip(job_ticket_columns, ticket_data))
                
                old_user_id = ticket_dict.get('user_id')
                new_user_id = user_id_map.get(old_user_id) if old_user_id else None
                
                # Get company_id from the user
                if new_user_id:
                    company_result = session.execute(
                        text("SELECT company_id FROM users WHERE id = :user_id"),
                        {"user_id": new_user_id}
                    ).fetchone()
                    company_id = company_result[0] if company_result else None
                else:
                    # For tickets without user_id, try to find company by company_name
                    old_company_name = ticket_dict.get('company_name', '')
                    if old_company_name:
                        normalized_name = Company.normalize_name(old_company_name)
                        company_id = company_map.get(normalized_name)
                    else:
                        company_id = None
                
                if company_id:
                    # Insert job ticket with new schema (excluding old company_name and id)
                    insert_data = {k: v for k, v in ticket_dict.items() if k not in ['id', 'company_name']}
                    insert_data['user_id'] = new_user_id
                    insert_data['company_id'] = company_id
                    
                    # Build dynamic insert statement
                    columns = ', '.join(insert_data.keys())
                    placeholders = ', '.join([f':{k}' for k in insert_data.keys()])
                    
                    session.execute(
                        text(f"INSERT INTO job_tickets ({columns}) VALUES ({placeholders})"),
                        insert_data
                    )
                else:
                    logger.warning(f"Could not determine company_id for job ticket {ticket_dict.get('id')}")
            
            session.commit()
            logger.info("Migration completed successfully!")
            
    except Exception as e:
        logger.error(f"Migration failed: {str(e)}")
        raise
    finally:
        engine.dispose()

if __name__ == "__main__":
    run_migration()
