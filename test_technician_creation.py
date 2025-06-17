#!/usr/bin/env python3
"""
Test script to debug technician creation credential validation error
"""
import requests
import json
import sys

# Configuration
BASE_URL = "http://localhost:8000/api/v1"

# Try multiple possible manager credentials
MANAGER_CREDENTIALS = [
    ("manager@test.com", "password123"),
    ("manager@test.com", "testpassword123"),
    ("manager@test.com", "test123"),
    ("test@email.com", "password123"),
    ("test@email.com", "testpassword123"),
    ("test@email.com", "test123"),
    ("bigmanager@test.com", "password123"),
    ("bigmanager@test.com", "testpassword123"),
    ("test@example.com", "password123"),
    ("test@example.com", "testpassword123"),
    ("admin@test.com", "password123"),
    ("admin@test.com", "testpassword123"),
]

TECHNICIAN_EMAIL = "newtech@example.com"
TECHNICIAN_NAME = "New Test Technician"
TECHNICIAN_PASSWORD = "temppass123"

def test_manager_login():
    """Test manager login with multiple possible credentials"""
    print("Testing manager login with multiple credentials...")
    
    for email, password in MANAGER_CREDENTIALS:
        print(f"Trying credentials: {email}")
        
        login_data = {
            "username": email,
            "password": password
        }
        
        try:
            response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
            print(f"  Login response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                token = data.get("access_token")
                print(f"  * Login successful! Token: {token[:20]}...")
                return token, email
            else:
                print(f"  * Login failed: {response.text}")
                
        except Exception as e:
            print(f"  * Login error: {str(e)}")
    
    return None, None

def test_current_user(token, email):
    """Test getting current user info with token"""
    print("\nTesting current user endpoint...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        print(f"Current user response status: {response.status_code}")
        
        if response.status_code == 200:
            user_data = response.json()
            print(f"* Current user: {user_data.get('email')} (Role: {user_data.get('role')})")
            return user_data
        else:
            print(f"* Current user failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"* Current user error: {str(e)}")
        return None

def test_technician_creation(token):
    """Test creating a technician directly"""
    print("\nTesting technician creation...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    technician_data = {
        "email": TECHNICIAN_EMAIL,
        "name": TECHNICIAN_NAME,
        "job_type": "other",
        "temporary_password": TECHNICIAN_PASSWORD
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/invitations/create-technician-direct", 
            headers=headers,
            json=technician_data
        )
        print(f"Technician creation response status: {response.status_code}")
        
        if response.status_code == 201:
            tech_data = response.json()
            print(f"* Technician created: {tech_data.get('email')}")
            return tech_data
        else:
            print(f"* Technician creation failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"* Technician creation error: {str(e)}")
        return None

def main():
    """Main test function"""
    print("Starting technician creation debug test...\n")
    
    # Step 1: Login as manager
    token, email = test_manager_login()
    if not token:
        print("* Cannot proceed without valid token")
        sys.exit(1)
    
    # Step 2: Verify current user
    user_data = test_current_user(token, email)
    if not user_data:
        print("* Cannot verify current user")
        sys.exit(1)
    
    # Step 3: Try to create technician
    tech_data = test_technician_creation(token)
    if not tech_data:
        print("* Technician creation failed")
        sys.exit(1)
    
    print("\n* All tests passed! Technician creation working correctly.")

if __name__ == "__main__":
    main()
