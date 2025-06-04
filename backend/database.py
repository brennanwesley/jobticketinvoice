from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Get database URL from environment variables with SQLite fallback for local development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

# If using PostgreSQL in Docker, replace localhost with db service name
if DATABASE_URL.startswith("postgresql") and "localhost" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("localhost", "db")

logger.info(f"Connecting to database: {DATABASE_URL.split('@')[0].split('://')[0]}://*****@{DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'local'}")

# Configure SQLAlchemy engine with appropriate parameters for PostgreSQL or SQLite
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    # PostgreSQL specific settings
    connect_args = {
        "connect_timeout": 10,  # Connection timeout in seconds
        "application_name": "jobticketinvoice-api"  # Identify application in pg_stat_activity
    }

# Create SQLAlchemy engine with appropriate settings
engine = create_engine(
    DATABASE_URL, 
    connect_args=connect_args,
    pool_size=5,  # Default connection pool size
    max_overflow=10,  # Allow up to 10 connections to be created beyond pool_size
    pool_timeout=30,  # Seconds to wait before giving up on getting a connection from the pool
    pool_recycle=1800,  # Recycle connections after 30 minutes to avoid stale connections
    echo=False  # Set to True to log all SQL statements (useful for debugging)
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
