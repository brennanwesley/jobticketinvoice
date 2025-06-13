#!/usr/bin/env python3
"""
Check what's in the production backend database
"""
import requests
import json

def check_production_signup():
    """Test if we can create a user on production to see the error"""
    print("PRODUCTION BACKEND INVESTIGATION")
    print("=" * 60)
    
    # Test the production backend signup endpoint
    production_url = "https://jobticketinvoice-backend.onrender.com/api/v1/manager-signup/"
    
    # Try to create a test user that should already exist
    test_data = {
        "name": "Test User",
        "email": "test@email.com",
        "password": "testpassword123",
        "company_name": "Test Energy Service"
    }
    
    print(f"Testing signup with: {test_data['email']} / {test_data['company_name']}")
    print(f"Production URL: {production_url}")
    
    try:
        response = requests.post(production_url, json=test_data, timeout=10)
        print(f"Response Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 409:
            print("✅ CONFIRMED: User already exists in production database!")
            print("This explains why you're getting 'User with this email already exists'")
        elif response.status_code == 201:
            print("❌ User was created (unexpected)")
        
        try:
            response_data = response.json()
            print(f"Response Body: {json.dumps(response_data, indent=2)}")
        except:
            print(f"Response Text: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
    
    # Also test a different email to see if signup works
    print(f"\n" + "=" * 60)
    print("Testing with a new email address...")
    
    test_data_new = {
        "name": "New Test User",
        "email": f"newtest{hash('test') % 10000}@email.com",
        "password": "testpassword123",
        "company_name": f"New Test Company {hash('test') % 10000}"
    }
    
    print(f"Testing signup with: {test_data_new['email']} / {test_data_new['company_name']}")
    
    try:
        response = requests.post(production_url, json=test_data_new, timeout=10)
        print(f"Response Status: {response.status_code}")
        
        if response.status_code == 201:
            print("✅ New user created successfully on production")
        elif response.status_code == 409:
            print("❌ Even new user shows as existing (unexpected)")
        
        try:
            response_data = response.json()
            print(f"Response Body: {json.dumps(response_data, indent=2)}")
        except:
            print(f"Response Text: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    check_production_signup()
