#!/usr/bin/env python3
"""
Test script for audit logging API endpoints
Tests the audit log creation and retrieval functionality
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"

def test_audit_log_creation():
    """Test creating audit log entries"""
    print("Testing audit log creation...")
    
    # Test audit log data
    audit_data = {
        "action": "login_success",
        "category": "security",
        "description": "User successfully logged in",
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
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            print("Audit log created successfully")
            return response.json()
        else:
            print(f"Failed to create audit log: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"Error creating audit log: {e}")
        return None

def test_audit_log_retrieval():
    """Test retrieving audit log entries"""
    print("\nTesting audit log retrieval...")
    
    try:
        response = requests.get(f"{API_BASE}/audit/logs")
        
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

def test_audit_log_filtering():
    """Test audit log filtering"""
    print("\nTesting audit log filtering...")
    
    try:
        # Test category filter
        response = requests.get(f"{API_BASE}/audit/logs?category=security")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Retrieved {len(data.get('logs', []))} security audit logs")
            return data
        else:
            print(f"Failed to filter audit logs: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"Error filtering audit logs: {e}")
        return None

def test_audit_stats():
    """Test audit statistics endpoint"""
    print("\nTesting audit statistics...")
    
    try:
        response = requests.get(f"{API_BASE}/audit/stats")
        
        if response.status_code == 200:
            data = response.json()
            print("Retrieved audit statistics:")
            print(f"  Total logs: {data.get('total_logs', 0)}")
            print(f"  Categories: {data.get('categories', {})}")
            print(f"  Recent activity: {data.get('recent_activity', 0)}")
            return data
        else:
            print(f"Failed to get audit stats: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"Error getting audit stats: {e}")
        return None

def main():
    """Run all audit API tests"""
    print("Testing Audit Logging API")
    print("=" * 40)
    
    # Test creation
    created_log = test_audit_log_creation()
    
    # Test retrieval
    logs = test_audit_log_retrieval()
    
    # Test filtering
    filtered_logs = test_audit_log_filtering()
    
    # Test statistics
    stats = test_audit_stats()
    
    print("\n" + "=" * 40)
    if created_log and logs and stats:
        print("All audit API tests passed!")
    else:
        print("Some audit API tests failed!")

if __name__ == "__main__":
    main()
