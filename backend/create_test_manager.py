"""
Create a test manager user with known password
"""

import sqlite3
import os
from passlib.context import CryptContext
from datetime import datetime

def create_test_manager():
    """Create a test manager user"""
    db_path = os.path.join(os.path.dirname(__file__), "app.db")
    
    if not os.path.exists(db_path):
        print("Database not found")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Use proper password hashing
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        password = "testpass123"
        hashed_password = pwd_context.hash(password)
        
        # Get company ID (use the UUID string)
        cursor.execute("SELECT company_id FROM companies LIMIT 1")
        company = cursor.fetchone()
        
        if not company:
            print("No company found")
            return
        
        company_id = company[0]  # This is the UUID string
        
        # Delete existing test user if exists
        cursor.execute("DELETE FROM users WHERE email = ?", ("testmanager@example.com",))
        
        # Create new test user with correct column names
        cursor.execute("""
            INSERT INTO users (email, hashed_password, name, role, 
                             company_id, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            "testmanager@example.com",
            hashed_password,
            "Test Manager",
            "manager",
            company_id,
            1,
            datetime.now()
        ))
        
        conn.commit()
        print(f"Created test manager: testmanager@example.com")
        print(f"Password: {password}")
        print(f"Company ID: {company_id}")
        
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    create_test_manager()
