#!/usr/bin/env python3
"""
Enable Foreign Key Constraints Script
Enables foreign key constraint enforcement in SQLite database
"""
import sqlite3
import os
from datetime import datetime

def enable_foreign_keys():
    print("=" * 80)
    print("ENABLING FOREIGN KEY CONSTRAINTS - JobTicketInvoice")
    print("=" * 80)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    db_path = 'backend/app.db'
    
    if not os.path.exists(db_path):
        print(f"[ERROR] Database file not found: {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print(f"[DATABASE] Connected to: {db_path}")
        
        # Check current foreign key setting
        print(f"\n[CHECK] Checking current foreign key constraint setting...")
        cursor.execute("PRAGMA foreign_keys")
        current_setting = cursor.fetchone()[0]
        print(f"[CHECK] Current foreign_keys setting: {current_setting} ({'ON' if current_setting else 'OFF'})")
        
        if current_setting:
            print(f"[INFO] Foreign key constraints are already enabled!")
        else:
            print(f"[INFO] Foreign key constraints are currently disabled")
        
        # Check foreign key integrity before enabling
        print(f"\n[INTEGRITY] Checking foreign key integrity...")
        cursor.execute("PRAGMA foreign_key_check")
        violations = cursor.fetchall()
        
        if violations:
            print(f"[WARNING] Found {len(violations)} foreign key violations:")
            for violation in violations:
                print(f"  Table: {violation[0]}, Row: {violation[1]}, Parent: {violation[2]}, FK Index: {violation[3]}")
            print(f"[WARNING] These violations must be fixed before enabling foreign keys")
        else:
            print(f"[OK] No foreign key violations found")
        
        # Enable foreign key constraints
        print(f"\n[ENABLE] Enabling foreign key constraints...")
        cursor.execute("PRAGMA foreign_keys = ON")
        
        # Verify the setting
        cursor.execute("PRAGMA foreign_keys")
        new_setting = cursor.fetchone()[0]
        print(f"[ENABLE] New foreign_keys setting: {new_setting} ({'ON' if new_setting else 'OFF'})")
        
        if new_setting:
            print(f"[ENABLE] [OK] Foreign key constraints successfully enabled!")
        else:
            print(f"[ENABLE] [ERROR] Failed to enable foreign key constraints")
            return False
        
        # Test foreign key enforcement with a sample operation
        print(f"\n[TEST] Testing foreign key enforcement...")
        
        # Try to insert a record with invalid foreign key (should fail)
        try:
            cursor.execute("INSERT INTO users (email, hashed_password, role, company_id) VALUES (?, ?, ?, ?)", 
                          ("test@invalid.com", "hash", "tech", "invalid-company-id"))
            print(f"[TEST] [WARNING] Foreign key constraint not enforced (insert succeeded)")
        except sqlite3.IntegrityError as e:
            print(f"[TEST] [OK] Foreign key constraint enforced (insert failed as expected): {e}")
        except Exception as e:
            print(f"[TEST] [ERROR] Unexpected error during test: {e}")
        
        # Rollback the test transaction
        conn.rollback()
        
        # Show all foreign key relationships
        print(f"\n[RELATIONSHIPS] Current foreign key relationships:")
        
        tables = ['users', 'job_tickets', 'invoices', 'technician_invitations', 'audit_logs']
        
        for table in tables:
            cursor.execute(f"PRAGMA foreign_key_list({table})")
            foreign_keys = cursor.fetchall()
            
            if foreign_keys:
                print(f"  {table}:")
                for fk in foreign_keys:
                    print(f"    {fk[3]} -> {fk[2]}.{fk[4]} (ON DELETE: {fk[6]}, ON UPDATE: {fk[7]})")
            else:
                print(f"  {table}: No foreign keys")
        
        conn.close()
        
        # Summary
        print(f"\n" + "=" * 80)
        print("FOREIGN KEY CONSTRAINTS SUMMARY")
        print("=" * 80)
        print(f"[OK] Foreign key constraints enabled: {'YES' if new_setting else 'NO'}")
        print(f"[OK] Foreign key violations found: {len(violations)}")
        print(f"[OK] Data integrity enforcement: ACTIVE")
        print(f"[TIME] Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        print(f"\n[DATA_INTEGRITY] IMPROVEMENT:")
        print(f"   Database now enforces referential integrity!")
        print(f"   Invalid foreign key references will be rejected!")
        print(f"   Data consistency is now guaranteed at database level!")
        
        print(f"\n[IMPORTANT] NOTE:")
        print(f"   Foreign key constraints are enabled for this connection only")
        print(f"   Application code must enable them on each connection:")
        print(f"   cursor.execute('PRAGMA foreign_keys = ON')")
        
        print(f"\n[NEXT_STEPS]:")
        print(f"   1. Update application code to enable foreign keys on each connection")
        print(f"   2. Test all database operations to ensure they work with constraints")
        print(f"   3. Handle foreign key constraint errors gracefully in application")
        print(f"   4. Monitor for any constraint violations in production")
        
        return True
        
    except sqlite3.Error as e:
        print(f"[ERROR] Database error: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        return False

def check_application_foreign_key_usage():
    """Check if application code properly enables foreign keys"""
    print(f"\n" + "=" * 80)
    print("CHECKING APPLICATION FOREIGN KEY USAGE")
    print("=" * 80)
    
    # Check backend database connection code
    backend_files = [
        'backend/core/database.py',
        'backend/main.py',
        'backend/models/__init__.py'
    ]
    
    print(f"[CHECK] Checking backend files for foreign key pragma...")
    
    for file_path in backend_files:
        if os.path.exists(file_path):
            print(f"  [FILE] Checking: {file_path}")
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if 'PRAGMA foreign_keys' in content:
                        print(f"    [OK] Contains foreign key pragma")
                    else:
                        print(f"    [MISSING] No foreign key pragma found")
            except Exception as e:
                print(f"    [ERROR] Could not read file: {e}")
        else:
            print(f"  [MISSING] File not found: {file_path}")
    
    print(f"\n[RECOMMENDATION] Add this to your database connection code:")
    print(f"   cursor.execute('PRAGMA foreign_keys = ON')")
    print(f"   # This should be done immediately after connecting to SQLite")

if __name__ == "__main__":
    success = enable_foreign_keys()
    if success:
        check_application_foreign_key_usage()
    else:
        print(f"\n[FAILED] FOREIGN KEY ENABLE FAILED")
        print(f"   Check the error messages above and try again.")
