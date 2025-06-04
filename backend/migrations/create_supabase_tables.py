"""
Migration script to create all tables in Supabase PostgreSQL database.

This script:
1. Connects to the Supabase PostgreSQL database
2. Creates all tables defined in the SQLAlchemy models
3. Optionally seeds the database with test data

Usage:
    python -m migrations.create_supabase_tables [--seed]
"""
import os
import sys
import argparse
import logging
from dotenv import load_dotenv

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import database and models
from database import engine, Base, SessionLocal
from models.user import User, UserRole
from models.job_ticket import JobTicket, JobTicketStatus
from models.invoice import Invoice, InvoiceStatus
from core.security import get_password_hash
from core.encryption import encrypt_field
import json
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_tables():
    """Create all tables defined in the SQLAlchemy models"""
    logger.info("Creating tables in Supabase PostgreSQL database...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Tables created successfully!")
        return True
    except Exception as e:
        logger.error(f"Error creating tables: {e}")
        return False

def seed_database():
    """Seed the database with test data"""
    logger.info("Seeding database with test data...")
    db = SessionLocal()
    
    try:
        # Check if users already exist
        existing_users = db.query(User).count()
        if existing_users > 0:
            logger.info(f"Database already has {existing_users} users. Skipping user creation.")
        else:
            # Create test users (Tech and Manager)
            tech_user = User(
                email="tech@example.com",
                hashed_password=get_password_hash("techpassword"),
                role=UserRole.TECH
            )
            manager_user = User(
                email="manager@example.com",
                hashed_password=get_password_hash("managerpassword"),
                role=UserRole.MANAGER
            )
            db.add(tech_user)
            db.add(manager_user)
            db.commit()
            logger.info("Created test users: tech@example.com and manager@example.com")
            
            # Refresh to get the IDs
            db.refresh(tech_user)
            db.refresh(manager_user)
            
            # Create a test job ticket with encrypted fields
            job_ticket = JobTicket(
                user_id=tech_user.id,
                job_number="JT-2025-001",
                company_name="Test Company",
                customer_name="Test Customer",
                location="Secret Test Location",  # Will be encrypted via property
                work_type="Maintenance",
                equipment="Pump XYZ-123",
                work_start_time="09:00",
                work_end_time="17:00",
                work_total_hours=8.0,
                drive_start_time="08:00",
                drive_end_time="18:00",
                drive_total_hours=2.0,
                travel_type="round_trip",
                parts_used=json.dumps(["Lubricant", "Pump Seal"]),
                work_description="Confidential maintenance details for the test location",  # Will be encrypted via property
                submitted_by="Test Technician",
                status=JobTicketStatus.SUBMITTED
            )
            db.add(job_ticket)
            db.commit()
            db.refresh(job_ticket)
            logger.info(f"Created test job ticket with ID: {job_ticket.id}")
            
            # Create a test invoice linked to the job ticket
            invoice = Invoice(
                user_id=manager_user.id,
                job_ticket_id=job_ticket.id,
                amount=750.00,  # Will be encrypted via property
                status=InvoiceStatus.DRAFT,
                line_items=json.dumps([  # Will be encrypted via property
                    {"description": "Labor", "quantity": 8, "rate": 75, "amount": 600},
                    {"description": "Parts", "quantity": 1, "rate": 150, "amount": 150}
                ])
            )
            db.add(invoice)
            db.commit()
            logger.info(f"Created test invoice with ID: {invoice.id}")
            
        return True
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def main():
    """Main migration function"""
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="Create tables in Supabase PostgreSQL database")
    parser.add_argument("--seed", action="store_true", help="Seed the database with test data")
    args = parser.parse_args()
    
    # Create tables
    if create_tables():
        logger.info("Tables created successfully in Supabase PostgreSQL database")
        
        # Seed database if requested
        if args.seed and seed_database():
            logger.info("Database seeded successfully with test data")
    else:
        logger.error("Failed to create tables in Supabase PostgreSQL database")
        sys.exit(1)

if __name__ == "__main__":
    # Load environment variables
    load_dotenv()
    main()
