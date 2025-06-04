"""
Migration script to update the users table with new fields for user onboarding.

This script:
1. Connects to the Supabase PostgreSQL database
2. Adds new columns to the users table: name, company_name, job_type, logo_url
3. Does not affect existing data

Usage:
    python -m migrations.update_user_model
"""
import os
import sys
import logging
from dotenv import load_dotenv

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import database
from database import engine
import sqlalchemy as sa
from sqlalchemy import text

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def update_user_table():
    """Add new columns to the users table"""
    logger.info("Adding new columns to users table...")
    try:
        with engine.connect() as connection:
            # Check if columns already exist
            inspector = sa.inspect(engine)
            existing_columns = [col['name'] for col in inspector.get_columns('users')]
            
            # Add name column if it doesn't exist
            if 'name' not in existing_columns:
                connection.execute(text("ALTER TABLE users ADD COLUMN name VARCHAR;"))
                logger.info("Added name column to users table")
            else:
                logger.info("name column already exists in users table")
                
            # Add company_name column if it doesn't exist
            if 'company_name' not in existing_columns:
                connection.execute(text("ALTER TABLE users ADD COLUMN company_name VARCHAR;"))
                logger.info("Added company_name column to users table")
            else:
                logger.info("company_name column already exists in users table")
                
            # Add job_type column if it doesn't exist
            if 'job_type' not in existing_columns:
                connection.execute(text("ALTER TABLE users ADD COLUMN job_type VARCHAR;"))
                logger.info("Added job_type column to users table")
            else:
                logger.info("job_type column already exists in users table")
                
            # Add logo_url column if it doesn't exist
            if 'logo_url' not in existing_columns:
                connection.execute(text("ALTER TABLE users ADD COLUMN logo_url TEXT;"))
                logger.info("Added logo_url column to users table")
            else:
                logger.info("logo_url column already exists in users table")
                
            connection.commit()
            
        logger.info("Successfully updated users table with new columns")
        return True
    except Exception as e:
        logger.error(f"Error updating users table: {e}")
        return False

def main():
    """Main migration function"""
    if update_user_table():
        logger.info("Successfully updated users table schema")
    else:
        logger.error("Failed to update users table schema")
        sys.exit(1)

if __name__ == "__main__":
    # Load environment variables
    load_dotenv()
    main()
