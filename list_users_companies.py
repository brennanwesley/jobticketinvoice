#!/usr/bin/env python3
"""
Script to list all users with their email addresses and company names
"""
import sqlite3
import os

def list_users_and_companies():
    # Database path
    db_path = os.path.join('backend', 'app.db')
    
    if not os.path.exists(db_path):
        print(f"Database not found at: {db_path}")
        return
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Query to get users with their company information
        query = """
        SELECT 
            u.email,
            u.name,
            u.role,
            c.name as company_name,
            u.is_active,
            u.created_at
        FROM users u
        LEFT JOIN companies c ON u.company_id = c.id
        ORDER BY u.created_at DESC
        """
        
        cursor.execute(query)
        results = cursor.fetchall()
        
        if not results:
            print("No users found in database.")
            return
        
        print("=" * 80)
        print("CURRENT USERS AND COMPANIES IN DATABASE")
        print("=" * 80)
        print(f"{'Email':<35} {'Company Name':<25} {'Role':<10} {'Active':<8} {'Created'}")
        print("-" * 80)
        
        for row in results:
            email, name, role, company_name, is_active, created_at = row
            active_status = "Yes" if is_active else "No"
            company_display = company_name if company_name else "No Company"
            created_display = created_at[:10] if created_at else "Unknown"
            
            print(f"{email:<35} {company_display:<25} {role:<10} {active_status:<8} {created_display}")
        
        print("-" * 80)
        print(f"Total users: {len(results)}")
        
        # Also show unique companies
        company_query = """
        SELECT 
            c.name,
            c.address,
            c.phone,
            COUNT(u.id) as user_count,
            c.created_at
        FROM companies c
        LEFT JOIN users u ON c.id = u.company_id
        GROUP BY c.id, c.name
        ORDER BY c.created_at DESC
        """
        
        cursor.execute(company_query)
        company_results = cursor.fetchall()
        
        if company_results:
            print("\n" + "=" * 80)
            print("COMPANIES IN DATABASE")
            print("=" * 80)
            print(f"{'Company Name':<30} {'Users':<6} {'Phone':<15} {'Created'}")
            print("-" * 80)
            
            for row in company_results:
                company_name, address, phone, user_count, created_at = row
                phone_display = phone if phone else "Not set"
                created_display = created_at[:10] if created_at else "Unknown"
                
                print(f"{company_name:<30} {user_count:<6} {phone_display:<15} {created_display}")
            
            print("-" * 80)
            print(f"Total companies: {len(company_results)}")
        
        conn.close()
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_users_and_companies()
