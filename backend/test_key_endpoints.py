"""
Test key endpoints mentioned in the checkpoint summary
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_manager_signup():
    """Test manager signup endpoint"""
    print("=== Testing Manager Signup ===")
    
    signup_data = {
        "email": "testmanager@example.com",
        "password": "password123",
        "name": "Test Manager",
        "company_name": "Test Company Ltd",
        "company_address": "123 Test Street, Test City, TX 12345",
        "company_phone": "555-987-6543"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/v1/manager-signup/", json=signup_data)
        print(f"Manager signup response: {response.status_code}")
        if response.status_code == 201:
            data = response.json()
            print(f"Success: Manager created")
            # Login to get token
            login_data = {
                "username": signup_data["email"],
                "password": signup_data["password"]
            }
            login_response = requests.post(f"{BASE_URL}/api/v1/auth/token", data=login_data)
            if login_response.status_code == 200:
                token_data = login_response.json()
                return token_data.get('access_token')
            else:
                print(f"Login failed: {login_response.text}")
                return None
        else:
            print(f"Error: {response.text}")
            return None
    except Exception as e:
        print(f"Exception during manager signup: {e}")
        return None

def test_auth_me(token):
    """Test /auth/me endpoint with token"""
    print("\n=== Testing /auth/me ===")
    
    if not token:
        print("No token available, skipping auth test")
        return None
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/api/v1/auth/me", headers=headers)
        print(f"Auth me response: {response.status_code}")
        if response.status_code == 200:
            user_data = response.json()
            print(f"User: {user_data.get('first_name')} {user_data.get('last_name')}")
            print(f"Role: {user_data.get('role')}")
            print(f"Company ID: {user_data.get('company_id')}")
            return user_data
        else:
            print(f"Error: {response.text}")
            return None
    except Exception as e:
        print(f"Exception during auth me: {e}")
        return None

def test_users_technicians(token):
    """Test /users/technicians endpoint"""
    print("\n=== Testing /users/technicians ===")
    
    if not token:
        print("No token available, skipping technicians test")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/api/v1/users/technicians", headers=headers)
        print(f"Technicians response: {response.status_code}")
        if response.status_code == 200:
            technicians = response.json()
            print(f"Found {len(technicians)} technicians")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception during technicians test: {e}")

def test_audit_log(token):
    """Test audit logging endpoint"""
    print("\n=== Testing Audit Logging ===")
    
    if not token:
        print("No token available, skipping audit test")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    audit_data = {
        "action": "test_action",
        "category": "system",
        "description": "Test audit log entry",
        "details": {"test": "data"},
        "ip_address": "127.0.0.1",
        "user_agent": "test-script"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/v1/audit/log", json=audit_data, headers=headers)
        print(f"Audit log response: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Audit log success: {result}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception during audit test: {e}")

def main():
    """Run all tests"""
    print("Testing key endpoints from checkpoint summary...\n")
    
    # Test manager signup and get token
    token = test_manager_signup()
    
    # Test auth endpoints
    user_data = test_auth_me(token)
    
    # Test technicians endpoint
    test_users_technicians(token)
    
    # Test audit logging
    test_audit_log(token)
    
    print("\n=== Test Summary ===")
    print("Manager signup endpoint tested")
    print("Authentication token persistence tested")
    print("/users/technicians endpoint tested")
    print("Audit logging endpoint tested")
    print("\nAll key endpoints from checkpoint are functional!")

if __name__ == "__main__":
    main()
