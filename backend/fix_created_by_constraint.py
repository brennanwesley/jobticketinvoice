#!/usr/bin/env python3

from database import engine
from sqlalchemy import text

def fix_created_by_constraint():
    """Fix the created_by constraint in companies table"""
    conn = engine.connect()
    
    try:
        print("Fixing created_by constraint in companies table...")
        
        # SQLite doesn't support ALTER COLUMN, so we need to recreate the table
        # First, check if there's any data
        result = conn.execute(text("SELECT COUNT(*) FROM companies"))
        count = result.scalar()
        print(f"Current companies count: {count}")
        
        if count > 0:
            print("WARNING: There is existing data. Backing up first...")
            # Create backup
            conn.execute(text("""
                CREATE TABLE companies_backup AS 
                SELECT * FROM companies
            """))
            print("Backup created as companies_backup")
        
        # Drop the existing table
        conn.execute(text("DROP TABLE IF EXISTS companies"))
        
        # Recreate with correct schema
        conn.execute(text("""
            CREATE TABLE companies (
                id INTEGER NOT NULL, 
                company_id VARCHAR(36) NOT NULL, 
                name VARCHAR(255) NOT NULL, 
                normalized_name VARCHAR(255) NOT NULL, 
                address TEXT, 
                phone VARCHAR(20), 
                logo_url TEXT, 
                created_by INTEGER, 
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
                updated_at DATETIME, 
                is_active BOOLEAN NOT NULL DEFAULT 1, 
                PRIMARY KEY (id), 
                CONSTRAINT uix_company_normalized_name UNIQUE (normalized_name)
            )
        """))
        
        # Create indexes
        conn.execute(text("CREATE UNIQUE INDEX ix_companies_company_id ON companies (company_id)"))
        conn.execute(text("CREATE INDEX ix_companies_name ON companies (name)"))
        conn.execute(text("CREATE INDEX ix_companies_normalized_name ON companies (normalized_name)"))
        
        # Restore data if there was any
        if count > 0:
            conn.execute(text("""
                INSERT INTO companies 
                SELECT * FROM companies_backup
            """))
            conn.execute(text("DROP TABLE companies_backup"))
            print("Data restored")
        
        conn.commit()
        print("Successfully fixed created_by constraint - now nullable")
        
        # Verify the fix
        result = conn.execute(text("PRAGMA table_info(companies)"))
        for row in result:
            if row[1] == 'created_by':
                print(f"created_by column: NotNull={row[3]} (should be 0)")
                
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    fix_created_by_constraint()
