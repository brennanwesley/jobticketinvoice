"""
Script to create all database tables.

This script initializes the database by creating all tables defined in the models.
Run this script before running any migration scripts.

Usage:
    python -m scripts.create_tables
"""

import sys
import os

# Add parent directory to path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine
from models.user import Base as UserBase
from models.job_ticket import Base as JobTicketBase

def main():
    """Create all database tables."""
    print("Creating database tables...")
    
    # Create tables
    UserBase.metadata.create_all(bind=engine)
    JobTicketBase.metadata.create_all(bind=engine)
    
    print("Database tables created successfully!")

if __name__ == "__main__":
    main()
