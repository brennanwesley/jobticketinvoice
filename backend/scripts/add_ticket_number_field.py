"""
Script to add ticket_number field to job_tickets table.

This script should be run once to add the ticket_number field to existing job tickets.
It will:
1. Add the ticket_number column to the job_tickets table
2. Generate unique ticket numbers for all existing tickets
3. Create a unique index on the ticket_number field

Usage:
    python -m scripts.add_ticket_number_field
"""

import sys
import os
import random
import datetime
from sqlalchemy import Column, String, text

# Add parent directory to path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine, SessionLocal, Base
from models.job_ticket import JobTicket

def generate_ticket_number(db_session, existing_numbers):
    """Generate a unique ticket number that doesn't exist in the database or in the existing_numbers set."""
    # Get the current year's last two digits
    current_year = str(datetime.datetime.now().year)[-2:]
    
    while True:
        # Generate a random 6-digit number
        random_digits = str(random.randint(0, 999999)).zfill(6)
        
        # Combine year and random digits to form the ticket number
        ticket_number = f"{current_year}{random_digits}"
        
        # Check if this ticket number already exists
        if ticket_number not in existing_numbers:
            existing_numbers.add(ticket_number)
            return ticket_number

def main():
    """Main function to add ticket_number field and generate numbers for existing tickets."""
    # Create a database session
    db = SessionLocal()
    
    try:
        # Check if the ticket_number column already exists
        result = db.execute(text("PRAGMA table_info(job_tickets)")).fetchall()
        column_names = [row[1] for row in result]
        
        if 'ticket_number' not in column_names:
            print("Adding ticket_number column to job_tickets table...")
            # Add the ticket_number column
            db.execute(text("ALTER TABLE job_tickets ADD COLUMN ticket_number VARCHAR(8)"))
            db.commit()
            print("Column added successfully.")
        else:
            print("ticket_number column already exists.")
        
        # Get all job tickets
        job_tickets = db.query(JobTicket).all()
        print(f"Found {len(job_tickets)} job tickets.")
        
        # Keep track of existing ticket numbers to avoid duplicates
        existing_numbers = set()
        
        # Generate ticket numbers for all tickets
        update_count = 0
        for ticket in job_tickets:
            if not ticket.ticket_number:
                ticket.ticket_number = generate_ticket_number(db, existing_numbers)
                update_count += 1
        
        # Commit changes
        if update_count > 0:
            print(f"Generating ticket numbers for {update_count} tickets...")
            db.commit()
            print("Ticket numbers generated successfully.")
        else:
            print("No tickets needed updating.")
        
        # Create a unique index on the ticket_number column
        # This is SQLite syntax - adjust for PostgreSQL if needed
        print("Creating unique index on ticket_number column...")
        db.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_job_tickets_ticket_number ON job_tickets(ticket_number)"))
        db.commit()
        print("Index created successfully.")
        
        print("Migration completed successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
