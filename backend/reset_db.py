import os
from database import Base, engine
from models.user import User
from models.job_ticket import JobTicket
from models.invoice import Invoice

# 🚨 PRODUCTION SAFETY CHECK - PREVENT ACCIDENTAL DATABASE RESET
if os.getenv("ENVIRONMENT") == "production" or os.getenv("RENDER"):
    print("🚨 PRODUCTION SAFETY: Database reset is DISABLED in production environment!")
    print("❌ Cannot reset database in production - this would wipe ALL customer data!")
    print("💡 If you need to reset, explicitly set ALLOW_DATABASE_RESET=true environment variable")
    exit(1)

# Additional safety check - require explicit confirmation
if not os.getenv("ALLOW_DATABASE_RESET") == "true":
    print("🚨 DATABASE RESET SAFETY: This script requires explicit permission")
    print("❌ Set ALLOW_DATABASE_RESET=true environment variable to enable")
    print("⚠️  WARNING: This will DELETE ALL data and reset the entire database!")
    exit(1)

# Drop all tables
Base.metadata.drop_all(bind=engine)

# Create all tables
Base.metadata.create_all(bind=engine)

print("Database reset successfully!")
