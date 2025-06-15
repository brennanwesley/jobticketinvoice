#!/usr/bin/env python3
"""
Simple test for audit logging functionality
"""

import requests
import json

def test_audit_logging():
    """Test audit logging with proper authentication"""
    
    base_url = "http://localhost:8000/api/v1"
    
    # Step 1: Login to get token
    print("1. Logging in...")
    login_data = {
        "username": "admin@test.com",
        "password": "admin123"
    }
    
    try:
        login_response = requests.post(
            f"{base_url}/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if login_response.status_code != 200:
            print(f"Login failed: {login_response.status_code}")
            print(f"Response: {login_response.text}")
            return
        
        token_data = login_response.json()
        token = token_data["access_token"]
        print(f"[SUCCESS] Login successful, got token")
        
        # Step 2: Test audit log creation
        print("\n2. Testing audit log creation...")
        
        audit_data = {
            "action": "test_action",
            "category": "system",
            "description": "Testing audit logging functionality",
            "details": {"test": "data"},
            "target_id": "test_target",
            "target_type": "test",
            "ip_address": "127.0.0.1",
            "user_agent": "test_script"
        }
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        audit_response = requests.post(
            f"{base_url}/audit/log",
            json=audit_data,
            headers=headers
        )
        
        print(f"Audit log response status: {audit_response.status_code}")
        print(f"Audit log response: {audit_response.text}")
        
        if audit_response.status_code == 200:
            print("[SUCCESS] Audit log created successfully!")
        else:
            print("[FAILED] Audit log creation failed")
            
        # Step 3: Test retrieving audit logs
        print("\n3. Testing audit log retrieval...")
        
        logs_response = requests.get(
            f"{base_url}/audit/logs",
            headers=headers
        )
        
        print(f"Logs retrieval status: {logs_response.status_code}")
        if logs_response.status_code == 200:
            logs_data = logs_response.json()
            print(f"[SUCCESS] Retrieved {len(logs_data.get('logs', []))} audit logs")
            if logs_data.get('logs'):
                print(f"Latest log: {logs_data['logs'][0]}")
        else:
            print(f"[FAILED] Failed to retrieve logs: {logs_response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_audit_logging()
