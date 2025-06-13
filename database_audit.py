#!/usr/bin/env python3
"""
Comprehensive Database Audit Script
Analyzes database structure, data integrity, performance, and security
"""
import sqlite3
import os
import json
from datetime import datetime

def audit_database():
    print("=" * 100)
    print("COMPREHENSIVE DATABASE AUDIT - JobTicketInvoice")
    print("=" * 100)
    print(f"Audit Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Check for database files
    db_files = []
    potential_paths = [
        'backend/app.db',
        'backend/job_ticket_invoice.db',
        'app.db',
        'job_ticket_invoice.db'
    ]
    
    print("1. DATABASE FILE DISCOVERY")
    print("-" * 50)
    for path in potential_paths:
        if os.path.exists(path):
            size = os.path.getsize(path)
            modified = datetime.fromtimestamp(os.path.getmtime(path))
            db_files.append({
                'path': path,
                'size': size,
                'modified': modified
            })
            print(f"[FOUND] {path} ({size:,} bytes, modified: {modified})")
        else:
            print(f"[NOT FOUND] {path}")
    
    if not db_files:
        print("[ERROR] No database files found!")
        return
    
    # Use the primary database
    primary_db = 'backend/app.db' if os.path.exists('backend/app.db') else db_files[0]['path']
    print(f"\n[ANALYZING] PRIMARY DATABASE: {primary_db}")
    
    try:
        conn = sqlite3.connect(primary_db)
        cursor = conn.cursor()
        
        # 2. SCHEMA ANALYSIS
        print("\n" + "=" * 100)
        print("2. DATABASE SCHEMA ANALYSIS")
        print("=" * 100)
        
        # Get all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        tables = [row[0] for row in cursor.fetchall()]
        
        print(f"[TABLES] FOUND: {len(tables)}")
        for table in tables:
            print(f"  - {table}")
        
        # Analyze each table
        table_analysis = {}
        for table in tables:
            print(f"\n[ANALYZING] TABLE: {table}")
            print("-" * 50)
            
            # Get table info
            cursor.execute(f"PRAGMA table_info({table})")
            columns = cursor.fetchall()
            
            # Get row count
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            row_count = cursor.fetchone()[0]
            
            # Get indexes
            cursor.execute(f"PRAGMA index_list({table})")
            indexes = cursor.fetchall()
            
            # Get foreign keys
            cursor.execute(f"PRAGMA foreign_key_list({table})")
            foreign_keys = cursor.fetchall()
            
            table_analysis[table] = {
                'columns': columns,
                'row_count': row_count,
                'indexes': indexes,
                'foreign_keys': foreign_keys
            }
            
            print(f"[STATS] Rows: {row_count:,}")
            print(f"[STATS] Columns: {len(columns)}")
            print(f"[STATS] Indexes: {len(indexes)}")
            print(f"[STATS] Foreign Keys: {len(foreign_keys)}")
            
            # Column details
            print("   COLUMNS:")
            for col in columns:
                cid, name, type_, notnull, default, pk = col
                pk_str = " (PRIMARY KEY)" if pk else ""
                null_str = " NOT NULL" if notnull else " NULL"
                default_str = f" DEFAULT {default}" if default else ""
                print(f"     - {name}: {type_}{null_str}{default_str}{pk_str}")
            
            # Foreign key details
            if foreign_keys:
                print("   FOREIGN KEYS:")
                for fk in foreign_keys:
                    print(f"     - {fk[3]} -> {fk[2]}.{fk[4]}")
        
        # 3. DATA INTEGRITY ANALYSIS
        print("\n" + "=" * 100)
        print("3. DATA INTEGRITY ANALYSIS")
        print("=" * 100)
        
        integrity_issues = []
        
        # Check for orphaned records
        if 'users' in tables and 'companies' in tables:
            cursor.execute("""
                SELECT COUNT(*) FROM users 
                WHERE company_id IS NOT NULL 
                AND company_id NOT IN (SELECT id FROM companies)
            """)
            orphaned_users = cursor.fetchone()[0]
            if orphaned_users > 0:
                integrity_issues.append(f"[ISSUE] {orphaned_users} users with invalid company_id")
            else:
                print("[OK] No orphaned users found")
        
        if 'job_tickets' in tables and 'users' in tables:
            cursor.execute("""
                SELECT COUNT(*) FROM job_tickets 
                WHERE user_id NOT IN (SELECT id FROM users)
            """)
            orphaned_tickets = cursor.fetchone()[0]
            if orphaned_tickets > 0:
                integrity_issues.append(f"[ISSUE] {orphaned_tickets} job tickets with invalid user_id")
            else:
                print("[OK] No orphaned job tickets found")
        
        if 'job_tickets' in tables and 'companies' in tables:
            cursor.execute("""
                SELECT COUNT(*) FROM job_tickets 
                WHERE company_id IS NOT NULL 
                AND company_id NOT IN (SELECT id FROM companies)
            """)
            orphaned_ticket_companies = cursor.fetchone()[0]
            if orphaned_ticket_companies > 0:
                integrity_issues.append(f"[ISSUE] {orphaned_ticket_companies} job tickets with invalid company_id")
            else:
                print("[OK] No orphaned job ticket companies found")
        
        # Check for duplicate emails
        if 'users' in tables:
            cursor.execute("""
                SELECT email, COUNT(*) as count 
                FROM users 
                GROUP BY email 
                HAVING COUNT(*) > 1
            """)
            duplicate_emails = cursor.fetchall()
            if duplicate_emails:
                integrity_issues.append(f"[ISSUE] Duplicate emails found: {duplicate_emails}")
            else:
                print("[OK] No duplicate emails found")
        
        # Check for duplicate company names
        if 'companies' in tables:
            cursor.execute("""
                SELECT normalized_name, COUNT(*) as count 
                FROM companies 
                GROUP BY normalized_name 
                HAVING COUNT(*) > 1
            """)
            duplicate_companies = cursor.fetchall()
            if duplicate_companies:
                integrity_issues.append(f"[ISSUE] Duplicate company names found: {duplicate_companies}")
            else:
                print("[OK] No duplicate company names found")
        
        # 4. SECURITY ANALYSIS
        print("\n" + "=" * 100)
        print("4. SECURITY ANALYSIS")
        print("=" * 100)
        
        security_issues = []
        
        # Check password hashing
        if 'users' in tables:
            cursor.execute("SELECT email, hashed_password FROM users LIMIT 5")
            sample_users = cursor.fetchall()
            for email, password in sample_users:
                if password and not password.startswith('$2b$'):
                    security_issues.append(f"[ISSUE] User {email} may have unhashed password")
                else:
                    print(f"[OK] User {email} has properly hashed password")
        
        # Check for inactive users
        if 'users' in tables:
            cursor.execute("SELECT COUNT(*) FROM users WHERE is_active = 0")
            inactive_users = cursor.fetchone()[0]
            print(f"[STATS] Inactive users: {inactive_users}")
        
        # 5. PERFORMANCE ANALYSIS
        print("\n" + "=" * 100)
        print("5. PERFORMANCE ANALYSIS")
        print("=" * 100)
        
        performance_issues = []
        
        # Check for missing indexes on foreign keys
        for table, analysis in table_analysis.items():
            fk_columns = [fk[3] for fk in analysis['foreign_keys']]
            indexed_columns = []
            for index in analysis['indexes']:
                cursor.execute(f"PRAGMA index_info({index[1]})")
                index_columns = [col[2] for col in cursor.fetchall()]
                indexed_columns.extend(index_columns)
            
            for fk_col in fk_columns:
                if fk_col not in indexed_columns:
                    performance_issues.append(f"[ISSUE] Missing index on foreign key {table}.{fk_col}")
                else:
                    print(f"[OK] Foreign key {table}.{fk_col} is indexed")
        
        # 6. MULTI-TENANCY ANALYSIS
        print("\n" + "=" * 100)
        print("6. MULTI-TENANCY ANALYSIS")
        print("=" * 100)
        
        multitenancy_issues = []
        
        # Check if all relevant tables have company_id
        tables_needing_company_id = ['users', 'job_tickets', 'invoices', 'audit_logs', 'technician_invitations']
        for table in tables_needing_company_id:
            if table in tables:
                columns = [col[1] for col in table_analysis[table]['columns']]
                if 'company_id' not in columns:
                    multitenancy_issues.append(f"[ISSUE] Table {table} missing company_id for multi-tenancy")
                else:
                    print(f"[OK] Table {table} has company_id for multi-tenancy")
        
        # 7. AUDIT TRAIL ANALYSIS
        print("\n" + "=" * 100)
        print("7. AUDIT TRAIL ANALYSIS")
        print("=" * 100)
        
        if 'audit_logs' in tables:
            cursor.execute("SELECT COUNT(*) FROM audit_logs")
            audit_count = cursor.fetchone()[0]
            print(f"[STATS] Total audit log entries: {audit_count:,}")
            
            cursor.execute("""
                SELECT category, COUNT(*) as count 
                FROM audit_logs 
                GROUP BY category 
                ORDER BY count DESC
            """)
            categories = cursor.fetchall()
            print("[STATS] Audit log categories:")
            for category, count in categories:
                print(f"  - {category}: {count:,} entries")
        else:
            print("[ISSUE] No audit_logs table found - audit trail not implemented")
        
        # 8. SUMMARY AND RECOMMENDATIONS
        print("\n" + "=" * 100)
        print("8. SUMMARY AND RECOMMENDATIONS")
        print("=" * 100)
        
        total_issues = len(integrity_issues) + len(security_issues) + len(performance_issues) + len(multitenancy_issues)
        
        if total_issues == 0:
            print("[EXCELLENT] No critical issues found!")
        else:
            print(f"[WARNING] ISSUES FOUND: {total_issues} total issues need attention")
        
        print(f"\n[STATS] DATABASE STATISTICS:")
        print(f"  - Total Tables: {len(tables)}")
        total_rows = sum(analysis['row_count'] for analysis in table_analysis.values())
        print(f"  - Total Records: {total_rows:,}")
        print(f"  - Database Size: {os.path.getsize(primary_db):,} bytes")
        
        if integrity_issues:
            print(f"\n[CRITICAL] DATA INTEGRITY ISSUES ({len(integrity_issues)}):")
            for issue in integrity_issues:
                print(f"  {issue}")
        
        if security_issues:
            print(f"\n[CRITICAL] SECURITY ISSUES ({len(security_issues)}):")
            for issue in security_issues:
                print(f"  {issue}")
        
        if performance_issues:
            print(f"\n[WARNING] PERFORMANCE ISSUES ({len(performance_issues)}):")
            for issue in performance_issues:
                print(f"  {issue}")
        
        if multitenancy_issues:
            print(f"\n[WARNING] MULTI-TENANCY ISSUES ({len(multitenancy_issues)}):")
            for issue in multitenancy_issues:
                print(f"  {issue}")
        
        print(f"\n[RECOMMENDATIONS]:")
        print(f"  1. Enable foreign key constraints: PRAGMA foreign_keys = ON")
        print(f"  2. Regular backups: Implement automated database backups")
        print(f"  3. Monitoring: Add database performance monitoring")
        print(f"  4. Security: Regular security audits and password policy enforcement")
        print(f"  5. Maintenance: Periodic VACUUM and ANALYZE operations")
        print(f"  6. Scaling: Consider PostgreSQL migration for production")
        
        conn.close()
        
    except sqlite3.Error as e:
        print(f"[ERROR] DATABASE ERROR: {e}")
    except Exception as e:
        print(f"[ERROR] AUDIT ERROR: {e}")
    
    print("\n" + "=" * 100)
    print("AUDIT COMPLETE")
    print("=" * 100)

if __name__ == "__main__":
    audit_database()
