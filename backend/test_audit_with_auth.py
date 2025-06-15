#!/usr/bin/env python3
"""
Test script for audit logging API endpoints with authentication
Tests the audit log creation and retrieval functionality with proper auth
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"

def login_admin():
    """Login as admin to get authentication token"""
    print("Logging in as admin...")
    
    # Use the test admin credentials
    login_data = {
        "username": "admin@test.com",
        "password": "admin123"
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/auth/login",
            data=login_data  # Use form data for OAuth2
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            print(f"Login successful, token: {token[:20]}...")
            return token
        else:
            print(f"Login failed: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"Login error: {e}")
        return None

def test_audit_log_creation(token):
    """Test creating audit log entries with authentication"""
    print("\nTesting audit log creation...")
    
    # Test audit log data
    audit_data = {
        "action": "login_success",
        "category": "security",
        "description": "User successfully logged in via API test",
        "details": {
            "username": "test@example.com",
            "ip_address": "127.0.0.1",
            "user_agent": "Test Script"
        },
        "target_id": "test-user-123",
        "target_type": "user"
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/audit/log",
            json=audit_data,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
        )
        
        if response.status_code == 200:
            print("Audit log created successfully")
            return response.json()
        else:
            print(f"Failed to create audit log: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"Error creating audit log: {e}")
        return None

def test_audit_log_retrieval(token):
    """Test retrieving audit log entries with authentication"""
    print("\nTesting audit log retrieval...")
    
    try:
        response = requests.get(
            f"{API_BASE}/audit/logs",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"Retrieved {len(data.get('logs', []))} audit logs")
            print(f"Total logs: {data.get('total', 0)}")
            
            # Print first few logs
            for i, log in enumerate(data.get('logs', [])[:3]):
                print(f"  Log {i+1}: {log.get('action')} - {log.get('description')}")
            
            return data
        else:
            print(f"Failed to retrieve audit logs: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"Error retrieving audit logs: {e}")
        return None

def test_audit_log_filtering(token):
    """Test audit log filtering with authentication"""
    print("\nTesting audit log filtering...")
    
    try:
        # Test category filter
        response = requests.get(
            f"{API_BASE}/audit/logs?category=security",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"Retrieved {len(data.get('logs', []))} security audit logs")
            return data
        else:
            print(f"Failed to filter audit logs: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"Error filtering audit logs: {e}")
        return None

def test_audit_stats(token):
    """Test audit statistics endpoint with authentication"""
    print("\nTesting audit statistics...")
    
    try:
        response = requests.get(
            f"{API_BASE}/audit/stats",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("Retrieved audit statistics:")
            print(f"  Total logs: {data.get('total_logs', 0)}")
            print(f"  Categories: {data.get('categories', {})}")
            print(f"  Recent activity: {data.get('recent_activity', 0)}")
            return data
        else:
            print(f"Failed to get audit stats: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"Error getting audit stats: {e}")
        return None

def main():
    """Run all audit API tests with authentication"""
    print("Testing Audit Logging API with Authentication")
    print("=" * 50)
    
    # First login to get authentication token
    token = login_admin()
    if not token:
        print("Failed to login - cannot test audit API")
        return
    
    # Test creation
    created_log = test_audit_log_creation(token)
    
    # Test retrieval
    logs = test_audit_log_retrieval(token)
    
    # Test filtering
    filtered_logs = test_audit_log_filtering(token)
    
    # Test statistics
    stats = test_audit_stats(token)
    
    print("\n" + "=" * 50)
    if created_log and logs and stats:
        print("All audit API tests passed!")
    else:
        print("Some audit API tests failed!")

if __name__ == "__main__":
    main()
