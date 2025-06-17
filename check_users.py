#!/usr/bin/env python3
"""
Check what users exist in the database
"""
import sqlite3
import os

# Database path
DB_PATH = "d:/jobticketinvoice/backend/app.db"

def check_users():
    """Check what users exist in the database"""
    if not os.path.exists(DB_PATH):
        print(f"Database not found at: {DB_PATH}")
        return
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check if users table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users';")
        if not cursor.fetchone():
            print("Users table does not exist")
            return
        
        # Get all users
        cursor.execute("SELECT id, email, name, role, is_active, company_id FROM users;")
        users = cursor.fetchall()
        
        print(f"Found {len(users)} users:")
        print("ID | Email | Name | Role | Active | Company ID")
        print("-" * 60)
        
        for user in users:
            print(f"{user[0]} | {user[1]} | {user[2]} | {user[3]} | {user[4]} | {user[5]}")
        
        # Also check companies
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='companies';")
        if cursor.fetchone():
            cursor.execute("SELECT id, name FROM companies;")
            companies = cursor.fetchall()
            print(f"\nFound {len(companies)} companies:")
            print("ID | Company Name")
            print("-" * 30)
            for company in companies:
                print(f"{company[0]} | {company[1]}")
        
        conn.close()
        
    except Exception as e:
        print(f"Error checking database: {str(e)}")

if __name__ == "__main__":
    check_users()
