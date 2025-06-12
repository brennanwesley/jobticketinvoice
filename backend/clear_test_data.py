#!/usr/bin/env python3

from database import engine
from sqlalchemy import text

def clear_test_data():
    """Clear all test data from the database"""
    conn = engine.connect()
    
    try:
        print("Clearing all test data from database...")
        
        # Clear tables in order to respect foreign key constraints
        tables_to_clear = [
            'audit_logs',
            'invitations', 
            'job_tickets',
            'users',
            'companies'
        ]
        
        total_deleted = 0
        
        for table in tables_to_clear:
            try:
                result = conn.execute(text(f"DELETE FROM {table}"))
                deleted_count = result.rowcount
                total_deleted += deleted_count
                if deleted_count > 0:
                    print(f"Deleted {deleted_count} records from {table}")
            except Exception as e:
                # Table might not exist, skip it
                print(f"Skipping {table}: {str(e)}")
                continue
        
        conn.commit()
        
        if total_deleted > 0:
            print(f"\n✅ Successfully deleted {total_deleted} total records")
        else:
            print("✅ Database was already clean - no test data found")
            
        print("🧹 Database is now ready for fresh testing")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error clearing database: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    clear_test_data()
