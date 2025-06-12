import sqlite3
import uuid
import hashlib
from datetime import datetime

# Connect to the database
conn = sqlite3.connect('backend/app.db')
cursor = conn.cursor()

# Create a test company
company_uuid = str(uuid.uuid4())
company_name = "Test Company"
company_normalized_name = company_name.lower().replace(' ', '_')
company_address = "123 Test Street, Test City, TX 12345"
company_phone = "(555) 123-4567"

cursor.execute("""
    INSERT INTO companies (company_id, name, normalized_name, address, phone, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
""", (company_uuid, company_name, company_normalized_name, company_address, company_phone, datetime.utcnow()))

# Get the auto-generated ID for the company
company_id = cursor.lastrowid

# Create a test manager user
user_name = "Test Manager"
user_email = "manager@test.com"
user_password = "password123"
user_role = "manager"

# Simple password hashing (in production, use proper bcrypt)
password_hash = hashlib.sha256(user_password.encode()).hexdigest()

cursor.execute("""
    INSERT INTO users (name, email, hashed_password, role, company_id, is_active, force_password_reset, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
""", (user_name, user_email, password_hash, user_role, company_id, True, False, datetime.utcnow()))

# Get the auto-generated ID for the user
user_id = cursor.lastrowid

# Update company created_by
cursor.execute("UPDATE companies SET created_by = ? WHERE id = ?", (user_id, company_id))

# Commit changes
conn.commit()

print(f"Created test manager:")
print(f"  Email: {user_email}")
print(f"  Password: {user_password}")
print(f"  Role: {user_role}")
print(f"  Company: {company_name}")
print(f"  Company UUID: {company_uuid}")
print(f"  Company ID: {company_id}")
print(f"  User ID: {user_id}")

# Verify the data was created
cursor.execute("SELECT email, role, company_id FROM users WHERE email = ?", (user_email,))
user = cursor.fetchone()
print(f"\nVerification - User: {user}")

cursor.execute("SELECT id, name, company_id FROM companies WHERE id = ?", (company_id,))
company = cursor.fetchone()
print(f"Verification - Company: {company}")

conn.close()
