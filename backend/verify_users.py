#!/usr/bin/env python3
"""
Script to verify user accounts exist in the database
Helps diagnose if users are being deleted during deployments
"""
from database import engine
from sqlalchemy import text
from core.config import settings

def check_user_accounts():
    try:
        conn = engine.connect()
        
        # Check total users
        result = conn.execute(text("SELECT COUNT(*) FROM users"))
        total_users = result.fetchone()[0]
        print(f"Total users in database: {total_users}")
        
        if total_users > 0:
            # Show recent users
            result = conn.execute(text("""
                SELECT id, email, role, created_at, is_active 
                FROM users 
                ORDER BY created_at DESC 
                LIMIT 10
            """))
            users = result.fetchall()
            
            print("\nRecent users:")
            for user in users:
                print(f"  ID: {user[0]}, Email: {user[1]}, Role: {user[2]}, Created: {user[3]}, Active: {user[4]}")
                
            # Check companies
            result = conn.execute(text("SELECT COUNT(*) FROM companies"))
            total_companies = result.fetchone()[0]
            print(f"\nTotal companies: {total_companies}")
            
            if total_companies > 0:
                result = conn.execute(text("""
                    SELECT id, name, created_at 
                    FROM companies 
                    ORDER BY created_at DESC 
                    LIMIT 5
                """))
                companies = result.fetchall()
                
                print("\nRecent companies:")
                for company in companies:
                    print(f"  ID: {company[0]}, Name: {company[1]}, Created: {company[2]}")
        else:
            print("❌ NO USERS FOUND - Database appears to be empty!")
            
        # Check database connection info
        db_url = settings.database.url
        db_type = "PostgreSQL" if db_url.startswith("postgresql") else "SQLite"
        print(f"\nDatabase type: {db_type}")
        print(f"Database URL: {settings.database.url}")
        print(f"Environment: {settings.app.environment}")
        
        conn.close()
        
    except Exception as e:
        print(f"Error checking users: {e}")

if __name__ == "__main__":
    check_user_accounts()
