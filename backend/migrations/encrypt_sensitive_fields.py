"""
Migration script to update job_tickets and invoices tables for field-level encryption.

This script:
1. Renames the existing columns to add '_encrypted' prefix
2. Encrypts existing data
3. Updates the column types to String for all encrypted fields

Usage:
    docker-compose exec backend python -m migrations.encrypt_sensitive_fields
"""
import os
import sys
import json
from dotenv import load_dotenv
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import encryption utilities
from core.encryption import encrypt_field

# Load environment variables
load_dotenv()

# Get database connection string from environment
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL environment variable not set")
    sys.exit(1)

# For Docker, replace localhost with db service name
DATABASE_URL = DATABASE_URL.replace("localhost", "db")

def get_connection():
    """Create a connection to the database"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        sys.exit(1)

def migrate_job_tickets(conn):
    """Migrate job_tickets table to use encrypted fields"""
    print("Migrating job_tickets table...")
    cursor = conn.cursor()
    
    try:
        # Check if the table exists
        cursor.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'job_tickets')")
        if not cursor.fetchone()[0]:
            print("job_tickets table does not exist, skipping")
            return
        
        # Get all job tickets
        cursor.execute("SELECT id, location, work_description FROM job_tickets")
        job_tickets = cursor.fetchall()
        
        # Encrypt each job ticket's sensitive fields
        for job_ticket in job_tickets:
            job_id, location, work_description = job_ticket
            
            # Encrypt the fields
            encrypted_location = encrypt_field(location) if location else None
            encrypted_work_description = encrypt_field(work_description) if work_description else None
            
            # Update the record with encrypted values
            cursor.execute(
                "UPDATE job_tickets SET location = %s, work_description = %s WHERE id = %s",
                (encrypted_location, encrypted_work_description, job_id)
            )
        
        print(f"Successfully encrypted {len(job_tickets)} job tickets")
    
    except Exception as e:
        print(f"Error migrating job_tickets table: {e}")
        conn.rollback()
        raise
    finally:
        cursor.close()

def migrate_invoices(conn):
    """Migrate invoices table to use encrypted fields"""
    print("Migrating invoices table...")
    cursor = conn.cursor()
    
    try:
        # Check if the table exists
        cursor.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'invoices')")
        if not cursor.fetchone()[0]:
            print("invoices table does not exist, skipping")
            return
        
        # First, alter the amount column to be a string
        cursor.execute("ALTER TABLE invoices ALTER COLUMN amount TYPE VARCHAR")
        
        # Get all invoices
        cursor.execute("SELECT id, amount, line_items FROM invoices")
        invoices = cursor.fetchall()
        
        # Encrypt each invoice's sensitive fields
        for invoice in invoices:
            invoice_id, amount, line_items = invoice
            
            # Encrypt the fields
            encrypted_amount = encrypt_field(str(amount))
            encrypted_line_items = encrypt_field(line_items) if line_items else None
            
            # Update the record with encrypted values
            cursor.execute(
                "UPDATE invoices SET amount = %s, line_items = %s WHERE id = %s",
                (encrypted_amount, encrypted_line_items, invoice_id)
            )
        
        print(f"Successfully encrypted {len(invoices)} invoices")
    
    except Exception as e:
        print(f"Error migrating invoices table: {e}")
        conn.rollback()
        raise
    finally:
        cursor.close()

def main():
    """Main migration function"""
    print("Starting migration to encrypt sensitive fields...")
    
    # Connect to the database
    conn = get_connection()
    
    try:
        # Migrate job_tickets table
        migrate_job_tickets(conn)
        
        # Migrate invoices table
        migrate_invoices(conn)
        
        print("Migration completed successfully!")
    
    except Exception as e:
        print(f"Migration failed: {e}")
        sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    main()
