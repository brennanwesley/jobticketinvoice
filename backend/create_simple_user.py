"""
Create a simple test user with known password
"""

import sqlite3
import os
from passlib.context import CryptContext
from datetime import datetime

def create_simple_user():
    """Create a simple test user"""
    db_path = os.path.join(os.path.dirname(__file__), "app.db")
    
    if not os.path.exists(db_path):
        print("Database not found")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Use proper password hashing
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        password = "test123"
        hashed_password = pwd_context.hash(password)
        
        print(f"Generated password hash: {hashed_password}")
        
        # Get first company ID
        cursor.execute("SELECT company_id FROM companies LIMIT 1")
        company = cursor.fetchone()
        
        if not company:
            print("No company found")
            return
        
        company_id = company[0]
        
        # Delete existing test user if exists
        cursor.execute("DELETE FROM users WHERE email = ?", ("test@example.com",))
        
        # Create new test user
        cursor.execute("""
            INSERT INTO users (email, hashed_password, name, role, 
                             company_id, is_active, force_password_reset, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "test@example.com",
            hashed_password,
            "Test User Simple",
            "manager",
            company_id,
            1,
            0,  # force_password_reset = False
            datetime.now()
        ))
        
        conn.commit()
        print(f"Created test user: test@example.com")
        print(f"Password: {password}")
        print(f"Company ID: {company_id}")
        
        # Verify the user was created
        cursor.execute("SELECT email, name, role FROM users WHERE email = ?", ("test@example.com",))
        user = cursor.fetchone()
        if user:
            print(f"Verified user created: {user}")
        
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_simple_user()
