#!/usr/bin/env python3
"""
Test script to verify frontend token handling and API calls
"""
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_frontend_token_flow():
    """Test the exact frontend token flow"""
    print("Frontend Token Test")
    print("=" * 50)
    
    # Step 1: Login to get a token (like frontend does)
    print("1. Getting authentication token...")
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        data={
            'username': 'test@example.com',
            'password': 'password123'
        },
        headers={'Content-Type': 'application/x-www-form-urlencoded'}
    )
    
    if login_response.status_code != 200:
        print(f"   Login failed: {login_response.status_code}")
        print(f"   Response: {login_response.text}")
        return
    
    token_data = login_response.json()
    token = token_data.get('access_token')
    print(f"   Token obtained: {token[:50]}...")
    
    # Step 2: Get current user info (like frontend does)
    print("\n2. Getting current user info...")
    user_response = requests.get(
        f"{BASE_URL}/auth/me",
        headers={'Authorization': f'Bearer {token}'}
    )
    
    if user_response.status_code == 200:
        user_data = user_response.json()
        print(f"   User: {user_data.get('name')} ({user_data.get('email')})")
        print(f"   Role: {user_data.get('role')}")
        print(f"   Company ID: {user_data.get('company_id')}")
    else:
        print(f"   Failed to get user: {user_response.status_code}")
        print(f"   Response: {user_response.text}")
    
    # Step 3: Test technician creation with exact frontend headers
    print("\n3. Testing technician creation...")
    
    # Exact headers that frontend sends
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    # Exact payload that frontend sends
    payload = {
        "email": "token_test_tech@example.com",
        "name": "Token Test Technician",
        "job_type": "other",
        "temporary_password": "temppass123"
    }
    
    print(f"   URL: {BASE_URL}/invitations/create-technician-direct")
    print(f"   Headers: {headers}")
    print(f"   Payload: {json.dumps(payload, indent=2)}")
    
    create_response = requests.post(
        f"{BASE_URL}/invitations/create-technician-direct",
        headers=headers,
        json=payload
    )
    
    print(f"   Response Status: {create_response.status_code}")
    print(f"   Response Headers: {dict(create_response.headers)}")
    
    if create_response.status_code == 201:
        result = create_response.json()
        print(f"   Success! Created technician: {result}")
    else:
        print(f"   Failed! Response: {create_response.text}")
        
        # Try to get detailed error info
        try:
            error_data = create_response.json()
            print(f"   Error details: {json.dumps(error_data, indent=2)}")
        except:
            print(f"   Raw error text: {create_response.text}")
    
    # Step 4: Test with various token scenarios
    print("\n4. Testing token validation scenarios...")
    
    test_cases = [
        ("Valid token", f"Bearer {token}"),
        ("Token without Bearer", token),
        ("Empty token", "Bearer "),
        ("Invalid token", "Bearer invalid_token_here"),
        ("No Authorization header", None)
    ]
    
    for test_name, auth_header in test_cases:
        test_headers = {'Content-Type': 'application/json'}
        if auth_header:
            test_headers['Authorization'] = auth_header
            
        test_response = requests.post(
            f"{BASE_URL}/invitations/create-technician-direct",
            headers=test_headers,
            json={"email": "test@test.com", "name": "Test", "job_type": "other", "temporary_password": "test123"}
        )
        
        print(f"   {test_name}: Status {test_response.status_code}")
        if test_response.status_code != 201:
            try:
                error = test_response.json()
                print(f"      Error: {error}")
            except:
                print(f"      Raw: {test_response.text}")

if __name__ == "__main__":
    test_frontend_token_flow()
