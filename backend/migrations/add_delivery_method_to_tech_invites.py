"""
Add delivery_method field to tech_invites table
Migration script for SendGrid email functionality
"""

import sqlite3
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

def migrate():
    """Add delivery_method column to tech_invites table"""
    
    # Database path
    db_path = Path(__file__).parent.parent / "app.db"
    
    try:
        # Connect to database
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Check if column already exists
        cursor.execute("PRAGMA table_info(tech_invites)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'delivery_method' not in columns:
            # Add delivery_method column
            cursor.execute("""
                ALTER TABLE tech_invites 
                ADD COLUMN delivery_method VARCHAR(20)
            """)
            
            logger.info("Added delivery_method column to tech_invites table")
            print("Added delivery_method column to tech_invites table")
        else:
            logger.info("delivery_method column already exists in tech_invites table")
            print("delivery_method column already exists in tech_invites table")
        
        # Commit changes
        conn.commit()
        conn.close()
        
        return True
        
    except Exception as e:
        logger.error(f"Migration failed: {str(e)}")
        print(f"Migration failed: {str(e)}")
        if conn:
            conn.rollback()
            conn.close()
        return False

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    success = migrate()
    if success:
        print("Migration completed successfully")
    else:
        print("Migration failed")
        exit(1)
