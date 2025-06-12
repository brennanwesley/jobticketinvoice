#!/usr/bin/env python3

from database import engine
from sqlalchemy import text

def clear_test_data():
    """Clear test data from the database"""
    conn = engine.connect()
    
    try:
        print("Clearing test data...")
        
        # Delete users first (due to foreign key constraints)
        result = conn.execute(text("DELETE FROM users"))
        users_deleted = result.rowcount
        
        # Delete companies
        result = conn.execute(text("DELETE FROM companies"))
        companies_deleted = result.rowcount
        
        conn.commit()
        print(f"Deleted {users_deleted} users and {companies_deleted} companies")
        print("Database is now clean for testing")
        
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    clear_test_data()
