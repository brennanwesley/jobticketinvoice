#!/usr/bin/env python3
"""
Database Schema Inspector
Checks current database schema and table structure
"""

from database import engine
from sqlalchemy import inspect, text
import os

def check_database_schema():
    """Check current database schema and structure"""
    print("=== DATABASE SCHEMA INSPECTION ===\n")
    
    # Get database file info
    db_file = "app.db"
    if os.path.exists(db_file):
        size = os.path.getsize(db_file)
        print(f"Database file: {db_file} ({size:,} bytes)")
    else:
        print(f"Database file: {db_file} (NOT FOUND)")
    
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    print(f"\nTables found: {len(tables)}")
    for table in tables:
        print(f"  - {table}")
    
    # Check each table structure
    for table in tables:
        print(f"\n=== {table.upper()} TABLE ===")
        columns = inspector.get_columns(table)
        
        print("Columns:")
        for col in columns:
            nullable = "NULL" if col["nullable"] else "NOT NULL"
            print(f"  {col['name']:<20} {str(col['type']):<15} {nullable}")
        
        # Check foreign keys
        fks = inspector.get_foreign_keys(table)
        if fks:
            print("Foreign Keys:")
            for fk in fks:
                print(f"  {fk['constrained_columns']} -> {fk['referred_table']}.{fk['referred_columns']}")
        
        # Check indexes
        indexes = inspector.get_indexes(table)
        if indexes:
            print("Indexes:")
            for idx in indexes:
                unique = "UNIQUE" if idx["unique"] else "INDEX"
                print(f"  {unique}: {idx['name']} on {idx['column_names']}")
        
        # Get row count
        with engine.connect() as conn:
            result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
            count = result.scalar()
            print(f"Row count: {count}")

if __name__ == "__main__":
    check_database_schema()
