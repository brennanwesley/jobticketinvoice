"""
Ticket number generation utility.

This module provides functions for generating unique ticket numbers for job tickets.
The ticket number format is YYXXXXXX where:
- YY is the last two digits of the current year
- XXXXXX is a random 6-digit number (000000-999999)

The module ensures that generated ticket numbers are unique within the database.
"""

import random
import datetime
from sqlalchemy.orm import Session
from models.job_ticket import JobTicket


def generate_ticket_number(db: Session) -> str:
    """
    Generate a unique ticket number for a job ticket.
    
    The ticket number format is YYXXXXXX where:
    - YY is the last two digits of the current year
    - XXXXXX is a random 6-digit number (000000-999999)
    
    This function ensures the generated ticket number is unique in the database
    by checking for existing ticket numbers and regenerating if a collision occurs.
    
    Args:
        db: SQLAlchemy database session
        
    Returns:
        A unique ticket number string
    """
    # Get the current year's last two digits
    current_year = str(datetime.datetime.now().year)[-2:]
    
    # Maximum number of attempts to generate a unique ticket number
    max_attempts = 10
    attempts = 0
    
    while attempts < max_attempts:
        # Generate a random 6-digit number
        random_digits = str(random.randint(0, 999999)).zfill(6)
        
        # Combine year and random digits to form the ticket number
        ticket_number = f"{current_year}{random_digits}"
        
        # Check if this ticket number already exists in the database
        existing_ticket = db.query(JobTicket).filter(JobTicket.ticket_number == ticket_number).first()
        
        # If no existing ticket with this number, we've found a unique one
        if not existing_ticket:
            return ticket_number
            
        # Increment attempts counter
        attempts += 1
    
    # If we've exceeded max_attempts, we'll try a different approach
    # This is an extremely unlikely scenario but we handle it for robustness
    while True:
        # Generate a random 6-digit number
        random_digits = str(random.randint(0, 999999)).zfill(6)
        
        # Combine year and random digits to form the ticket number
        ticket_number = f"{current_year}{random_digits}"
        
        # Check if this ticket number already exists in the database
        existing_ticket = db.query(JobTicket).filter(JobTicket.ticket_number == ticket_number).first()
        
        # If no existing ticket with this number, we've found a unique one
        if not existing_ticket:
            return ticket_number
