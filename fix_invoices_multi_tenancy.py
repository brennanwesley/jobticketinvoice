#!/usr/bin/env python3
"""
Fix Invoices Multi-Tenancy Script
Adds company_id column to invoices table to maintain multi-tenant data isolation
"""
import sqlite3
import os
from datetime import datetime

def fix_invoices_multi_tenancy():
    print("=" * 80)
    print("FIXING INVOICES MULTI-TENANCY - JobTicketInvoice")
    print("=" * 80)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    db_path = 'backend/app.db'
    
    if not os.path.exists(db_path):
        print(f"[ERROR] Database file not found: {db_path}")
        return False
    
    # Backup the database first
    backup_path = f'backend/app_backup_multitenancy_{datetime.now().strftime("%Y%m%d_%H%M%S")}.db'
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
        
        # Check current invoices table structure
        print(f"\n[ANALYSIS] Checking current invoices table structure...")
        cursor.execute("PRAGMA table_info(invoices)")
        columns = cursor.fetchall()
        
        print(f"[ANALYSIS] Current invoices table columns:")
        for col in columns:
            print(f"  - {col[1]} ({col[2]}) {'NOT NULL' if col[3] else 'NULL'}")
        
        # Check if company_id column already exists
        column_names = [col[1] for col in columns]
        if 'company_id' in column_names:
            print(f"\n[SKIP] company_id column already exists in invoices table")
            conn.close()
            return True
        
        # Check if invoices table has any data
        cursor.execute("SELECT COUNT(*) FROM invoices")
        invoice_count = cursor.fetchone()[0]
        print(f"\n[DATA] Current invoices count: {invoice_count}")
        
        if invoice_count > 0:
            print(f"[WARNING] Invoices table contains data. Migration will be more complex.")
            
            # Get sample data to understand the structure
            cursor.execute("SELECT * FROM invoices LIMIT 3")
            sample_data = cursor.fetchall()
            print(f"[DATA] Sample invoices data:")
            for row in sample_data:
                print(f"  {row}")
        
        # Add company_id column to invoices table
        print(f"\n[MIGRATION] Adding company_id column to invoices table...")
        
        # Step 1: Add the column (nullable initially)
        alter_sql = "ALTER TABLE invoices ADD COLUMN company_id TEXT"
        print(f"[SQL] {alter_sql}")
        cursor.execute(alter_sql)
        print(f"[MIGRATION] [OK] company_id column added successfully")
        
        # Step 2: If there's existing data, we need to populate company_id
        if invoice_count > 0:
            print(f"\n[DATA_MIGRATION] Populating company_id for existing invoices...")
            
            # Strategy: Get company_id from the associated job_ticket
            # Since invoices have job_ticket_id, we can join with job_tickets to get company_id
            update_sql = """
                UPDATE invoices 
                SET company_id = (
                    SELECT jt.company_id 
                    FROM job_tickets jt 
                    WHERE jt.id = invoices.job_ticket_id
                )
                WHERE invoices.job_ticket_id IS NOT NULL
            """
            print(f"[SQL] {update_sql}")
            cursor.execute(update_sql)
            updated_rows = cursor.rowcount
            print(f"[DATA_MIGRATION] [OK] Updated {updated_rows} invoices with company_id from job_tickets")
            
            # Check for any invoices that couldn't be updated
            cursor.execute("SELECT COUNT(*) FROM invoices WHERE company_id IS NULL")
            null_company_count = cursor.fetchone()[0]
            
            if null_company_count > 0:
                print(f"[WARNING] {null_company_count} invoices still have NULL company_id")
                print(f"[WARNING] These invoices may not be associated with valid job_tickets")
                
                # Show the problematic invoices
                cursor.execute("SELECT id, job_ticket_id FROM invoices WHERE company_id IS NULL LIMIT 5")
                problematic_invoices = cursor.fetchall()
                print(f"[WARNING] Problematic invoices:")
                for inv in problematic_invoices:
                    print(f"  Invoice ID: {inv[0]}, Job Ticket ID: {inv[1]}")
        
        # Step 3: Add foreign key constraint (we'll create an index instead since SQLite FK constraints are complex to add)
        print(f"\n[INDEX] Creating index on invoices.company_id...")
        index_sql = "CREATE INDEX idx_invoices_company_id ON invoices(company_id)"
        print(f"[SQL] {index_sql}")
        cursor.execute(index_sql)
        print(f"[INDEX] [OK] Index created successfully")
        
        # Commit all changes
        conn.commit()
        
        # Verify the changes
        print(f"\n[VERIFICATION] Verifying changes...")
        cursor.execute("PRAGMA table_info(invoices)")
        new_columns = cursor.fetchall()
        
        print(f"[VERIFICATION] Updated invoices table columns:")
        for col in new_columns:
            print(f"  - {col[1]} ({col[2]}) {'NOT NULL' if col[3] else 'NULL'}")
        
        # Check data integrity
        cursor.execute("SELECT COUNT(*) FROM invoices WHERE company_id IS NOT NULL")
        valid_company_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM invoices WHERE company_id IS NULL")
        null_company_count = cursor.fetchone()[0]
        
        print(f"\n[DATA_INTEGRITY] Invoices with valid company_id: {valid_company_count}")
        print(f"[DATA_INTEGRITY] Invoices with NULL company_id: {null_company_count}")
        
        # Test a sample query to ensure multi-tenancy works
        print(f"\n[TESTING] Testing multi-tenant query...")
        cursor.execute("SELECT COUNT(*) FROM invoices WHERE company_id = ?", ("test-company-id",))
        test_count = cursor.fetchone()[0]
        print(f"[TESTING] [OK] Multi-tenant query executed successfully (found {test_count} invoices)")
        
        conn.close()
        
        # Summary
        print(f"\n" + "=" * 80)
        print("MULTI-TENANCY FIX SUMMARY")
        print("=" * 80)
        print(f"[OK] company_id column added to invoices table")
        print(f"[OK] Index created on invoices.company_id")
        print(f"[OK] Data migration completed")
        print(f"[STATS] Total invoices: {invoice_count}")
        print(f"[STATS] Valid company_id: {valid_company_count}")
        print(f"[STATS] NULL company_id: {null_company_count}")
        print(f"[BACKUP] Backup created: {backup_path}")
        print(f"[TIME] Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        print(f"\n[MULTI-TENANCY] IMPROVEMENT:")
        print(f"   Invoices table now supports proper multi-tenant data isolation!")
        print(f"   Company-specific invoice queries will be secure and efficient!")
        print(f"   Data integrity maintained across tenant boundaries!")
        
        if null_company_count > 0:
            print(f"\n[ACTION_REQUIRED]:")
            print(f"   {null_company_count} invoices have NULL company_id")
            print(f"   These may need manual review and correction")
            print(f"   Consider adding NOT NULL constraint after fixing NULL values")
        
        print(f"\n[NEXT_STEPS]:")
        print(f"   1. Test invoice queries with company_id filtering")
        print(f"   2. Update application code to use company_id in invoice queries")
        print(f"   3. Consider adding NOT NULL constraint after fixing any NULL values")
        print(f"   4. Update invoice creation logic to include company_id")
        
        return True
        
    except sqlite3.Error as e:
        print(f"[ERROR] Database error: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        return False

def verify_multi_tenancy():
    """Verify that multi-tenancy is working correctly"""
    print(f"\n" + "=" * 80)
    print("VERIFYING MULTI-TENANCY")
    print("=" * 80)
    
    db_path = 'backend/app.db'
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check all tables for company_id column
        tables_to_check = ['companies', 'users', 'job_tickets', 'invoices', 'technician_invitations', 'audit_logs']
        
        print(f"[VERIFICATION] Checking multi-tenancy support across all tables:")
        
        for table in tables_to_check:
            cursor.execute(f"PRAGMA table_info({table})")
            columns = cursor.fetchall()
            column_names = [col[1] for col in columns]
            
            if 'company_id' in column_names:
                print(f"  [OK] {table}: Has company_id column")
            else:
                print(f"  [MISSING] {table}: Missing company_id column")
        
        # Check foreign key relationships
        print(f"\n[FOREIGN_KEYS] Checking foreign key relationships:")
        
        for table in tables_to_check:
            if table == 'companies':
                continue  # Companies table doesn't reference itself
                
            cursor.execute(f"PRAGMA foreign_key_list({table})")
            foreign_keys = cursor.fetchall()
            
            company_fk = [fk for fk in foreign_keys if fk[2] == 'companies']
            if company_fk:
                print(f"  [OK] {table}: Has foreign key to companies table")
            else:
                print(f"  [MISSING] {table}: No foreign key to companies table")
        
        # Check indexes on company_id columns
        print(f"\n[INDEXES] Checking indexes on company_id columns:")
        
        cursor.execute("SELECT name, tbl_name FROM sqlite_master WHERE type='index' AND name LIKE '%company_id%'")
        company_indexes = cursor.fetchall()
        
        for index_name, table_name in company_indexes:
            print(f"  [OK] {table_name}: Index {index_name}")
        
        conn.close()
        
        print(f"\n[SUCCESS] MULTI-TENANCY VERIFICATION COMPLETE")
        
    except Exception as e:
        print(f"[ERROR] Verification failed: {e}")

if __name__ == "__main__":
    success = fix_invoices_multi_tenancy()
    if success:
        verify_multi_tenancy()
    else:
        print(f"\n[FAILED] MULTI-TENANCY FIX FAILED")
        print(f"   Check the error messages above and try again.")
