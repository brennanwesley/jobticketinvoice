"""
Test tech invite endpoints directly
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoints():
    """Test various endpoints"""
    
    print("=== Testing API Root ===")
    response = requests.get(f"{BASE_URL}/")
    print(f"Root response: {response.status_code} - {response.text}")
    
    print("\n=== Testing API Docs ===")
    response = requests.get(f"{BASE_URL}/docs")
    print(f"Docs response: {response.status_code}")
    
    print("\n=== Testing Tech Invites Without Auth ===")
    invite_data = {
        "tech_name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "555-123-4567"
    }
    
    response = requests.post(f"{BASE_URL}/api/v1/tech-invites/", json=invite_data)
    print(f"Create invite (no auth) response: {response.status_code} - {response.text}")
    
    print("\n=== Testing List Tech Invites Without Auth ===")
    response = requests.get(f"{BASE_URL}/api/v1/tech-invites/")
    print(f"List invites (no auth) response: {response.status_code} - {response.text}")
    
    print("\n=== Testing Available Routes ===")
    # Test if the routes are registered
    response = requests.get(f"{BASE_URL}/openapi.json")
    if response.status_code == 200:
        openapi_data = response.json()
        paths = openapi_data.get('paths', {})
        print("Available paths:")
        for path in sorted(paths.keys()):
            if 'tech-invite' in path:
                print(f"  - {path}")
    
    print("\n=== Testing Password Reset (if available) ===")
    # Try to reset password for existing user
    reset_data = {"email": "manager@test.com"}
    response = requests.post(f"{BASE_URL}/api/v1/auth/request-password-reset", json=reset_data)
    print(f"Password reset response: {response.status_code} - {response.text}")

if __name__ == "__main__":
    test_endpoints()
