"""
Database migration to add audit_logs table for comprehensive system logging
"""

import sqlite3
import uuid
from datetime import datetime, timezone

def migrate_database(db_path: str = "jobticket.db"):
    """
    Add audit_logs table to the database
    """
    print("Starting audit logs migration...")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Create audit_logs table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                company_id TEXT NOT NULL,
                action TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT,
                details TEXT,  -- JSON stored as text
                target_id TEXT,
                target_type TEXT,
                ip_address TEXT,
                user_agent TEXT,
                timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (company_id) REFERENCES companies (company_id)
            )
        """)
        
        # Create indexes for better query performance
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON audit_logs(company_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON audit_logs(category)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_logs_target_id ON audit_logs(target_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_logs_target_type ON audit_logs(target_type)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address)")
        
        # Insert initial system audit log
        cursor.execute("""
            INSERT INTO audit_logs (
                user_id, company_id, action, category, description, 
                details, target_id, target_type, ip_address, timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            None,  # System action, no specific user
            "00000000-0000-0000-0000-000000000000",  # System company ID
            "audit_system_initialized",
            "system",
            "Audit logging system initialized",
            '{"migration": "add_audit_logs", "version": "1.0.0"}',
            None,
            "system",
            "127.0.0.1",
            datetime.now(timezone.utc).isoformat()
        ))
        
        conn.commit()
        print("[SUCCESS] Audit logs table created successfully")
        print("[SUCCESS] Indexes created for optimal query performance")
        print("[SUCCESS] Initial system audit log inserted")
        
        # Verify table creation
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='audit_logs'")
        if cursor.fetchone():
            print("[SUCCESS] Migration completed successfully")
        else:
            print("[ERROR] Migration failed - table not found")
            
    except Exception as e:
        print(f"[ERROR] Migration failed: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

def rollback_migration(db_path: str = "jobticket.db"):
    """
    Rollback audit logs migration (drop table)
    WARNING: This will delete all audit log data!
    """
    print("Rolling back audit logs migration...")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Drop indexes first
        cursor.execute("DROP INDEX IF EXISTS idx_audit_logs_user_id")
        cursor.execute("DROP INDEX IF EXISTS idx_audit_logs_company_id")
        cursor.execute("DROP INDEX IF EXISTS idx_audit_logs_action")
        cursor.execute("DROP INDEX IF EXISTS idx_audit_logs_category")
        cursor.execute("DROP INDEX IF EXISTS idx_audit_logs_timestamp")
        cursor.execute("DROP INDEX IF EXISTS idx_audit_logs_target_id")
        cursor.execute("DROP INDEX IF EXISTS idx_audit_logs_target_type")
        cursor.execute("DROP INDEX IF EXISTS idx_audit_logs_ip_address")
        
        # Drop table
        cursor.execute("DROP TABLE IF EXISTS audit_logs")
        
        conn.commit()
        print("[SUCCESS] Audit logs migration rolled back successfully")
        
    except Exception as e:
        print(f"[ERROR] Rollback failed: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "rollback":
        rollback_migration()
    else:
        migrate_database()
