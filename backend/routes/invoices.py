from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.invoice import Invoice
from schemas.invoice import InvoiceCreate, InvoiceUpdate, InvoiceResponse, InvoiceList
from utils.jwt import get_current_user, get_manager_or_admin_user

router = APIRouter(
    prefix="/invoices",
    tags=["Invoices"],
)

@router.post("/", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    invoice: InvoiceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new invoice"""
    # Create new invoice
    db_invoice = Invoice(
        **invoice.dict(),
        user_id=current_user.id
    )
    
    # Save invoice to database
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    
    return db_invoice

@router.get("/", response_model=InvoiceList)
async def get_invoices(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all invoices (filtered by user role)"""
    # Start with base query
    query = db.query(Invoice)
    
    # Apply status filter if provided
    if status:
        query = query.filter(Invoice.status == status)
    
    # Filter by user role
    if current_user.role == "tech":
        # Techs can only see their own invoices
        query = query.filter(Invoice.user_id == current_user.id)
    # Managers and admins can see all invoices
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    invoices = query.offset(skip).limit(limit).all()
    
    return {"invoices": invoices, "total": total}

@router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(
    invoice_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get invoice by ID"""
    # Get invoice
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    
    # Check if invoice exists
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Check if user has permission to view
    if current_user.role == "tech" and invoice.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return invoice

@router.put("/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: int,
    invoice_update: InvoiceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update invoice"""
    # Get invoice
    db_invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    
    # Check if invoice exists
    if not db_invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Check if user has permission to update
    if current_user.role == "tech" and db_invoice.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Update invoice
    update_data = invoice_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_invoice, key, value)
    
    # Save changes
    db.commit()
    db.refresh(db_invoice)
    
    return db_invoice

@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_invoice(
    invoice_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete invoice"""
    # Get invoice
    db_invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    
    # Check if invoice exists
    if not db_invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Check if user has permission to delete
    if current_user.role == "tech" and db_invoice.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Delete invoice
    db.delete(db_invoice)
    db.commit()
    
    return None
