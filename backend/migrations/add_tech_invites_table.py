"""
Database migration script to add tech_invites table
Run this script to create the tech_invites table for the tech onboarding system
"""

import sqlite3
import os
from datetime import datetime

def run_migration():
    """Add tech_invites table to the database"""
    
    # Database path
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "app.db")
    
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if table already exists
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='tech_invites'
        """)
        
        if cursor.fetchone():
            print("tech_invites table already exists")
            conn.close()
            return True
        
        # Create tech_invites table
        cursor.execute("""
            CREATE TABLE tech_invites (
                invite_id VARCHAR(36) PRIMARY KEY,
                tech_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                company_id VARCHAR(36) NOT NULL,
                status VARCHAR(20) DEFAULT 'pending' NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME NOT NULL,
                used_at DATETIME,
                created_by INTEGER NOT NULL,
                FOREIGN KEY (company_id) REFERENCES companies (company_id),
                FOREIGN KEY (created_by) REFERENCES users (id)
            )
        """)
        
        # Create indexes for performance
        cursor.execute("CREATE INDEX idx_tech_invites_email ON tech_invites (email)")
        cursor.execute("CREATE INDEX idx_tech_invites_company_id ON tech_invites (company_id)")
        cursor.execute("CREATE INDEX idx_tech_invites_status ON tech_invites (status)")
        cursor.execute("CREATE INDEX idx_tech_invites_created_at ON tech_invites (created_at)")
        
        conn.commit()
        print("SUCCESS: Successfully created tech_invites table with indexes")
        
        # Verify table creation
        cursor.execute("SELECT sql FROM sqlite_master WHERE name='tech_invites'")
        table_schema = cursor.fetchone()
        print(f"Table schema: {table_schema[0]}")
        
        conn.close()
        return True
        
    except sqlite3.Error as e:
        print(f"ERROR: Database error: {e}")
        if conn:
            conn.rollback()
            conn.close()
        return False
    except Exception as e:
        print(f"ERROR: Unexpected error: {e}")
        if conn:
            conn.close()
        return False

if __name__ == "__main__":
    print("Running tech_invites table migration...")
    print(f"Migration started at: {datetime.now()}")
    
    success = run_migration()
    
    if success:
        print("SUCCESS: Migration completed successfully!")
    else:
        print("ERROR: Migration failed!")
    
    print(f"Migration finished at: {datetime.now()}")
