"""
Simple script to check database users
"""

import sqlite3
import os

def check_database_users():
    """Check what users exist in the database"""
    db_path = os.path.join(os.path.dirname(__file__), "app.db")
    
    if not os.path.exists(db_path):
        print("Database not found")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check users table
        cursor.execute("SELECT email, role, is_active FROM users")
        users = cursor.fetchall()
        
        print("Users in database:")
        for user in users:
            print(f"  - {user[0]} (role: {user[1]}, active: {user[2]})")
        
        # Check companies table
        cursor.execute("SELECT company_id, name FROM companies")
        companies = cursor.fetchall()
        
        print("\nCompanies in database:")
        for company in companies:
            print(f"  - {company[1]} (ID: {company[0]})")
        
        # Check if tech_invites table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='tech_invites'")
        table_exists = cursor.fetchone()
        
        if table_exists:
            cursor.execute("SELECT COUNT(*) FROM tech_invites")
            count = cursor.fetchone()[0]
            print(f"\nTech invites table exists with {count} records")
        else:
            print("\nTech invites table does not exist")
        
        conn.close()
        
    except Exception as e:
        print(f"Error checking database: {e}")

if __name__ == "__main__":
    check_database_users()
