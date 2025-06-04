from database import Base, engine
from models.user import User
from models.job_ticket import JobTicket
from models.invoice import Invoice

# Drop all tables
Base.metadata.drop_all(bind=engine)

# Create all tables
Base.metadata.create_all(bind=engine)

print("Database reset successfully!")
