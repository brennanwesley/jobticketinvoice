#!/usr/bin/env python3
"""
Create all database tables for the job ticket invoice system
"""

import sys
import os

# Add parent directory to path so we can import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base

# Import all models to ensure they're registered with Base
from models.user import User, UserRole, JobType
from models.job_ticket import JobTicket, JobTicketStatus
from models.audit_log import AuditLog

# Import the database Base
from database import Base

def create_all_tables():
    """Create all database tables using SQLite."""
    
    # Use the same database file as the rest of the application
    DATABASE_URL = "sqlite:///./jobticketinvoice.db"
    
    print(f"Creating tables in database: {DATABASE_URL}")
    
    # Create engine
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    print("All tables created successfully!")
    
    # Print table information
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    print(f"\nCreated tables:")
    for table in sorted(tables):
        columns = inspector.get_columns(table)
        print(f"  {table}: {len(columns)} columns")
        for col in columns:
            print(f"    - {col['name']} ({col['type']})")

if __name__ == "__main__":
    create_all_tables()
