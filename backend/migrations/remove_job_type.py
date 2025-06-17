"""
Remove job_type field from database tables

This migration removes the job_type column from:
1. users table
2. tech_invites table

The job_type field is no longer needed as the system now only supports
two user roles: manager and technician.
"""

import logging
import sys
import os
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.exc import SQLAlchemyError

# Add parent directory to path to import database module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.config import settings

logger = logging.getLogger(__name__)

def remove_job_type_columns():
    """Remove job_type columns from users and tech_invites tables"""
    
    # Use the database URL from settings
    database_url = settings.database.url
    engine = create_engine(database_url)
    
    try:
        with engine.connect() as connection:
            # Start transaction
            trans = connection.begin()
            
            try:
                # Get existing columns for users table
                inspector = inspect(engine)
                users_columns = [col['name'] for col in inspector.get_columns('users')]
                
                # Remove job_type from users table if it exists
                if 'job_type' in users_columns:
                    logger.info("Removing job_type column from users table...")
                    connection.execute(text("ALTER TABLE users DROP COLUMN job_type"))
                    logger.info("Successfully removed job_type column from users table")
                else:
                    logger.info("job_type column does not exist in users table")
                
                # Check if tech_invites table exists and has job_type column
                try:
                    tech_invites_columns = [col['name'] for col in inspector.get_columns('tech_invites')]
                    
                    if 'job_type' in tech_invites_columns:
                        logger.info("Removing job_type column from tech_invites table...")
                        connection.execute(text("ALTER TABLE tech_invites DROP COLUMN job_type"))
                        logger.info("Successfully removed job_type column from tech_invites table")
                    else:
                        logger.info("job_type column does not exist in tech_invites table")
                        
                except Exception as e:
                    logger.info(f"tech_invites table does not exist or cannot be accessed: {e}")
                
                # Commit the transaction
                trans.commit()
                logger.info("Migration completed successfully")
                
            except Exception as e:
                trans.rollback()
                logger.error(f"Error during migration, rolling back: {e}")
                raise
                
    except SQLAlchemyError as e:
        logger.error(f"Database error during migration: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during migration: {e}")
        raise

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    logger.info("Starting job_type column removal migration...")
    remove_job_type_columns()
    logger.info("Migration completed!")
