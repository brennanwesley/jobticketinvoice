"""
Migration: Add company_name field to job_tickets table

This migration adds the missing company_name field to the job_tickets table
that is required by the JobTicketCreate schema but was missing from the model.

Date: 2025-06-15
Reason: Fix 500 errors in job ticket creation due to missing company_name field
"""

import sqlite3
import os
from pathlib import Path

def run_migration():
    """Add company_name field to job_tickets table"""
    
    # Get database path
    db_path = Path(__file__).parent.parent / "jobticketinvoice.db"
    
    if not db_path.exists():
        print(f"Database not found at {db_path}")
        return False
    
    print(f"Running migration on database: {db_path}")
    
    try:
        # Connect to database
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Check if company_name column already exists
        cursor.execute("PRAGMA table_info(job_tickets)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'company_name' in columns:
            print("company_name column already exists in job_tickets table")
            conn.close()
            return True
        
        print("Adding company_name column to job_tickets table...")
        
        # Add the company_name column
        # Using NOT NULL with a default value to handle existing records
        cursor.execute("""
            ALTER TABLE job_tickets 
            ADD COLUMN company_name TEXT NOT NULL DEFAULT 'Unknown Company'
        """)
        
        # Commit the changes
        conn.commit()
        
        # Verify the column was added
        cursor.execute("PRAGMA table_info(job_tickets)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'company_name' in columns:
            print("Successfully added company_name column to job_tickets table")
            
            # Count existing records that will have the default value
            cursor.execute("SELECT COUNT(*) FROM job_tickets WHERE company_name = 'Unknown Company'")
            count = cursor.fetchone()[0]
            
            if count > 0:
                print(f"{count} existing job tickets now have default company_name 'Unknown Company'")
                print("You may want to update these records with actual company names")
            
            conn.close()
            return True
        else:
            print("Failed to add company_name column")
            conn.close()
            return False
            
    except Exception as e:
        print(f"Migration failed: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

if __name__ == "__main__":
    print("Starting migration: Add company_name to job_tickets")
    success = run_migration()
    if success:
        print("Migration completed successfully!")
    else:
        print("Migration failed!")
        exit(1)
