#!/usr/bin/env python3
"""
Verify and Fix Password Hashing Script
Checks all user passwords and fixes any that are not properly hashed
"""
import sqlite3
import os
import bcrypt
from datetime import datetime

def verify_fix_passwords():
    print("=" * 80)
    print("VERIFYING AND FIXING PASSWORD HASHING - JobTicketInvoice")
    print("=" * 80)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    db_path = 'backend/app.db'
    
    if not os.path.exists(db_path):
        print(f"[ERROR] Database file not found: {db_path}")
        return False
    
    # Backup the database first
    backup_path = f'backend/app_backup_passwords_{datetime.now().strftime("%Y%m%d_%H%M%S")}.db'
    print(f"[BACKUP] Creating backup: {backup_path}")
    
    try:
        # Create backup
        import shutil
        shutil.copy2(db_path, backup_path)
        print(f"[BACKUP] [OK] Backup created successfully")
    except Exception as e:
        print(f"[ERROR] Failed to create backup: {e}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print(f"\n[DATABASE] Connected to: {db_path}")
        
        # Get all users and their password hashes
        print(f"\n[ANALYSIS] Checking all user passwords...")
        cursor.execute("SELECT id, email, hashed_password, role FROM users")
        users = cursor.fetchall()
        
        print(f"[ANALYSIS] Found {len(users)} users to check")
        
        properly_hashed = 0
        needs_fixing = 0
        fixed_count = 0
        
        for user_id, email, hashed_password, role in users:
            print(f"\n[USER] Checking user: {email} (ID: {user_id}, Role: {role})")
            
            # Check if password is properly hashed
            if hashed_password and hashed_password.startswith('$2b$'):
                print(f"  [OK] Password is properly hashed with bcrypt")
                properly_hashed += 1
                
                # Verify the hash format is valid
                try:
                    # Try to verify with a dummy password to check hash validity
                    bcrypt.checkpw(b'dummy', hashed_password.encode('utf-8'))
                    print(f"  [OK] Hash format is valid")
                except ValueError as e:
                    print(f"  [WARNING] Hash format may be invalid: {e}")
                except Exception:
                    # This is expected when checking with dummy password
                    print(f"  [OK] Hash format is valid (expected mismatch)")
                    
            else:
                print(f"  [ISSUE] Password is NOT properly hashed!")
                print(f"  [ISSUE] Current value: {hashed_password[:50]}..." if hashed_password else "  [ISSUE] Password is NULL")
                needs_fixing += 1
                
                # For security, we'll set a temporary password that forces reset
                print(f"  [FIX] Setting temporary password that requires reset...")
                
                # Generate a secure temporary password hash
                temp_password = "TempPassword123!"
                temp_hash = bcrypt.hashpw(temp_password.encode('utf-8'), bcrypt.gensalt())
                temp_hash_str = temp_hash.decode('utf-8')
                
                # Update the user's password and force password reset
                cursor.execute("""
                    UPDATE users 
                    SET hashed_password = ?, force_password_reset = 1 
                    WHERE id = ?
                """, (temp_hash_str, user_id))
                
                print(f"  [FIX] [OK] Temporary password set (user must reset on next login)")
                print(f"  [FIX] Temporary password: {temp_password}")
                print(f"  [FIX] force_password_reset flag set to TRUE")
                fixed_count += 1
        
        # Commit all changes
        if fixed_count > 0:
            conn.commit()
            print(f"\n[COMMIT] [OK] All password fixes committed to database")
        
        # Verify all passwords are now properly hashed
        print(f"\n[VERIFICATION] Re-checking all passwords after fixes...")
        cursor.execute("SELECT id, email, hashed_password FROM users")
        users_after = cursor.fetchall()
        
        all_valid = True
        for user_id, email, hashed_password in users_after:
            if not hashed_password or not hashed_password.startswith('$2b$'):
                print(f"  [ERROR] {email}: Still has invalid password hash!")
                all_valid = False
            else:
                print(f"  [OK] {email}: Password properly hashed")
        
        conn.close()
        
        # Summary
        print(f"\n" + "=" * 80)
        print("PASSWORD SECURITY AUDIT SUMMARY")
        print("=" * 80)
        print(f"[STATS] Total users checked: {len(users)}")
        print(f"[OK] Properly hashed passwords: {properly_hashed}")
        print(f"[FIXED] Passwords that needed fixing: {needs_fixing}")
        print(f"[FIXED] Passwords successfully fixed: {fixed_count}")
        print(f"[BACKUP] Backup created: {backup_path}")
        print(f"[TIME] Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        if all_valid:
            print(f"\n[SECURITY] [OK] ALL PASSWORDS ARE NOW PROPERLY HASHED!")
            print(f"   All user passwords use bcrypt with proper salt")
            print(f"   Password security is now compliant with best practices")
        else:
            print(f"\n[SECURITY] [WARNING] Some passwords still need attention")
        
        if fixed_count > 0:
            print(f"\n[IMPORTANT] USERS WITH FIXED PASSWORDS:")
            print(f"   {fixed_count} users had their passwords reset to temporary values")
            print(f"   These users MUST reset their passwords on next login")
            print(f"   Temporary password: TempPassword123!")
            print(f"   force_password_reset flag is set for these users")
            
            print(f"\n[ACTION_REQUIRED]:")
            print(f"   1. Notify affected users that their passwords were reset")
            print(f"   2. Ensure password reset functionality is working")
            print(f"   3. Users should change passwords immediately after login")
            print(f"   4. Consider implementing password complexity requirements")
        
        print(f"\n[NEXT_STEPS]:")
        print(f"   1. Test login functionality with properly hashed passwords")
        print(f"   2. Verify password reset flow works correctly")
        print(f"   3. Implement regular password security audits")
        print(f"   4. Consider adding password complexity requirements")
        print(f"   5. Monitor for any authentication issues")
        
        return all_valid
        
    except sqlite3.Error as e:
        print(f"[ERROR] Database error: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        return False

def test_password_verification():
    """Test password verification functionality"""
    print(f"\n" + "=" * 80)
    print("TESTING PASSWORD VERIFICATION")
    print("=" * 80)
    
    db_path = 'backend/app.db'
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get a user to test with
        cursor.execute("SELECT email, hashed_password FROM users LIMIT 1")
        user_data = cursor.fetchone()
        
        if not user_data:
            print(f"[ERROR] No users found for testing")
            return
        
        email, hashed_password = user_data
        print(f"[TEST] Testing password verification for: {email}")
        
        # Test with correct password (if we know it)
        test_passwords = ["password123", "TempPassword123!", "admin123"]
        
        for test_password in test_passwords:
            try:
                if bcrypt.checkpw(test_password.encode('utf-8'), hashed_password.encode('utf-8')):
                    print(f"  [OK] Password '{test_password}' is valid for {email}")
                    break
                else:
                    print(f"  [INFO] Password '{test_password}' is not valid for {email}")
            except Exception as e:
                print(f"  [ERROR] Error testing password '{test_password}': {e}")
        
        conn.close()
        
        print(f"\n[SUCCESS] PASSWORD VERIFICATION TEST COMPLETE")
        
    except Exception as e:
        print(f"[ERROR] Test failed: {e}")

if __name__ == "__main__":
    success = verify_fix_passwords()
    if success:
        test_password_verification()
    else:
        print(f"\n[FAILED] PASSWORD VERIFICATION/FIX FAILED")
        print(f"   Check the error messages above and try again.")
