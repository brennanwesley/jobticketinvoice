#!/usr/bin/env python3
"""
Debug script for tech invite 500 errors
Helps diagnose production issues with email invitations
"""
import os
from database import engine, get_db
from sqlalchemy import text
from sqlalchemy.orm import joinedload
from models.user import User
from models.company import Company
from core.email_service import email_service
from core.config import settings

def debug_tech_invite_system():
    """Debug the tech invite system to find 500 error causes"""
    print("=== Tech Invite System Debug ===\n")
    
    # Check database connection
    try:
        conn = engine.connect()
        print("[OK] Database connection successful")
        
        # Check users and companies
        result = conn.execute(text("""
            SELECT u.id, u.email, u.role, u.company_id, c.name as company_name
            FROM users u 
            LEFT JOIN companies c ON u.company_id = c.id
            WHERE u.role IN ('manager', 'admin')
            ORDER BY u.created_at DESC
        """))
        managers = result.fetchall()
        
        print(f"\nManager Users ({len(managers)} found):")
        for manager in managers:
            status = "[OK]" if manager[3] else "[ERROR]"
            print(f"  {status} ID: {manager[0]}, Email: {manager[1]}, Role: {manager[2]}")
            print(f"      Company ID: {manager[3]}, Company Name: {manager[4] or 'NONE'}")
        
        # Check for managers without companies
        orphaned_managers = [m for m in managers if not m[3]]
        if orphaned_managers:
            print(f"\n[CRITICAL] {len(orphaned_managers)} managers without companies!")
            for manager in orphaned_managers:
                print(f"   - {manager[1]} (ID: {manager[0]})")
        
        # Check companies table
        result = conn.execute(text("SELECT COUNT(*) FROM companies"))
        company_count = result.fetchone()[0]
        print(f"\nTotal companies: {company_count}")
        
        if company_count > 0:
            result = conn.execute(text("""
                SELECT id, name, created_at 
                FROM companies 
                ORDER BY created_at DESC 
                LIMIT 5
            """))
            companies = result.fetchall()
            print("   Recent companies:")
            for company in companies:
                print(f"     - ID: {company[0]}, Name: {company[1]}, Created: {company[2]}")
        
        conn.close()
        
    except Exception as e:
        print(f"[ERROR] Database error: {e}")
        return
    
    # Check email service
    print(f"\nEmail Service Status:")
    print(f"   - Configured: {email_service.is_configured()}")
    print(f"   - Dev Mode: {email_service.dev_mode}")
    print(f"   - SendGrid API Key: {'SET' if settings.email.sendgrid_api_key else 'NOT SET'}")
    print(f"   - From Email: {email_service.from_email}")
    
    # Test user loading with company relationship
    print(f"\nTesting User Loading with Company Relationship:")
    try:
        db = next(get_db())
        
        # Test loading a manager with company
        manager = db.query(User).options(joinedload(User.company)).filter(
            User.role == 'manager'
        ).first()
        
        if manager:
            print(f"   [OK] Loaded manager: {manager.email}")
            if manager.company:
                print(f"   [OK] Company loaded: {manager.company.name} (ID: {manager.company.id})")
                print(f"   [OK] Company ID accessible: {manager.company.company_id}")
            else:
                print(f"   [ERROR] No company associated with manager!")
        else:
            print(f"   [ERROR] No managers found in database")
            
        db.close()
        
    except Exception as e:
        print(f"   [ERROR] Error loading user with company: {e}")
    
    # Environment check
    print(f"\nEnvironment:")
    print(f"   - DATABASE_URL: {settings.database.url[:50]}...")
    print(f"   - ENVIRONMENT: {settings.app.environment}")
    print(f"   - EMAIL_DEV_MODE: {settings.email.dev_mode}")
    
    print(f"\n=== Debug Complete ===")

if __name__ == "__main__":
    debug_tech_invite_system()
