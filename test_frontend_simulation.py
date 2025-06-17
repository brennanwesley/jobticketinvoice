#!/usr/bin/env python3
"""
Frontend Simulation Test
Simulates the exact frontend flow including localStorage token storage
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1"

def simulate_frontend_login():
    """Simulate frontend login and token storage"""
    print("1. Simulating frontend login...")
    
    # Try multiple manager credentials with correct password
    credentials = [
        {"email": "test@email.com", "password": "password123"},
        {"email": "manager@test.com", "password": "password123"},
        {"email": "bigmanager@test.com", "password": "password123"},
        {"email": "test@example.com", "password": "password123"},
        {"email": "admin@test.com", "password": "password123"}
    ]
    
    for cred in credentials:
        try:
            print(f"   Trying: {cred['email']}")
            response = requests.post(
                f"{BASE_URL}/auth/login",
                data={
                    'username': cred['email'],  # OAuth2 uses 'username' field
                    'password': cred['password']
                },
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            if response.status_code == 200:
                data = response.json()
                token = data.get('access_token')
                user_data = data.get('user', {})
                
                print(f"   Login successful!")
                print(f"   User: {user_data.get('name')} ({user_data.get('role')})")
                print(f"   Company ID: {user_data.get('company_id')}")
                print(f"   Token: {token[:50]}...")
                
                # Simulate localStorage storage
                return {
                    'token': token,
                    'user': user_data
                }
                
        except Exception as e:
            print(f"   Login failed: {str(e)}")
            continue
    
    print("   All login attempts failed!")
    return None

def simulate_frontend_api_call(auth_data):
    """Simulate the exact frontend API call"""
    print("\n2. Simulating frontend technician creation...")
    
    token = auth_data['token']
    
    # Simulate the exact frontend request
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    payload = {
        "email": "frontend_sim_test@example.com",
        "name": "Frontend Sim Test Tech",
        "job_type": "other",
        "temporary_password": "temppass123"
    }
    
    print(f"   URL: {BASE_URL}/invitations/create-technician-direct")
    print(f"   Headers: {headers}")
    print(f"   Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/invitations/create-technician-direct",
            json=payload,
            headers=headers
        )
        
        print(f"   Response Status: {response.status_code}")
        print(f"   Response Headers: {dict(response.headers)}")
        
        if response.status_code == 201:
            result = response.json()
            print(f"   Success! Created technician: {result}")
            return True
        else:
            print(f"   Error Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   Request failed: {str(e)}")
        return False

def test_token_validation(auth_data):
    """Test token validation scenarios"""
    print("\n3. Testing token validation scenarios...")
    
    token = auth_data['token']
    
    scenarios = [
        ("Valid token", f"Bearer {token}"),
        ("Missing Bearer", token),
        ("Empty token", "Bearer "),
        ("Invalid token", "Bearer invalid_token_here"),
        ("No header", None)
    ]
    
    for name, auth_header in scenarios:
        headers = {'Content-Type': 'application/json'}
        if auth_header:
            headers['Authorization'] = auth_header
            
        try:
            response = requests.get(
                f"{BASE_URL}/auth/me",
                headers=headers
            )
            print(f"   {name}: Status {response.status_code}")
            if response.status_code != 200:
                error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                print(f"      Error: {error_data}")
        except Exception as e:
            print(f"   {name}: Exception - {str(e)}")

def main():
    print("Frontend Simulation Test")
    print("=" * 50)
    
    # Step 1: Login
    auth_data = simulate_frontend_login()
    if not auth_data:
        print("Cannot proceed without valid authentication")
        return
    
    # Step 2: Test technician creation
    success = simulate_frontend_api_call(auth_data)
    
    # Step 3: Test token validation
    test_token_validation(auth_data)
    
    # Summary
    print("\n" + "=" * 50)
    if success:
        print("Frontend simulation completed successfully!")
        print("The API is working correctly with proper authentication.")
        print("The issue is likely in the frontend JavaScript code.")
    else:
        print("Frontend simulation failed!")
        print("There may be an issue with the backend API or authentication.")

if __name__ == "__main__":
    main()
