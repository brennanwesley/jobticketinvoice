"""
Test the InviteTokenService directly
"""

import os
import sys
import sqlite3
from datetime import datetime, timedelta

# Add the backend directory to the path
sys.path.append(os.path.dirname(__file__))

from core.invite_tokens import InviteTokenService
from models.tech_invite import TechInvite

def test_invite_token_service():
    """Test the invite token service directly"""
    print("=== Testing InviteTokenService ===")
    
    # Initialize the service
    service = InviteTokenService()
    
    # Test data
    invite_id = "test-invite-456"
    company_id = "test-company-123"
    tech_name = "John Test"
    email = "john.test@example.com"
    
    print(f"Test data: invite_id={invite_id}, company_id={company_id}, tech_name={tech_name}, email={email}")
    
    # Test token creation
    print("\n--- Testing Token Creation ---")
    try:
        token = service.generate_invite_token(
            invite_id=invite_id,
            company_id=company_id,
            tech_name=tech_name,
            email=email
        )
        print("[SUCCESS] Token created successfully!")
        print(f"Token (first 50 chars): {token[:50]}...")
        
        # Test token validation
        print("\n--- Testing Token Validation ---")
        try:
            decoded_data = service.validate_invite_token(token)
            print("[SUCCESS] Token validated successfully!")
            print(f"Decoded data: {decoded_data}")
            
            # Verify the data matches
            expected_data = {
                "invite_id": invite_id,
                "company_id": company_id,
                "tech_name": tech_name,
                "email": email,
                "role": "tech",
                "type": "tech_invite"
            }
            
            for key, value in expected_data.items():
                if key in decoded_data and decoded_data[key] == value:
                    print(f"[SUCCESS] {key}: {value} (matches)")
                else:
                    print(f"[ERROR] {key}: expected {value}, got {decoded_data.get(key)}")
                    
        except Exception as e:
            print(f"[ERROR] Token validation failed: {e}")
            
    except Exception as e:
        print(f"[ERROR] Token creation failed: {e}")
        import traceback
        traceback.print_exc()

def test_database_operations():
    """Test database operations for tech invites"""
    print("\n=== Testing Database Operations ===")
    
    db_path = os.path.join(os.path.dirname(__file__), "app.db")
    
    if not os.path.exists(db_path):
        print("Database not found")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if tech_invites table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='tech_invites'")
        table_exists = cursor.fetchone()
        
        if table_exists:
            print("tech_invites table exists")
            
            # Get table schema
            cursor.execute("PRAGMA table_info(tech_invites)")
            columns = cursor.fetchall()
            print("Table columns:")
            for col in columns:
                print(f"  - {col[1]} ({col[2]})")
            
            # Count existing records
            cursor.execute("SELECT COUNT(*) FROM tech_invites")
            count = cursor.fetchone()[0]
            print(f"Existing records: {count}")
            
            # Test inserting a record
            print("\n--- Testing Record Insertion ---")
            test_invite = {
                "invite_id": "test-invite-123",
                "tech_name": "Test Technician",
                "email": "test.tech@example.com",
                "phone": "555-987-6543",
                "company_id": "test-company-uuid",
                "status": "pending",
                "created_at": datetime.now(),
                "expires_at": datetime.now() + timedelta(hours=48),
                "created_by": 1
            }
            
            # Delete existing test record if it exists
            cursor.execute("DELETE FROM tech_invites WHERE invite_id = ?", (test_invite["invite_id"],))
            
            # Insert test record
            cursor.execute("""
                INSERT INTO tech_invites 
                (invite_id, tech_name, email, phone, company_id, status, created_at, expires_at, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                test_invite["invite_id"],
                test_invite["tech_name"],
                test_invite["email"],
                test_invite["phone"],
                test_invite["company_id"],
                test_invite["status"],
                test_invite["created_at"],
                test_invite["expires_at"],
                test_invite["created_by"]
            ))
            
            conn.commit()
            print("Test record inserted successfully")
            
            # Verify the record
            cursor.execute("SELECT * FROM tech_invites WHERE invite_id = ?", (test_invite["invite_id"],))
            record = cursor.fetchone()
            if record:
                print(f"Record verified: {record[1]} ({record[2]})")
            else:
                print("Record not found after insertion")
                
        else:
            print("tech_invites table does not exist")
        
        conn.close()
        
    except Exception as e:
        print(f"Database operation failed: {e}")
        import traceback
        traceback.print_exc()

def main():
    """Main test function"""
    print("Starting Tech Invite System Tests...")
    print("=" * 50)
    
    # Test the token service
    test_invite_token_service()
    
    # Test database operations
    test_database_operations()
    
    print("\n" + "=" * 50)
    print("Tech Invite System Tests Completed!")

if __name__ == "__main__":
    main()
