#!/usr/bin/env python3
"""
Test script to mimic frontend technician creation flow
"""
import requests
import json

# Configuration
BASE_URL = "http://localhost:8000/api/v1"
FRONTEND_URL = "http://localhost:3000"

def test_frontend_technician_creation():
    """Test technician creation exactly like the frontend does"""
    print("Testing frontend-style technician creation...")
    
    # Step 1: Login to get token (like frontend does)
    login_data = {
        "username": "test@email.com",
        "password": "testpassword123"
    }
    
    print("1. Logging in...")
    response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return False
    
    token_data = response.json()
    token = token_data.get("access_token")
    print(f"   Token obtained: {token[:20]}...")
    
    # Step 2: Test the exact frontend request format
    print("2. Creating technician (frontend style)...")
    
    # Headers exactly like authenticatedFetch
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
        # Add any other headers the frontend might send
    }
    
    # Data exactly like frontend sends
    technician_data = {
        "email": "frontend_test@example.com",
        "name": "Frontend Test Tech",
        "job_type": "other",  # This should match the enum
        "temporary_password": "temppass123"
    }
    
    print(f"   Request URL: {BASE_URL}/invitations/create-technician-direct")
    print(f"   Request Headers: {headers}")
    print(f"   Request Data: {json.dumps(technician_data, indent=2)}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/invitations/create-technician-direct",
            headers=headers,
            json=technician_data
        )
        
        print(f"   Response Status: {response.status_code}")
        print(f"   Response Headers: {dict(response.headers)}")
        print(f"   Response Body: {response.text}")
        
        if response.status_code == 201:
            print("* Frontend-style technician creation successful!")
            return True
        else:
            print("* Frontend-style technician creation failed!")
            return False
            
    except Exception as e:
        print(f"* Request error: {str(e)}")
        return False

def test_token_validation():
    """Test token validation specifically"""
    print("\nTesting token validation...")
    
    # Get a token
    login_data = {
        "username": "test@email.com", 
        "password": "testpassword123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    if response.status_code != 200:
        print("Cannot get token for validation test")
        return False
    
    token = response.json().get("access_token")
    
    # Test different token scenarios
    test_cases = [
        ("Valid token", f"Bearer {token}"),
        ("Missing Bearer", token),
        ("Empty token", "Bearer "),
        ("Invalid token", "Bearer invalid_token_here"),
        ("No Authorization header", None),
    ]
    
    for test_name, auth_header in test_cases:
        print(f"   Testing: {test_name}")
        
        headers = {"Content-Type": "application/json"}
        if auth_header:
            headers["Authorization"] = auth_header
        
        try:
            response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
            print(f"      Status: {response.status_code}")
            if response.status_code != 200:
                print(f"      Error: {response.text}")
        except Exception as e:
            print(f"      Exception: {str(e)}")

if __name__ == "__main__":
    print("Testing frontend technician creation flow...\n")
    
    # Test the main flow
    success = test_frontend_technician_creation()
    
    # Test token validation scenarios
    test_token_validation()
    
    if success:
        print("\n* Frontend flow test completed successfully!")
    else:
        print("\n* Frontend flow test failed!")
