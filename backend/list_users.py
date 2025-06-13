"""
List all users in database
"""

import sqlite3
import os

def list_users():
    """List all users"""
    db_path = os.path.join(os.path.dirname(__file__), "app.db")
    
    if not os.path.exists(db_path):
        print("Database not found")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, email, name, role, company_id, is_active, 
                   substr(hashed_password, 1, 20) as password_preview
            FROM users
        """)
        
        users = cursor.fetchall()
        
        print(f"Found {len(users)} users:")
        print("-" * 80)
        
        for user in users:
            print(f"ID: {user[0]}")
            print(f"Email: {user[1]}")
            print(f"Name: {user[2]}")
            print(f"Role: {user[3]}")
            print(f"Company ID: {user[4]}")
            print(f"Active: {user[5]}")
            print(f"Password (first 20 chars): {user[6]}")
            print("-" * 40)
        
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_users()
