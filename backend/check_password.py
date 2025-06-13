"""
Check password hash for manager user
"""

import sqlite3
import os
from passlib.context import CryptContext

def check_password():
    """Check password hash for manager user"""
    db_path = os.path.join(os.path.dirname(__file__), "app.db")
    
    if not os.path.exists(db_path):
        print("Database not found")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get user info
        cursor.execute("SELECT email, hashed_password FROM users WHERE email = ?", ("manager@test.com",))
        user = cursor.fetchone()
        
        if user:
            email, hashed_password = user
            print(f"User: {email}")
            print(f"Hashed password: {hashed_password}")
            
            # Test password verification
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            
            test_passwords = ["password123", "Password123", "test123", "manager123"]
            
            for pwd in test_passwords:
                try:
                    is_valid = pwd_context.verify(pwd, hashed_password)
                    print(f"Password '{pwd}': {'VALID' if is_valid else 'INVALID'}")
                except Exception as e:
                    print(f"Error verifying '{pwd}': {e}")
        else:
            print("User not found")
        
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_password()
