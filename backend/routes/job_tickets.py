from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.job_ticket import JobTicket
from schemas.job_ticket import JobTicketCreate, JobTicketUpdate, JobTicketResponse, JobTicketList, JobTicketSubmit
from utils.jwt import get_current_user, get_manager_or_admin_user
from utils.ticket_number import generate_ticket_number

router = APIRouter(
    prefix="/job-tickets",
    tags=["Job Tickets"],
)

@router.post("/submit", response_model=JobTicketResponse, status_code=status.HTTP_201_CREATED)
async def submit_job_ticket(
    job_ticket: JobTicketSubmit,
    db: Session = Depends(get_db)
):
    """Submit a job ticket without authentication (for technicians in the field)"""
    # Create new job ticket
    ticket_data = job_ticket.dict()
    # Set status explicitly
    ticket_data["status"] = "submitted"
    
    # Generate a unique ticket number
    ticket_data["ticket_number"] = generate_ticket_number(db)
    
    db_job_ticket = JobTicket(**ticket_data)
    
    # Save job ticket to database
    db.add(db_job_ticket)
    db.commit()
    db.refresh(db_job_ticket)
    
    return db_job_ticket

@router.post("/", response_model=JobTicketResponse, status_code=status.HTTP_201_CREATED)
async def create_job_ticket(
    job_ticket: JobTicketCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new job ticket"""
    # Create new job ticket with data from request
    ticket_data = job_ticket.dict()
    
    # Only generate a ticket number if the status is 'submitted'
    # For drafts, we'll generate the ticket number when they're submitted
    if ticket_data.get("status") == "submitted":
        ticket_data["ticket_number"] = generate_ticket_number(db)
    
    db_job_ticket = JobTicket(
        **ticket_data,
        user_id=current_user.id
    )
    
    # Save job ticket to database
    db.add(db_job_ticket)
    db.commit()
    db.refresh(db_job_ticket)
    
    return db_job_ticket

@router.get("/", response_model=JobTicketList)
async def get_job_tickets(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all job tickets (filtered by user role)"""
    # Start with base query
    query = db.query(JobTicket)
    
    # Apply status filter if provided
    if status:
        query = query.filter(JobTicket.status == status)
    
    # Filter by user role
    if current_user.role == "tech":
        # Techs can only see their own tickets
        query = query.filter(JobTicket.user_id == current_user.id)
    # Managers and admins can see all tickets
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    job_tickets = query.offset(skip).limit(limit).all()
    
    return {"job_tickets": job_tickets, "total": total}

@router.get("/{job_ticket_id}", response_model=JobTicketResponse)
async def get_job_ticket(
    job_ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get job ticket by ID"""
    # Get job ticket
    job_ticket = db.query(JobTicket).filter(JobTicket.id == job_ticket_id).first()
    
    # Check if job ticket exists
    if not job_ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job ticket not found"
        )
    
    # Check if user has permission to view
    if current_user.role == "tech" and job_ticket.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return job_ticket

@router.put("/{job_ticket_id}", response_model=JobTicketResponse)
async def update_job_ticket(
    job_ticket_id: int,
    job_ticket_update: JobTicketUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update job ticket"""
    # Get job ticket
    db_job_ticket = db.query(JobTicket).filter(JobTicket.id == job_ticket_id).first()
    
    # Check if job ticket exists
    if not db_job_ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job ticket not found"
        )
    
    # Check if user has permission to update
    if current_user.role == "tech" and db_job_ticket.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Update job ticket
    update_data = job_ticket_update.dict(exclude_unset=True)
    
    # If status is changing from draft to submitted, generate a ticket number if it doesn't exist
    old_status = db_job_ticket.status
    new_status = update_data.get("status", old_status)
    
    if old_status == "draft" and new_status == "submitted" and not db_job_ticket.ticket_number:
        db_job_ticket.ticket_number = generate_ticket_number(db)
    
    # Apply updates
    for key, value in update_data.items():
        setattr(db_job_ticket, key, value)
    
    # Save changes
    db.commit()
    db.refresh(db_job_ticket)
    
    return db_job_ticket

@router.delete("/{job_ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job_ticket(
    job_ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete job ticket"""
    # Get job ticket
    db_job_ticket = db.query(JobTicket).filter(JobTicket.id == job_ticket_id).first()
    
    # Check if job ticket exists
    if not db_job_ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job ticket not found"
        )
    
    # Check if user has permission to delete
    if current_user.role == "tech" and db_job_ticket.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Delete job ticket
    db.delete(db_job_ticket)
    db.commit()
    
    return None
