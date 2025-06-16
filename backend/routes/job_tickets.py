from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from pydantic import ValidationError

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
    try:
        # Validate required fields
        if not job_ticket.submitted_by:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Customer signature (submitted by) is required"
            )
            
        # Check for work description
        if not job_ticket.description and not job_ticket.work_description:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Work description is required"
            )
        
        # Create new job ticket
        ticket_data = job_ticket.dict()
        
        # Set status explicitly to ensure it's submitted, not draft
        ticket_data["status"] = "submitted"
        
        # Generate a unique ticket number
        ticket_data["ticket_number"] = generate_ticket_number(db)
        
        # Create the job ticket object
        db_job_ticket = JobTicket(**ticket_data)
        
        # Save job ticket to database
        db.add(db_job_ticket)
        db.commit()
        db.refresh(db_job_ticket)
        
        return db_job_ticket
        
    except Exception as e:
        # Roll back transaction in case of error
        db.rollback()
        
        # Provide detailed error message
        if isinstance(e, HTTPException):
            raise e
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to submit job ticket: {str(e)}"
            )

@router.post("/", response_model=JobTicketResponse, status_code=status.HTTP_201_CREATED)
async def create_job_ticket(
    job_ticket: JobTicketCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new job ticket"""
    import traceback
    from datetime import datetime
    
    # COMPREHENSIVE LOGGING START
    timestamp = datetime.now().isoformat()
    print(f"\n{'='*80}")
    print(f"🎫 CREATE JOB TICKET DEBUG - TIMESTAMP: {timestamp}")
    print(f"{'='*80}")
    
    try:
        # 1. LOG USER CONTEXT
        print(f"👤 USER CONTEXT:")
        print(f"   - Email: {current_user.email}")
        print(f"   - ID: {current_user.id}")
        print(f"   - Company ID: {current_user.company_id}")
        print(f"   - Role: {getattr(current_user, 'role', 'Unknown')}")
        print(f"   - First Name: {getattr(current_user, 'first_name', 'Unknown')}")
        print(f"   - Last Name: {getattr(current_user, 'last_name', 'Unknown')}")
        
        # 2. LOG INCOMING REQUEST DATA
        print(f"\n📦 INCOMING REQUEST DATA:")
        ticket_data = job_ticket.dict()
        for key, value in ticket_data.items():
            print(f"   - {key}: {repr(value)} (type: {type(value).__name__})")
        
        # 3. VALIDATE USER COMPANY
        if not current_user.company_id:
            error_msg = f"User {current_user.email} has no company_id"
            print(f"❌ VALIDATION ERROR: {error_msg}")
            raise HTTPException(status_code=400, detail="User must be associated with a company")
        
        # 4. VALIDATE REQUIRED FIELDS
        print(f"\n🔍 SCHEMA VALIDATION:")
        required_fields = ['company_name']  # Add other required fields as needed
        missing_fields = []
        
        for field in required_fields:
            if field not in ticket_data or not ticket_data[field]:
                missing_fields.append(field)
                print(f"   ❌ Missing required field: {field}")
            else:
                print(f"   ✅ Required field present: {field} = {repr(ticket_data[field])}")
        
        if missing_fields:
            error_msg = f"Missing required fields: {missing_fields}"
            print(f"❌ VALIDATION ERROR: {error_msg}")
            raise HTTPException(status_code=422, detail=error_msg)
        
        # 5. GENERATE TICKET NUMBER IF NEEDED
        if ticket_data.get("status") == "submitted":
            ticket_number = generate_ticket_number(db)
            ticket_data["ticket_number"] = ticket_number
            print(f"🎫 Generated ticket number: {ticket_number}")
        else:
            print(f"🎫 Status is '{ticket_data.get('status')}', not generating ticket number yet")
        
        # 6. PREPARE FINAL DATA FOR DATABASE
        print(f"\n🗄️ PREPARING DATABASE OBJECT:")
        final_data = {
            **ticket_data,
            "user_id": current_user.id,
            "company_id": current_user.company_id
        }
        
        print(f"   Final data keys: {list(final_data.keys())}")
        for key, value in final_data.items():
            print(f"   - {key}: {repr(value)} (type: {type(value).__name__})")
        
        # 7. CREATE DATABASE OBJECT
        print(f"\n💾 CREATING JOBTICKET OBJECT:")
        db_job_ticket = JobTicket(**final_data)
        print(f"   ✅ JobTicket object created successfully")
        
        # 8. DATABASE OPERATIONS
        print(f"\n🗄️ DATABASE OPERATIONS:")
        print(f"   Adding to session...")
        db.add(db_job_ticket)
        print(f"   ✅ Added to database session")
        
        print(f"   Committing transaction...")
        db.commit()
        print(f"   ✅ Database commit successful")
        
        print(f"   Refreshing object...")
        db.refresh(db_job_ticket)
        print(f"   ✅ Database refresh successful")
        
        # 9. LOG FINAL RESULT
        print(f"\n🎉 SUCCESS:")
        print(f"   - Job Ticket ID: {db_job_ticket.id}")
        print(f"   - Ticket Number: {getattr(db_job_ticket, 'ticket_number', 'None')}")
        print(f"   - Company Name: {getattr(db_job_ticket, 'company_name', 'None')}")
        print(f"   - Status: {getattr(db_job_ticket, 'status', 'None')}")
        print(f"   - Created At: {getattr(db_job_ticket, 'created_at', 'None')}")
        
        print(f"{'='*80}")
        print(f"🎫 CREATE JOB TICKET SUCCESS - TIMESTAMP: {datetime.now().isoformat()}")
        print(f"{'='*80}\n")
        
        return db_job_ticket
        
    except ValidationError as e:
        print(f"\n❌ PYDANTIC VALIDATION ERROR:")
        print(f"   Error: {e}")
        print(f"   Error details: {e.errors()}")
        print(f"   Full traceback: {traceback.format_exc()}")
        print(f"{'='*80}\n")
        db.rollback()
        raise HTTPException(status_code=422, detail=f"Validation error: {e}")
        
    except IntegrityError as e:
        print(f"\n❌ DATABASE INTEGRITY ERROR:")
        print(f"   Error: {e}")
        print(f"   Full traceback: {traceback.format_exc()}")
        print(f"{'='*80}\n")
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Database constraint violation: {str(e)}")
        
    except HTTPException as e:
        print(f"\n❌ HTTP EXCEPTION:")
        print(f"   Status Code: {e.status_code}")
        print(f"   Detail: {e.detail}")
        print(f"   Full traceback: {traceback.format_exc()}")
        print(f"{'='*80}\n")
        db.rollback()
        raise e
        
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR:")
        print(f"   Error Type: {type(e).__name__}")
        print(f"   Error Message: {str(e)}")
        print(f"   Full traceback: {traceback.format_exc()}")
        print(f"{'='*80}\n")
        db.rollback()
        raise HTTPException(
            status_code=500, 
            detail=f"Internal server error: {type(e).__name__}: {str(e)}"
        )

@router.get("/", response_model=JobTicketList)
async def get_job_tickets(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all job tickets (filtered by user role)"""
    from datetime import datetime
    
    print(f"\n{'='*80}")
    print(f"🔍 GET JOB TICKETS REQUEST - TIMESTAMP: {datetime.now().isoformat()}")
    print(f"{'='*80}")
    
    # Log user context
    print(f"\n👤 USER CONTEXT:")
    print(f"   - User ID: {current_user.id}")
    print(f"   - User Email: {current_user.email}")
    print(f"   - User Role: {current_user.role}")
    print(f"   - Company ID: {current_user.company_id}")
    
    # Log request parameters
    print(f"\n📋 REQUEST PARAMETERS:")
    print(f"   - Skip: {skip}")
    print(f"   - Limit: {limit}")
    print(f"   - Status Filter: {status}")
    
    # Start with base query and join with User table to get submitted_by_name
    query = db.query(JobTicket).outerjoin(User, JobTicket.user_id == User.id)
    print(f"\n🗄️ BUILDING QUERY:")
    print(f"   - Base query created with User join")
    
    # Apply company-level filtering for multi-tenancy
    if current_user.company_id:
        query = query.filter(JobTicket.company_id == current_user.company_id)
        print(f"   - Added company filter: company_id = {current_user.company_id}")
    else:
        print(f"   - ⚠️ No company_id found for user")
    
    # Apply status filter if provided
    if status:
        query = query.filter(JobTicket.status == status)
        print(f"   - Added status filter: status = {status}")
    
    # Filter by user role
    if current_user.role == "tech":
        # Techs can only see their own tickets
        query = query.filter(JobTicket.user_id == current_user.id)
        print(f"   - Added tech filter: user_id = {current_user.id}")
    # Managers and admins can see all tickets from their company
    
    # Get total count
    total = query.count()
    print(f"\n📊 QUERY RESULTS:")
    print(f"   - Total matching tickets: {total}")
    
    # Apply pagination
    job_tickets = query.offset(skip).limit(limit).all()
    print(f"   - Tickets after pagination: {len(job_tickets)}")
    
    # Log each ticket found
    print(f"\n🎫 TICKETS FOUND:")
    for i, ticket in enumerate(job_tickets):
        print(f"   [{i+1}] ID: {ticket.id}, Number: {getattr(ticket, 'ticket_number', 'None')}, Company: {getattr(ticket, 'company_name', 'None')}, Status: {getattr(ticket, 'status', 'None')}")
    
    if not job_tickets:
        print(f"   ❌ No tickets found!")
        
        # Debug: Check if there are ANY tickets in the database
        all_tickets = db.query(JobTicket).all()
        print(f"\n🔍 DEBUG - ALL TICKETS IN DATABASE:")
        print(f"   - Total tickets in DB: {len(all_tickets)}")
        for i, ticket in enumerate(all_tickets):
            print(f"   [{i+1}] ID: {ticket.id}, Company ID: {getattr(ticket, 'company_id', 'None')}, User ID: {getattr(ticket, 'user_id', 'None')}, Status: {getattr(ticket, 'status', 'None')}")
    
    # Add submitted_by_name to each ticket
    enriched_tickets = []
    for ticket in job_tickets:
        # Convert to dict to add the submitted_by_name field
        ticket_dict = {
            "id": ticket.id,
            "user_id": ticket.user_id,
            "company_id": ticket.company_id,
            "job_number": ticket.job_number,
            "ticket_number": ticket.ticket_number,
            "company_name": ticket.company_name,
            "customer_name": ticket.customer_name,
            "location": ticket.location,
            "work_type": ticket.work_type,
            "equipment": ticket.equipment,
            "work_start_time": ticket.work_start_time,
            "work_end_time": ticket.work_end_time,
            "work_total_hours": ticket.work_total_hours,
            "drive_start_time": ticket.drive_start_time,
            "drive_end_time": ticket.drive_end_time,
            "drive_total_hours": ticket.drive_total_hours,
            "travel_type": ticket.travel_type,
            "parts_used": ticket.parts_used,
            "work_description": ticket.work_description,
            "submitted_by": ticket.submitted_by,
            "submitted_by_name": ticket.user.name if ticket.user else None,
            "status": ticket.status,
            "created_at": ticket.created_at,
            "updated_at": ticket.updated_at
        }
        enriched_tickets.append(ticket_dict)
    
    print(f"\n✅ RETURNING RESPONSE:")
    print(f"   - Total: {total}")
    print(f"   - Items: {len(enriched_tickets)}")
    print(f"{'='*80}\n")
    
    return {"job_tickets": enriched_tickets, "total": total}

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
