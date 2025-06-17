#!/usr/bin/env python3
"""
Test script to simulate browser behavior and debug the credential error
"""
import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1"

def simulate_browser_flow():
    """Simulate the exact browser flow that's failing"""
    print("Browser Flow Simulation")
    print("=" * 50)
    
    # Step 1: Login (like browser does)
    print("1. Browser login simulation...")
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        data={
            'username': 'test@example.com',
            'password': 'password123'
        },
        headers={'Content-Type': 'application/x-www-form-urlencoded'}
    )
    
    if login_response.status_code != 200:
        print(f"   [ERROR] Login failed: {login_response.status_code}")
        return
    
    token_data = login_response.json()
    token = token_data.get('access_token')
    print(f"   [SUCCESS] Login successful, token: {token[:30]}...")
    
    # Step 2: Get user info (like AuthContext does)
    print("\n2. Getting user info...")
    user_response = requests.get(
        f"{BASE_URL}/auth/me",
        headers={'Authorization': f'Bearer {token}'}
    )
    
    if user_response.status_code == 200:
        user_data = user_response.json()
        print(f"   [SUCCESS] User: {user_data.get('name')} ({user_data.get('role')})")
    else:
        print(f"   [ERROR] Failed to get user: {user_response.status_code}")
        return
    
    # Step 3: Wait a moment (simulate user interaction time)
    print("\n3. Simulating user interaction delay...")
    time.sleep(2)
    
    # Step 4: Create technician (exact frontend call)
    print("\n4. Creating technician (exact frontend simulation)...")
    
    # Exact headers and payload that frontend sends
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    payload = {
        "email": "browser_sim_tech@example.com",
        "name": "Browser Sim Technician",
        "job_type": "other",
        "temporary_password": "browserpass123"
    }
    
    print(f"   [REQUEST] URL: {BASE_URL}/invitations/create-technician-direct")
    print(f"   [REQUEST] Headers: {headers}")
    print(f"   [REQUEST] Payload: {json.dumps(payload, indent=2)}")
    
    # Make the request
    create_response = requests.post(
        f"{BASE_URL}/invitations/create-technician-direct",
        headers=headers,
        json=payload
    )
    
    print(f"   [RESPONSE] Status: {create_response.status_code}")
    print(f"   [RESPONSE] Headers: {dict(create_response.headers)}")
    
    if create_response.status_code == 201:
        result = create_response.json()
        print(f"   [SUCCESS] Created: {result.get('name')} ({result.get('email')})")
    else:
        print(f"   [ERROR] FAILED! Status: {create_response.status_code}")
        try:
            error_data = create_response.json()
            print(f"   [ERROR] Response: {json.dumps(error_data, indent=2)}")
        except:
            print(f"   [ERROR] Raw: {create_response.text}")
    
    # Step 5: Test token validation again
    print("\n5. Re-validating token after technician creation...")
    validate_response = requests.get(
        f"{BASE_URL}/auth/me",
        headers={'Authorization': f'Bearer {token}'}
    )
    
    if validate_response.status_code == 200:
        print("   [SUCCESS] Token still valid after technician creation")
    else:
        print(f"   [ERROR] Token validation failed: {validate_response.status_code}")
        try:
            error = validate_response.json()
            print(f"   [ERROR] Validation Error: {error}")
        except:
            print(f"   [ERROR] Raw Validation Error: {validate_response.text}")

def test_multiple_requests():
    """Test multiple rapid requests to see if there's a concurrency issue"""
    print("\n" + "=" * 50)
    print("Multiple Requests Test")
    print("=" * 50)
    
    # Login first
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        data={'username': 'test@example.com', 'password': 'password123'},
        headers={'Content-Type': 'application/x-www-form-urlencoded'}
    )
    
    if login_response.status_code != 200:
        print("[ERROR] Login failed for multiple requests test")
        return
    
    token = login_response.json().get('access_token')
    print(f"[SUCCESS] Token obtained for multiple requests test")
    
    # Make multiple rapid requests
    for i in range(3):
        print(f"\n[REQUEST {i+1}]:")
        
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            "email": f"multi_test_{i}_{int(time.time())}@example.com",
            "name": f"Multi Test Tech {i+1}",
            "job_type": "other",
            "temporary_password": "multipass123"
        }
        
        response = requests.post(
            f"{BASE_URL}/invitations/create-technician-direct",
            headers=headers,
            json=payload
        )
        
        print(f"   Status: {response.status_code}")
        if response.status_code != 201:
            try:
                error = response.json()
                print(f"   Error: {error}")
            except:
                print(f"   Raw Error: {response.text}")
        else:
            result = response.json()
            print(f"   Success: {result.get('name')}")

if __name__ == "__main__":
    simulate_browser_flow()
    test_multiple_requests()
