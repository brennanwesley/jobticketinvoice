"""
Simple API test for tech invites
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_login():
    """Test login with existing user"""
    print("=== Testing Login ===")
    
    # Try to login with existing users
    login_data = {
        "username": "manager@test.com",
        "password": "password123"
    }
    
    response = requests.post(f"{BASE_URL}/api/v1/auth/login", data=login_data)
    print(f"Login response status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"Login successful! Token: {result.get('access_token', 'N/A')[:50]}...")
        return result.get('access_token')
    else:
        print(f"Login failed: {response.text}")
        return None

def test_tech_invite_endpoints(token):
    """Test tech invite endpoints"""
    if not token:
        print("No token available, skipping tech invite tests")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n=== Testing Tech Invite Creation ===")
    
    invite_data = {
        "tech_name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "555-123-4567"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/v1/tech-invites/create",
        json=invite_data,
        headers=headers
    )
    
    print(f"Create invite response status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 201:
        result = response.json()
        invite_token = result.get('invite_token')
        print(f"Invite created! Token: {invite_token[:50]}...")
        
        # Test token validation
        print("\n=== Testing Token Validation ===")
        validate_response = requests.get(
            f"{BASE_URL}/api/v1/tech-invites/validate/{invite_token}",
            headers=headers
        )
        print(f"Validate response status: {validate_response.status_code}")
        print(f"Validate response: {validate_response.text}")
        
        # Test listing invites
        print("\n=== Testing List Invites ===")
        list_response = requests.get(
            f"{BASE_URL}/api/v1/tech-invites/",
            headers=headers
        )
        print(f"List response status: {list_response.status_code}")
        print(f"List response: {list_response.text}")

def main():
    """Main test function"""
    print("Starting API tests...")
    
    # Test login
    token = test_login()
    
    # Test tech invite endpoints
    test_tech_invite_endpoints(token)
    
    print("\nAPI tests completed!")

if __name__ == "__main__":
    main()
