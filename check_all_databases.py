#!/usr/bin/env python3
"""
Check all database files to find where the user accounts are stored
"""
import sqlite3
import os
from datetime import datetime

def check_database(db_path):
    """Check a single database file for user accounts"""
    print(f"\n{'='*60}")
    print(f"CHECKING: {db_path}")
    print(f"{'='*60}")
    
    if not os.path.exists(db_path):
        print(f"[ERROR] File does not exist: {db_path}")
        return
    
    try:
        file_size = os.path.getsize(db_path)
        print(f"[INFO] File size: {file_size:,} bytes")
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if users table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        if not cursor.fetchone():
            print(f"[INFO] No 'users' table found in this database")
            conn.close()
            return
        
        # Get all users
        cursor.execute("SELECT id, email, role, company_id, is_active, created_at FROM users ORDER BY created_at DESC")
        users = cursor.fetchall()
        
        print(f"[USERS] Found {len(users)} users:")
        for user in users:
            user_id, email, role, company_id, is_active, created_at = user
            status = "ACTIVE" if is_active else "INACTIVE"
            print(f"  - {email} ({role}) - Company ID: {company_id} - {status} - Created: {created_at}")
        
        # Get all companies
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='companies'")
        if cursor.fetchone():
            cursor.execute("SELECT id, name, created_at FROM companies ORDER BY created_at DESC")
            companies = cursor.fetchall()
            
            print(f"[COMPANIES] Found {len(companies)} companies:")
            for company in companies:
                company_id, name, created_at = company
                print(f"  - {name} (ID: {company_id}) - Created: {created_at}")
        else:
            print(f"[INFO] No 'companies' table found in this database")
        
        # Check recent activity
        cursor.execute("SELECT COUNT(*) FROM users WHERE created_at > datetime('now', '-7 days')")
        recent_users = cursor.fetchone()[0]
        print(f"[ACTIVITY] Users created in last 7 days: {recent_users}")
        
        conn.close()
        
    except sqlite3.Error as e:
        print(f"[ERROR] Database error: {e}")
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")

def main():
    print("DATABASE INVESTIGATION - Finding All User Accounts")
    print("="*80)
    print(f"Investigation started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # List of database files to check
    db_files = [
        "backend/app.db",
        "backend/job_ticket_invoice.db",
        "backend/app_backup_passwords_20250612_215844.db",
        "backend/app_backup_multitenancy_20250612_215748.db",
        "backend/app_backup_20250612_215643.db",
        "backend/app_backup_20250612_215549.db"
    ]
    
    for db_file in db_files:
        check_database(db_file)
    
    print(f"\n{'='*80}")
    print("INVESTIGATION COMPLETE")
    print(f"{'='*80}")
    
    # Check which database the backend is configured to use
    print(f"\n[CONFIG] Backend is configured to use: sqlite:///./app.db")
    print(f"[CONFIG] This translates to: backend/app.db")
    
    # Check environment variables
    import os
    database_url = os.getenv("DATABASE_URL", "sqlite:///./app.db")
    print(f"[CONFIG] DATABASE_URL environment variable: {database_url}")

if __name__ == "__main__":
    main()
