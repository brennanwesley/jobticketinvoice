"""
Test script for the SendGrid email invite endpoint
"""
import requests
import json

# Test configuration
BASE_URL = "http://127.0.0.1:8000"
API_BASE = f"{BASE_URL}/api/v1"

def test_email_invite():
    """Test the email invite endpoint"""
    
    print("Testing SendGrid Email Invite Endpoint")
    print("=" * 50)
    
    # First, we need to create a manager account and get a token
    print("1. Creating test manager account...")
    
    # Manager signup data
    manager_data = {
        "email": "test.manager@example.com",
        "password": "TestPassword123!",
        "full_name": "Test Manager",
        "company_name": "Test Oilfield Services",
        "phone": "+1-555-123-4567"
    }
    
    try:
        # Create manager account
        response = requests.post(f"{API_BASE}/manager-signup", json=manager_data)
        print(f"   Manager signup status: {response.status_code}")
        
        if response.status_code == 201:
            print("   Manager account created successfully")
            signup_result = response.json()
            token = signup_result.get("access_token")
        else:
            # Try to login if account already exists
            print("   Account might exist, trying to login...")
            login_data = {
                "username": manager_data["email"],
                "password": manager_data["password"]
            }
            
            response = requests.post(f"{API_BASE}/auth/token", data=login_data)
            if response.status_code == 200:
                print("   Manager login successful")
                token = response.json().get("access_token")
            else:
                print(f"   Login failed: {response.text}")
                return
        
        print(f"   Token obtained: {token[:20]}...")
        
        # Test email invite
        print("\n2. Testing email invite endpoint...")
        
        headers = {"Authorization": f"Bearer {token}"}
        invite_data = {
            "tech_name": "John Technician",
            "email": "john.tech@example.com"
        }
        
        response = requests.post(
            f"{API_BASE}/tech-invites/send-email",
            json=invite_data,
            headers=headers
        )
        
        print(f"   Email invite status: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print("   Email invite endpoint working!")
            print(f"   Message: {result.get('message')}")
            print(f"   Invite ID: {result.get('invite_id')}")
            print(f"   Status: {result.get('status')}")
        else:
            print(f"   Email invite failed: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("Cannot connect to backend server. Make sure it's running on http://127.0.0.1:8000")
    except Exception as e:
        print(f"Test failed with error: {str(e)}")

if __name__ == "__main__":
    test_email_invite()
