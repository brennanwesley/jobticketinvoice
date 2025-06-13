#!/usr/bin/env python3
"""
Comprehensive test for login authentication and tech invite API endpoints
"""
import requests
import json
import os
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"

def test_login_authentication():
    """Test login with existing users"""
    print("=== Testing Login Authentication ===")
    
    # Test users to try
    test_users = [
        {"email": "manager@test.com", "password": "TempPassword123!"},
        {"email": "admin@example.com", "password": "admin123"},
        {"email": "manager@example.com", "password": "manager123"}
    ]
    
    for user in test_users:
        print(f"\n--- Testing login for {user['email']} ---")
        
        try:
            response = requests.post(
                f"{API_BASE}/auth/login",
                data={
                    "username": user["email"],
                    "password": user["password"]
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"[SUCCESS] Login successful!")
                print(f"Token type: {data.get('token_type')}")
                print(f"Access token (first 50 chars): {data.get('access_token', '')[:50]}...")
                
                # Test the /auth/me endpoint with the token
                headers = {"Authorization": f"Bearer {data.get('access_token')}"}
                me_response = requests.get(f"{API_BASE}/auth/me", headers=headers)
                
                if me_response.status_code == 200:
                    user_data = me_response.json()
                    print(f"[SUCCESS] User info retrieved:")
                    print(f"  Name: {user_data.get('name')}")
                    print(f"  Email: {user_data.get('email')}")
                    print(f"  Role: {user_data.get('role')}")
                    print(f"  Company ID: {user_data.get('company_id')}")
                    
                    return data.get('access_token'), user_data  # Return successful login
                else:
                    print(f"[ERROR] Failed to get user info: {me_response.status_code}")
                    print(f"Response: {me_response.text}")
            else:
                print(f"[ERROR] Login failed: {response.status_code}")
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"[ERROR] Login request failed: {e}")
    
    return None, None

def test_tech_invite_creation(token, user_data):
    """Test creating a tech invite with authentication"""
    print("\n=== Testing Tech Invite Creation ===")
    
    if not token:
        print("[ERROR] No valid token available for testing")
        return
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Test invite data with unique email
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    invite_data = {
        "tech_name": f"Test Technician {timestamp}",
        "email": f"test.tech.{timestamp}@example.com",
        "phone": "555-987-6543"
    }
    
    print(f"Creating invite for: {invite_data}")
    
    try:
        response = requests.post(
            f"{API_BASE}/tech-invites/",
            json=invite_data,
            headers=headers
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            print(f"[SUCCESS] Tech invite created!")
            print(f"Invite ID: {data.get('invite_id')}")
            print(f"Token (first 50 chars): {data.get('token', '')[:50]}...")
            print(f"Expires at: {data.get('expires_at')}")
            
            return data.get('token'), data.get('invite_id')
        else:
            print(f"[ERROR] Failed to create invite")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"[ERROR] Invite creation request failed: {e}")
    
    return None, None

def test_invite_validation(invite_token):
    """Test validating an invite token"""
    print("\n=== Testing Invite Token Validation ===")
    
    if not invite_token:
        print("[ERROR] No invite token available for testing")
        return
    
    try:
        response = requests.get(f"{API_BASE}/tech-invites/validate?token={invite_token}")
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"[SUCCESS] Invite token is valid!")
            print(f"Tech name: {data.get('tech_name')}")
            print(f"Email: {data.get('email')}")
            print(f"Company: {data.get('company_name')}")
            print(f"Status: {data.get('status')}")
        else:
            print(f"[ERROR] Invite validation failed")
            
    except Exception as e:
        print(f"[ERROR] Invite validation request failed: {e}")

def test_list_invites(token):
    """Test listing company invites"""
    print("\n=== Testing List Invites ===")
    
    if not token:
        print("[ERROR] No valid token available for testing")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{API_BASE}/tech-invites/", headers=headers)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"[SUCCESS] Retrieved {len(data)} invites")
            
            for invite in data:
                print(f"  - {invite.get('tech_name')} ({invite.get('email')}) - {invite.get('status')}")
        else:
            print(f"[ERROR] Failed to list invites: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"[ERROR] List invites request failed: {e}")

def main():
    """Run all tests"""
    print("Starting Comprehensive Backend API Tests...")
    print("=" * 60)
    
    # Test login
    token, user_data = test_login_authentication()
    
    if token and user_data:
        print(f"\n[SUCCESS] Authenticated as {user_data.get('name')} ({user_data.get('role')})")
        
        # Test tech invite creation
        invite_token, invite_id = test_tech_invite_creation(token, user_data)
        
        # Test invite validation
        if invite_token:
            test_invite_validation(invite_token)
        
        # Test listing invites
        test_list_invites(token)
        
    else:
        print("\n[ERROR] Could not authenticate with any test user")
        print("Please check if:")
        print("1. Backend server is running on http://localhost:8000")
        print("2. Test users exist in the database")
        print("3. Passwords are correct")
    
    print("\n" + "=" * 60)
    print("Backend API Tests Completed!")

if __name__ == "__main__":
    main()
