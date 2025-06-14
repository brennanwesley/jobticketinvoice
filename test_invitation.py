import requests
import json

# Test creating an invitation via API
def create_test_invitation():
    # First, let's create a manager account if needed
    manager_data = {
        "name": "Test Manager",
        "email": "test.manager@example.com", 
        "password": "testpassword123",
        "company_name": "Test Company",
        "company_address": "123 Test St",
        "company_phone": "555-123-4567"
    }
    
    # Try to create manager account
    try:
        response = requests.post("http://localhost:8000/api/v1/manager-signup", json=manager_data)
        if response.status_code == 201:
            print("✅ Manager account created successfully")
            manager_response = response.json()
            token = manager_response.get('access_token')
        elif response.status_code == 409:
            print("ℹ️ Manager account already exists, logging in...")
            # Login to get token
            login_response = requests.post("http://localhost:8000/api/v1/auth/login", data={
                "username": manager_data["email"],
                "password": manager_data["password"]
            })
            if login_response.status_code == 200:
                token = login_response.json()["access_token"]
                print("✅ Logged in successfully")
            else:
                print(f"❌ Login failed: {login_response.text}")
                return None
        else:
            print(f"❌ Manager signup failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error with manager setup: {e}")
        return None
    
    # Now create invitation
    invitation_data = {
        "email": "test.technician@example.com",
        "name": "Test Technician",
        "job_type": "GENERAL_MAINTENANCE",
        "invitation_message": "Welcome to our team! Please complete your registration."
    }
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/invitations/invite-technician",
            json=invitation_data,
            headers=headers
        )
        
        if response.status_code == 201:
            invitation = response.json()
            print("✅ Test invitation created successfully!")
            print(f"📧 Email: {invitation['email']}")
            print(f"👤 Name: {invitation['name']}")
            print(f"⏰ Expires: {invitation['expires_at']}")
            
            # Get the token by checking invitations
            invitations_response = requests.get(
                "http://localhost:8000/api/v1/invitations/",
                headers=headers
            )
            
            if invitations_response.status_code == 200:
                invitations = invitations_response.json()
                for inv in invitations:
                    if inv['email'] == invitation_data['email'] and not inv['is_used']:
                        # We can't get the token from the API for security, so let's use a test token
                        print(f"\n🌐 Test the signup page at:")
                        print(f"http://localhost:3000/signup-tech?token=test-token-123")
                        print("\nNote: You'll need to check the database directly for the actual token")
                        return inv['id']
            
        elif response.status_code == 409:
            print("ℹ️ Invitation already exists for this email")
            print("🌐 Test the signup page at:")
            print("http://localhost:3000/signup-tech?token=test-token-123")
        else:
            print(f"❌ Invitation creation failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error creating invitation: {e}")
        return None

if __name__ == "__main__":
    create_test_invitation()
