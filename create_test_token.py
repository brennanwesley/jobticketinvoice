import sqlite3
import secrets
from datetime import datetime, timedelta

def create_test_invitation_token():
    """Create a test invitation token directly in the database"""
    
    # Connect to the database
    conn = sqlite3.connect('backend/app.db')
    cursor = conn.cursor()
    
    try:
        # Check if we have a company and manager
        cursor.execute("SELECT id, name FROM companies LIMIT 1")
        company = cursor.fetchone()
        
        if not company:
            print("No company found in database")
            return None
            
        company_id, company_name = company
        print(f"Using company: {company_name} (ID: {company_id})")
        
        # Check for a manager in this company
        cursor.execute("SELECT id, name FROM users WHERE company_id = ? AND role = 'manager' LIMIT 1", (company_id,))
        manager = cursor.fetchone()
        
        if not manager:
            print("No manager found for this company")
            return None
            
        manager_id, manager_name = manager
        print(f"Using manager: {manager_name} (ID: {manager_id})")
        
        # Create a test invitation token
        test_token = "test-invitation-" + secrets.token_urlsafe(16)
        test_email = "test.technician@example.com"
        expires_at = datetime.utcnow() + timedelta(hours=48)
        
        # Check if invitation already exists
        cursor.execute("SELECT token FROM technician_invitations WHERE email = ? AND company_id = ? AND is_used = 0", 
                      (test_email, company_id))
        existing = cursor.fetchone()
        
        if existing:
            print(f"Existing invitation found with token: {existing[0]}")
            print(f"Test URL: http://localhost:3000/signup-tech?token={existing[0]}")
            return existing[0]
        
        # Insert test invitation
        cursor.execute("""
            INSERT INTO technician_invitations 
            (email, name, job_type, company_id, invited_by, token, expires_at, invitation_message, is_used, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            test_email,
            "Test Technician",
            "pump_service_technician",
            company_id,
            manager_id,
            test_token,
            expires_at.isoformat(),
            "Welcome to our team! Please complete your registration.",
            False,
            datetime.utcnow().isoformat()
        ))
        
        conn.commit()
        
        print("SUCCESS: Test invitation created!")
        print(f"Email: {test_email}")
        print(f"Token: {test_token}")
        print(f"Expires: {expires_at}")
        print(f"Company: {company_name}")
        print(f"Invited by: {manager_name}")
        print()
        print(f"Test URL: http://localhost:3000/signup-tech?token={test_token}")
        
        return test_token
        
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
        return None
    finally:
        conn.close()

if __name__ == "__main__":
    create_test_invitation_token()
