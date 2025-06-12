#!/usr/bin/env python3
"""
Fix audit_logs table to use String for company_id instead of UUID
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from database import DATABASE_URL
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_audit_table():
    """Fix audit_logs table company_id column type"""
    
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    try:
        logger.info("Fixing audit_logs table...")
        
        with SessionLocal() as session:
            # Check current table structure
            columns = session.execute(text("PRAGMA table_info(audit_logs)")).fetchall()
            logger.info("Current audit_logs table structure:")
            for col in columns:
                logger.info(f"  {col}")
            
            # Since SQLite doesn't support ALTER COLUMN, we need to recreate the table
            logger.info("Recreating audit_logs table with correct schema...")
            
            # Step 1: Backup existing data
            existing_data = session.execute(text("SELECT * FROM audit_logs")).fetchall()
            logger.info(f"Backing up {len(existing_data)} existing audit log records")
            
            # Step 2: Drop and recreate table
            session.execute(text("DROP TABLE IF EXISTS audit_logs"))
            
            # Step 3: Create new table with correct schema
            session.execute(text("""
                CREATE TABLE audit_logs (
                    id INTEGER PRIMARY KEY,
                    user_id INTEGER,
                    company_id VARCHAR(36) NOT NULL,
                    action VARCHAR(100) NOT NULL,
                    category VARCHAR(50),
                    description TEXT,
                    details JSON,
                    target_id VARCHAR(100),
                    target_type VARCHAR(50),
                    ip_address VARCHAR(45),
                    user_agent TEXT,
                    timestamp DATETIME NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    FOREIGN KEY (company_id) REFERENCES companies(company_id)
                )
            """))
            
            # Step 4: Create indexes
            session.execute(text("CREATE INDEX ix_audit_logs_user_id ON audit_logs(user_id)"))
            session.execute(text("CREATE INDEX ix_audit_logs_company_id ON audit_logs(company_id)"))
            session.execute(text("CREATE INDEX ix_audit_logs_action ON audit_logs(action)"))
            session.execute(text("CREATE INDEX ix_audit_logs_timestamp ON audit_logs(timestamp)"))
            
            # Step 5: Restore data if any existed
            if existing_data:
                logger.info("Restoring existing audit log data...")
                for row in existing_data:
                    session.execute(text("""
                        INSERT INTO audit_logs 
                        (id, user_id, company_id, action, category, description, details, 
                         target_id, target_type, ip_address, user_agent, timestamp)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """), row)
            
            session.commit()
            logger.info("Audit_logs table fixed successfully!")
            
    except Exception as e:
        logger.error(f"Error fixing audit_logs table: {e}")
        raise

if __name__ == "__main__":
    fix_audit_table()
