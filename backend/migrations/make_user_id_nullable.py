"""
Migration script to make user_id nullable in job_tickets table
"""
from sqlalchemy import create_engine, text
from core.config import settings

def run_migration():
    """Run the migration to make user_id nullable"""
    # In Docker, we need to use the service name 'db' instead of 'localhost'
    db_url = settings.database.url.replace('localhost', 'db')
    engine = create_engine(db_url)
    
    with engine.connect() as conn:
        # For PostgreSQL
        conn.execute(text("""
        ALTER TABLE job_tickets 
        ALTER COLUMN user_id DROP NOT NULL;
        """))
        
        conn.commit()
        print("Migration completed successfully: user_id is now nullable in job_tickets table")

if __name__ == "__main__":
    run_migration()
