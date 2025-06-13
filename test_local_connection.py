#!/usr/bin/env python3
"""
Test that the frontend can now connect to the local backend
"""
import requests
import json

def test_local_backend():
    """Test the local backend connection"""
    print("LOCAL BACKEND CONNECTION TEST")
    print("=" * 50)
    
    local_url = "http://localhost:8000/api/v1/manager-signup/"
    
    # Test with the same email that was failing
    test_data = {
        "name": "Test User",
        "email": "test@email.com",
        "password": "testpassword123",
        "company_name": "Test Energy Service"
    }
    
    print(f"Testing local backend: {local_url}")
    print(f"Test data: {test_data['email']} / {test_data['company_name']}")
    
    try:
        response = requests.post(local_url, json=test_data, timeout=5)
        print(f"Response Status: {response.status_code}")
        
        if response.status_code == 201:
            print("✅ SUCCESS: User created on local backend!")
            print("This means the email doesn't exist locally")
        elif response.status_code == 409:
            print("❌ User already exists on local backend too")
        else:
            print(f"Unexpected status code: {response.status_code}")
        
        try:
            response_data = response.json()
            print(f"Response: {json.dumps(response_data, indent=2)}")
        except:
            print(f"Response Text: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection failed: {e}")
        print("Make sure the local backend is running on port 8000")

if __name__ == "__main__":
    test_local_backend()
