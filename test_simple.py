import requests
import json

def test_invitation():
    # Test manager login first
    login_data = {
        "username": "test@email.com",
        "password": "testpassword123"
    }
    
    try:
        # Try to login with existing test account
        response = requests.post("http://localhost:8000/api/v1/auth/login", data=login_data)
        
        if response.status_code == 200:
            token = response.json()["access_token"]
            print("SUCCESS: Logged in with test account")
            
            # Create invitation
            invitation_data = {
                "email": "technician.test@example.com",
                "name": "Test Technician",
                "job_type": "pump_service_technician"
            }
            
            headers = {"Authorization": f"Bearer {token}"}
            
            inv_response = requests.post(
                "http://localhost:8000/api/v1/invitations/invite-technician",
                json=invitation_data,
                headers=headers
            )
            
            if inv_response.status_code == 201:
                print("SUCCESS: Invitation created")
                print("You can test the signup page manually")
                print("URL: http://localhost:3000/signup-tech?token=YOUR_TOKEN")
            else:
                print(f"Invitation failed: {inv_response.status_code} - {inv_response.text}")
                
        else:
            print(f"Login failed: {response.status_code} - {response.text}")
            print("You may need to create a manager account first through the UI")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_invitation()
