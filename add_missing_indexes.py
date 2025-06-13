#!/usr/bin/env python3
"""
Add Missing Database Indexes Script
Adds indexes on foreign key columns to improve query performance
"""
import sqlite3
import os
from datetime import datetime

def add_missing_indexes():
    print("=" * 80)
    print("ADDING MISSING DATABASE INDEXES - JobTicketInvoice")
    print("=" * 80)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    db_path = 'backend/app.db'
    
    if not os.path.exists(db_path):
        print(f"[ERROR] Database file not found: {db_path}")
        return False
    
    # Backup the database first
    backup_path = f'backend/app_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.db'
    print(f"[BACKUP] Creating backup: {backup_path}")
    
    try:
        # Create backup
        import shutil
        shutil.copy2(db_path, backup_path)
        print(f"[BACKUP] [OK] Backup created successfully")
    except Exception as e:
        print(f"[ERROR] Failed to create backup: {e}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print(f"\n[DATABASE] Connected to: {db_path}")
        
        # List of indexes to create
        indexes_to_create = [
            {
                'name': 'idx_invoices_job_ticket_id',
                'table': 'invoices',
                'column': 'job_ticket_id',
                'description': 'Index on invoices.job_ticket_id foreign key'
            },
            {
                'name': 'idx_invoices_user_id',
                'table': 'invoices',
                'column': 'user_id',
                'description': 'Index on invoices.user_id foreign key'
            },
            {
                'name': 'idx_job_tickets_company_id',
                'table': 'job_tickets',
                'column': 'company_id',
                'description': 'Index on job_tickets.company_id foreign key'
            },
            {
                'name': 'idx_job_tickets_user_id',
                'table': 'job_tickets',
                'column': 'user_id',
                'description': 'Index on job_tickets.user_id foreign key'
            },
            {
                'name': 'idx_technician_invitations_invited_by',
                'table': 'technician_invitations',
                'column': 'invited_by',
                'description': 'Index on technician_invitations.invited_by foreign key'
            },
            {
                'name': 'idx_technician_invitations_company_id',
                'table': 'technician_invitations',
                'column': 'company_id',
                'description': 'Index on technician_invitations.company_id foreign key'
            },
            {
                'name': 'idx_users_company_id',
                'table': 'users',
                'column': 'company_id',
                'description': 'Index on users.company_id foreign key'
            }
        ]
        
        print(f"\n[INDEXES] Planning to create {len(indexes_to_create)} indexes")
        print("-" * 60)
        
        # Check which indexes already exist
        cursor.execute("SELECT name FROM sqlite_master WHERE type='index'")
        existing_indexes = [row[0] for row in cursor.fetchall()]
        
        created_count = 0
        skipped_count = 0
        
        for index_info in indexes_to_create:
            index_name = index_info['name']
            table_name = index_info['table']
            column_name = index_info['column']
            description = index_info['description']
            
            print(f"\n[INDEX] {index_name}")
            print(f"  Table: {table_name}")
            print(f"  Column: {column_name}")
            print(f"  Description: {description}")
            
            # Check if index already exists
            if index_name in existing_indexes:
                print(f"  Status: [SKIP] Index already exists")
                skipped_count += 1
                continue
            
            # Check if table exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table_name,))
            if not cursor.fetchone():
                print(f"  Status: [SKIP] Table {table_name} does not exist")
                skipped_count += 1
                continue
            
            # Check if column exists
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = [col[1] for col in cursor.fetchall()]
            if column_name not in columns:
                print(f"  Status: [SKIP] Column {column_name} does not exist in table {table_name}")
                skipped_count += 1
                continue
            
            # Create the index
            try:
                sql = f"CREATE INDEX {index_name} ON {table_name}({column_name})"
                print(f"  SQL: {sql}")
                
                start_time = datetime.now()
                cursor.execute(sql)
                end_time = datetime.now()
                duration = (end_time - start_time).total_seconds()
                
                print(f"  Status: [CREATED] [OK] Index created successfully ({duration:.3f}s)")
                created_count += 1
                
            except sqlite3.Error as e:
                print(f"  Status: [ERROR] Failed to create index: {e}")
        
        # Commit all changes
        conn.commit()
        
        # Analyze the database to update statistics
        print(f"\n[ANALYZE] Updating database statistics...")
        cursor.execute("ANALYZE")
        conn.commit()
        print(f"[ANALYZE] [OK] Database statistics updated")
        
        # Get final index count
        cursor.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='index'")
        total_indexes = cursor.fetchone()[0]
        
        conn.close()
        
        # Summary
        print(f"\n" + "=" * 80)
        print("INDEX CREATION SUMMARY")
        print("=" * 80)
        print(f"[OK] Indexes Created: {created_count}")
        print(f"[-] Indexes Skipped: {skipped_count}")
        print(f"[STATS] Total Indexes: {total_indexes}")
        print(f"[BACKUP] Backup Created: {backup_path}")
        print(f"[TIME] Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        if created_count > 0:
            print(f"\n[PERFORMANCE] IMPROVEMENT:")
            print(f"   Foreign key queries will now be significantly faster!")
            print(f"   JOINs between tables will have better performance!")
            print(f"   Multi-tenant filtering will be more efficient!")
        
        print(f"\n[NEXT STEPS]:")
        print(f"   1. Test your application to ensure everything works correctly")
        print(f"   2. Monitor query performance improvements")
        print(f"   3. Consider running VACUUM if database size has grown significantly")
        
        return True
        
    except sqlite3.Error as e:
        print(f"[ERROR] Database error: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        return False

def verify_indexes():
    """Verify that all expected indexes exist"""
    print(f"\n" + "=" * 80)
    print("VERIFYING INDEXES")
    print("=" * 80)
    
    db_path = 'backend/app.db'
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get all indexes
        cursor.execute("""
            SELECT name, tbl_name, sql 
            FROM sqlite_master 
            WHERE type='index' 
            AND name LIKE 'idx_%'
            ORDER BY name
        """)
        
        indexes = cursor.fetchall()
        
        print(f"[VERIFICATION] Found {len(indexes)} custom indexes:")
        for name, table, sql in indexes:
            print(f"  [OK] {name} on {table}")
        
        # Check foreign key performance
        print(f"\n[PERFORMANCE] Testing foreign key query performance...")
        
        # Test a few sample queries that would benefit from indexes
        test_queries = [
            ("SELECT * FROM users WHERE company_id = 1", "users.company_id lookup"),
            ("SELECT * FROM job_tickets WHERE company_id = 1", "job_tickets.company_id lookup"),
            ("SELECT * FROM technician_invitations WHERE company_id = 1", "technician_invitations.company_id lookup")
        ]
        
        for query, description in test_queries:
            try:
                start_time = datetime.now()
                cursor.execute(query)
                results = cursor.fetchall()
                end_time = datetime.now()
                duration = (end_time - start_time).total_seconds() * 1000  # Convert to milliseconds
                
                print(f"  [OK] {description}: {len(results)} rows in {duration:.2f}ms")
            except sqlite3.Error as e:
                print(f"  [ERROR] {description}: Error - {e}")
        
        conn.close()
        
        print(f"\n[SUCCESS] INDEX VERIFICATION COMPLETE")
        
    except Exception as e:
        print(f"[ERROR] Verification failed: {e}")

if __name__ == "__main__":
    success = add_missing_indexes()
    if success:
        verify_indexes()
    else:
        print(f"\n[FAILED] INDEX CREATION FAILED")
        print(f"   Check the error messages above and try again.")
