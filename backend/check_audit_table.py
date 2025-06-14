#!/usr/bin/env python3
from database import engine
from sqlalchemy import text

def check_audit_table():
    try:
        conn = engine.connect()
        
        # Check if audit_logs table exists
        result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='audit_logs'"))
        table_exists = bool(result.fetchone())
        print(f"Audit table exists: {table_exists}")
        
        if table_exists:
            # Check table structure
            result = conn.execute(text("PRAGMA table_info(audit_logs)"))
            columns = result.fetchall()
            print(f"Audit table columns: {[col[1] for col in columns]}")
            
            # Check if there are any audit logs
            result = conn.execute(text("SELECT COUNT(*) FROM audit_logs"))
            count = result.fetchone()[0]
            print(f"Number of audit logs: {count}")
        
        conn.close()
        
    except Exception as e:
        print(f"Error checking audit table: {e}")

if __name__ == "__main__":
    check_audit_table()
