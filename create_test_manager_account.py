#!/usr/bin/env python3
"""
Create a test manager account for debugging
"""
import requests
import json

# Configuration
BASE_URL = "http://localhost:8000/api/v1"

def create_manager_account():
    """Create a test manager account"""
    print("Creating test manager account...")
    
    manager_data = {
        "email": "test@example.com",
        "password": "testpassword123",
        "name": "Test Manager",
        "company_name": "Test Company",
        "company_address": "123 Test St",
        "company_phone": "5551234567"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/manager-signup/", json=manager_data)
        print(f"Manager signup response status: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            print(f"* Manager created successfully!")
            print(f"* Email: {data.get('email')}")
            print(f"* Company: {data.get('company_name')}")
            return True
        else:
            print(f"* Manager creation failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"* Manager creation error: {str(e)}")
        return False

if __name__ == "__main__":
    create_manager_account()
