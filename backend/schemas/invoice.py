from typing import Optional, List, Dict, Any
from pydantic import BaseModel, field_validator
from datetime import datetime
import json
from models.invoice import InvoiceStatus

class LineItem(BaseModel):
    """Line item schema for invoices"""
    description: str
    rate: float
    quantity: float
    cost: float

class InvoiceBase(BaseModel):
    """Base invoice schema"""
    invoice_number: str
    invoice_date: datetime
    customer_name: str
    company_name: str
    subtotal: float
    service_fee: float = 0.0
    tax: float = 0.0
    total_amount: float
    line_items: List[LineItem] = []
    job_ticket_ids: List[int] = []
    status: Optional[str] = InvoiceStatus.DRAFT.value
    created_by: str
    
    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        """Validate status is one of the allowed values"""
        if v not in [status.value for status in InvoiceStatus]:
            raise ValueError(f"Status must be one of: {', '.join([status.value for status in InvoiceStatus])}")
        return v
    
    @field_validator('subtotal', 'service_fee', 'tax', 'total_amount')
    @classmethod
    def validate_amounts(cls, v):
        """Validate amounts are non-negative"""
        if v < 0:
            raise ValueError("Amounts must be non-negative")
        return v
    
    @field_validator('line_items')
    @classmethod
    def validate_line_items(cls, v):
        """Validate line items have positive quantities and rates"""
        for item in v:
            if item.quantity <= 0:
                raise ValueError("Line item quantity must be positive")
            if item.rate < 0:
                raise ValueError("Line item rate must be non-negative")
        return v

class InvoiceCreate(InvoiceBase):
    """Invoice creation schema"""
    pass

class InvoiceUpdate(BaseModel):
    """Invoice update schema"""
    invoice_number: Optional[str] = None
    invoice_date: Optional[datetime] = None
    customer_name: Optional[str] = None
    company_name: Optional[str] = None
    subtotal: Optional[float] = None
    service_fee: Optional[float] = None
    tax: Optional[float] = None
    total_amount: Optional[float] = None
    line_items: Optional[List[LineItem]] = None
    job_ticket_ids: Optional[List[int]] = None
    status: Optional[str] = None
    created_by: Optional[str] = None
    
    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        """Validate status is one of the allowed values"""
        if v is not None and v not in [status.value for status in InvoiceStatus]:
            raise ValueError(f"Status must be one of: {', '.join([status.value for status in InvoiceStatus])}")
        return v

class InvoiceResponse(BaseModel):
    """Invoice response schema"""
    id: int
    user_id: int
    invoice_number: str
    invoice_date: datetime
    customer_name: str
    company_name: str
    subtotal: float
    service_fee: float
    tax: float
    total_amount: float
    line_items: List[Dict[str, Any]]
    job_ticket_ids: List[int]
    status: str
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = {
        "from_attributes": True
    }

class InvoiceList(BaseModel):
    """Invoice list response schema"""
    invoices: List[InvoiceResponse]
    total: int
    skip: int
    limit: int
