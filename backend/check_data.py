#!/usr/bin/env python3
"""
Check current database data
"""

from database import engine
from sqlalchemy import text

def check_data():
    """Check current data in database"""
    print("=== DATABASE DATA INSPECTION ===\n")
    
    with engine.connect() as conn:
        # Check users
        users = conn.execute(text('SELECT id, email, role, name, company_id, is_active FROM users')).fetchall()
        print(f"=== USERS ({len(users)} records) ===")
        for user in users:
            print(f"ID: {user[0]}, Email: {user[1]}, Role: {user[2]}, Name: {user[3]}, Company: {user[4]}, Active: {user[5]}")
        
        # Check companies
        companies = conn.execute(text('SELECT id, company_id, name, address, phone FROM companies')).fetchall()
        print(f"\n=== COMPANIES ({len(companies)} records) ===")
        for company in companies:
            print(f"ID: {company[0]}, UUID: {company[1]}, Name: {company[2]}, Address: {company[3]}, Phone: {company[4]}")
        
        # Check job tickets
        tickets = conn.execute(text('SELECT id, ticket_number, customer_name, status, company_id FROM job_tickets')).fetchall()
        print(f"\n=== JOB TICKETS ({len(tickets)} records) ===")
        for ticket in tickets:
            print(f"ID: {ticket[0]}, Ticket: {ticket[1]}, Customer: {ticket[2]}, Status: {ticket[3]}, Company: {ticket[4]}")
        
        # Check invitations
        invitations = conn.execute(text('SELECT id, email, name, company_id, is_used FROM technician_invitations')).fetchall()
        print(f"\n=== INVITATIONS ({len(invitations)} records) ===")
        for inv in invitations:
            print(f"ID: {inv[0]}, Email: {inv[1]}, Name: {inv[2]}, Company: {inv[3]}, Used: {inv[4]}")
        
        # Check audit logs
        audits = conn.execute(text('SELECT id, action, category, company_id, timestamp FROM audit_logs')).fetchall()
        print(f"\n=== AUDIT LOGS ({len(audits)} records) ===")
        for audit in audits:
            print(f"ID: {audit[0]}, Action: {audit[1]}, Category: {audit[2]}, Company: {audit[3]}, Time: {audit[4]}")

if __name__ == "__main__":
    check_data()
