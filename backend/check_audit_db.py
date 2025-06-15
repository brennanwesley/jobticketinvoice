#!/usr/bin/env python3
"""
Check audit_logs table and user data for debugging 500 errors
"""

import sqlite3
import os

def check_database():
    db_path = 'jobticketinvoice.db'
    if not os.path.exists(db_path):
        print('Database file not found')
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # First, check what tables exist
        cursor.execute('SELECT name FROM sqlite_master WHERE type="table"')
        tables = cursor.fetchall()
        print('Existing tables:')
        for table in tables:
            print(f'  {table[0]}')
        
        # Check if audit_logs table exists
        cursor.execute('SELECT name FROM sqlite_master WHERE type="table" AND name="audit_logs"')
        table_exists = cursor.fetchone()
        print(f'\naudit_logs table exists: {table_exists is not None}')
        
        if table_exists:
            # Get table schema
            cursor.execute('PRAGMA table_info(audit_logs)')
            columns = cursor.fetchall()
            print('\naudit_logs table schema:')
            for col in columns:
                print(f'  {col}')
        
        # Check if users table exists and query it
        cursor.execute('SELECT name FROM sqlite_master WHERE type="table" AND name="users"')
        users_table_exists = cursor.fetchone()
        
        if users_table_exists:
            cursor.execute('SELECT id, email, company_id FROM users LIMIT 5')
            users = cursor.fetchall()
            print('\nSample users:')
            for user in users:
                print(f'  User {user[0]}: {user[1]}, company_id: {user[2]}')
        else:
            print('\nusers table does not exist')
        
        # Check if companies table exists
        cursor.execute('SELECT name FROM sqlite_master WHERE type="table" AND name="companies"')
        companies_table_exists = cursor.fetchone()
        
        if companies_table_exists:
            cursor.execute('SELECT company_id, name FROM companies LIMIT 5')
            companies = cursor.fetchall()
            print('\nSample companies:')
            for company in companies:
                print(f'  Company {company[0]}: {company[1]}')
        else:
            print('\ncompanies table does not exist')
            
    except Exception as e:
        print(f'Error: {e}')
    finally:
        conn.close()

if __name__ == '__main__':
    check_database()
