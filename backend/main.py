from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv

# Import routers
from routes import auth, users, job_tickets, invoices, companies, invitations, manager_signup, audit, tech_invites, tech_accounts

# Import database setup
from database import Base, engine

# Import config
from core.config import settings

# Load environment variables
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="JobTicketInvoice API",
    description="API for job ticket and invoicing system",
    version="1.0.0",
    docs_url=None,  # Disable default docs
)

# Custom docs URL with authentication
@app.get("/docs", include_in_schema=False)
async def get_documentation():
    return get_swagger_ui_html(openapi_url="/openapi.json", title="API Documentation")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.security.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
def read_root():
    # Updated: 2025-06-12 - CORS fix deployed
    return {"message": "Welcome to JobTicketInvoice API"}

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Include routers
app.include_router(auth.router, prefix=settings.app.api_v1_str)
app.include_router(users.router, prefix=settings.app.api_v1_str)
app.include_router(job_tickets.router, prefix=settings.app.api_v1_str)
app.include_router(invoices.router, prefix=settings.app.api_v1_str)
app.include_router(companies.router, prefix=settings.app.api_v1_str)
app.include_router(invitations.router, prefix=settings.app.api_v1_str)
app.include_router(manager_signup.router, prefix=settings.app.api_v1_str)
app.include_router(audit.router, prefix=settings.app.api_v1_str)
app.include_router(tech_invites.router, prefix=settings.app.api_v1_str)
app.include_router(tech_accounts.router, prefix=settings.app.api_v1_str)

# Mount static files directory for serving logo uploads
app.mount("/static", StaticFiles(directory="static"), name="static")

# Run the application with uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
# - Invoice endpoints
# - Customer management endpoints
# - GPT integration endpoints
