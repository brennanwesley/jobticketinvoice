"""
Test script for tech invite endpoints
"""

import requests
import json
import sqlite3
import os

BASE_URL = "http://localhost:8000/api/v1"

def check_database_users():
    """Check what users exist in the database"""
    db_path = os.path.join(os.path.dirname(__file__), "app.db")
    
    if not os.path.exists(db_path):
        print("Database not found")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT email, role, is_active FROM users")
        users = cursor.fetchall()
        
        print("Users in database:")
        for user in users:
            print(f"  - {user[0]} (role: {user[1]}, active: {user[2]})")
        
        conn.close()
        
    except Exception as e:
        print(f"Error checking database: {e}")

def test_login():
    """Login as manager to get access token"""
    login_data = {
        "username": "manager@test.com",
        "password": "password123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    print(f"Login status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        return data.get("access_token")
    else:
        print(f"Login failed: {response.text}")
        return None

def test_create_tech_invite(token):
    """Test creating a tech invite"""
    headers = {"Authorization": f"Bearer {token}"}
    
    invite_data = {
        "tech_name": "John Smith",
        "email": "john.smith@example.com",
        "phone": "(555) 123-4567"
    }
    
    response = requests.post(f"{BASE_URL}/tech-invites/", 
                           json=invite_data, 
                           headers=headers)
    
    print(f"Create invite status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 201:
        return response.json()
    return None

def test_list_tech_invites(token):
    """Test listing tech invites"""
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(f"{BASE_URL}/tech-invites/", headers=headers)
    
    print(f"List invites status: {response.status_code}")
    print(f"Response: {response.text}")

def test_validate_token(invite_token):
    """Test validating an invite token"""
    response = requests.get(f"{BASE_URL}/tech-invites/validate?token={invite_token}")
    
    print(f"Validate token status: {response.status_code}")
    print(f"Response: {response.text}")

def main():
    print("Testing Tech Invite Endpoints")
    print("=" * 40)
    
    # Step 1: Check database users
    print("\n1. Checking database users...")
    check_database_users()
    
    # Step 2: Login as manager
    print("\n2. Testing manager login...")
    token = test_login()
    
    if not token:
        print("ERROR: Cannot proceed without valid token")
        return
    
    print("SUCCESS: Login successful")
    
    # Step 3: Create a tech invite
    print("\n3. Testing tech invite creation...")
    invite_response = test_create_tech_invite(token)
    
    if invite_response:
        print("SUCCESS: Tech invite created successfully")
        invite_token = invite_response.get("invite_token")
        signup_link = invite_response.get("signup_link")
        
        print(f"Invite token: {invite_token[:50]}...")
        print(f"Signup link: {signup_link}")
        
        # Step 4: Validate the token
        print("\n4. Testing token validation...")
        test_validate_token(invite_token)
    else:
        print("ERROR: Failed to create tech invite")
    
    # Step 5: List all invites
    print("\n5. Testing invite listing...")
    test_list_tech_invites(token)
    
    print("\n" + "=" * 40)
    print("Testing complete!")

if __name__ == "__main__":
    main()
