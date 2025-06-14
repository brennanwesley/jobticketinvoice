#!/usr/bin/env python3
"""
Test script to manually trigger audit logging
"""
import requests
import json

def test_audit_log():
    # First, get a valid token by logging in
    login_data = {
        "username": "manager@example.com",
        "password": "password123"
    }
    
    try:
        # Login to get token
        print("Logging in...")
        login_response = requests.post("http://localhost:8000/api/v1/auth/login", data=login_data)
        print(f"Login response status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            token_data = login_response.json()
            token = token_data.get("access_token")
            print(f"Got token: {token[:20]}...")
            
            # Now test audit logging
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            audit_data = {
                "action": "test_action",
                "category": "system",
                "description": "Test audit log entry",
                "details": {"test": True, "source": "manual_test"},
                "target_id": "test_target",
                "target_type": "test",
                "ip_address": "127.0.0.1",
                "user_agent": "Test Script"
            }
            
            print("Sending audit log...")
            audit_response = requests.post(
                "http://localhost:8000/api/v1/audit/log", 
                json=audit_data, 
                headers=headers
            )
            
            print(f"Audit response status: {audit_response.status_code}")
            print(f"Audit response: {audit_response.text}")
            
        else:
            print(f"Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_audit_log()
