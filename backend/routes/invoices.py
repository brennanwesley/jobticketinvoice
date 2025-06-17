from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
import json
from datetime import datetime

from database import get_db
from models.invoice import Invoice
from schemas.invoice import InvoiceCreate, InvoiceUpdate, InvoiceResponse, InvoiceList
from utils.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/invoices", tags=["invoices"])

@router.post("/", response_model=InvoiceResponse)
async def create_invoice(
    invoice_data: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new invoice"""
    try:
        # Convert line_items to JSON string for storage
        line_items_json = json.dumps([item.model_dump() for item in invoice_data.line_items])
        
        # Convert job_ticket_ids to JSON string for storage
        job_ticket_ids_json = json.dumps(invoice_data.job_ticket_ids)
        
        # Create invoice instance
        invoice = Invoice(
            user_id=current_user.id,
            invoice_number=invoice_data.invoice_number,
            invoice_date=invoice_data.invoice_date,
            customer_name=invoice_data.customer_name,
            company_name=invoice_data.company_name,
            subtotal=invoice_data.subtotal,
            service_fee=invoice_data.service_fee,
            tax=invoice_data.tax,
            total_amount=invoice_data.total_amount,
            line_items=line_items_json,
            job_ticket_ids=job_ticket_ids_json,
            status=invoice_data.status,
            created_by=invoice_data.created_by,
            created_at=datetime.utcnow()
        )
        
        db.add(invoice)
        db.commit()
        db.refresh(invoice)
        
        return invoice
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create invoice: {str(e)}"
        )

@router.get("/", response_model=InvoiceList)
async def get_invoices(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all invoices for the current user's company"""
    try:
        # Get invoices for the current user (multi-tenancy)
        invoices_query = db.query(Invoice).filter(Invoice.user_id == current_user.id)
        
        # Get total count
        total = invoices_query.count()
        
        # Get paginated results
        invoices = invoices_query.offset(skip).limit(limit).all()
        
        return InvoiceList(
            invoices=invoices,
            total=total,
            skip=skip,
            limit=limit
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch invoices: {str(e)}"
        )

@router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific invoice by ID"""
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.user_id == current_user.id  # Multi-tenancy
    ).first()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    return invoice

@router.put("/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: int,
    invoice_data: InvoiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an existing invoice"""
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.user_id == current_user.id  # Multi-tenancy
    ).first()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    try:
        # Update fields that are provided
        update_data = invoice_data.model_dump(exclude_unset=True)
        
        # Handle line_items conversion to JSON if provided
        if 'line_items' in update_data and update_data['line_items'] is not None:
            update_data['line_items'] = json.dumps([item.model_dump() for item in update_data['line_items']])
        
        # Handle job_ticket_ids conversion to JSON if provided
        if 'job_ticket_ids' in update_data and update_data['job_ticket_ids'] is not None:
            update_data['job_ticket_ids'] = json.dumps(update_data['job_ticket_ids'])
        
        # Update the invoice
        for field, value in update_data.items():
            setattr(invoice, field, value)
        
        invoice.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(invoice)
        
        return invoice
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update invoice: {str(e)}"
        )

@router.delete("/{invoice_id}")
async def delete_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an invoice"""
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.user_id == current_user.id  # Multi-tenancy
    ).first()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    try:
        db.delete(invoice)
        db.commit()
        
        return {"message": "Invoice deleted successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete invoice: {str(e)}"
        )

@router.get("/check-duplicate/{invoice_number}")
async def check_duplicate_invoice_number(
    invoice_number: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if an invoice number already exists for the current user"""
    existing_invoice = db.query(Invoice).filter(
        Invoice.invoice_number == invoice_number,
        Invoice.user_id == current_user.id  # Multi-tenancy
    ).first()
    
    return {"isDuplicate": existing_invoice is not None}
