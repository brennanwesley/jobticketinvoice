"""
Check database schema
"""

import sqlite3
import os

def check_schema():
    """Check database table schemas"""
    db_path = os.path.join(os.path.dirname(__file__), "app.db")
    
    if not os.path.exists(db_path):
        print("Database not found")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get users table schema
        cursor.execute("PRAGMA table_info(users)")
        users_columns = cursor.fetchall()
        
        print("Users table columns:")
        for col in users_columns:
            print(f"  - {col[1]} ({col[2]})")
        
        # Get companies table schema
        cursor.execute("PRAGMA table_info(companies)")
        companies_columns = cursor.fetchall()
        
        print("\nCompanies table columns:")
        for col in companies_columns:
            print(f"  - {col[1]} ({col[2]})")
        
        # Get tech_invites table schema
        cursor.execute("PRAGMA table_info(tech_invites)")
        tech_invites_columns = cursor.fetchall()
        
        print("\nTech invites table columns:")
        for col in tech_invites_columns:
            print(f"  - {col[1]} ({col[2]})")
        
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_schema()
