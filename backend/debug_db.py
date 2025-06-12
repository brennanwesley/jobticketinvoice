#!/usr/bin/env python3

from database import engine
from sqlalchemy import text

def check_database_schema():
    """Check the database schema and constraints"""
    conn = engine.connect()
    
    try:
        # Check companies table schema
        print("=== COMPANIES TABLE SCHEMA ===")
        result = conn.execute(text("PRAGMA table_info(companies)"))
        for row in result:
            print(f"Column: {row[1]}, Type: {row[2]}, NotNull: {row[3]}, Default: {row[4]}, PK: {row[5]}")
        
        print("\n=== COMPANIES TABLE CONSTRAINTS ===")
        result = conn.execute(text("SELECT sql FROM sqlite_master WHERE type='table' AND name='companies'"))
        for row in result:
            print(row[0])
            
        print("\n=== USERS TABLE SCHEMA ===")
        result = conn.execute(text("PRAGMA table_info(users)"))
        for row in result:
            print(f"Column: {row[1]}, Type: {row[2]}, NotNull: {row[3]}, Default: {row[4]}, PK: {row[5]}")
            
        print("\n=== CURRENT DATA ===")
        result = conn.execute(text("SELECT COUNT(*) as count FROM companies"))
        print(f"Companies count: {result.scalar()}")
        
        result = conn.execute(text("SELECT COUNT(*) as count FROM users"))
        print(f"Users count: {result.scalar()}")
        
    finally:
        conn.close()

if __name__ == "__main__":
    check_database_schema()
