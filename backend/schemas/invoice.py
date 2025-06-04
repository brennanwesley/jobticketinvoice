from typing import Optional, List
from pydantic import BaseModel, field_validator
from datetime import datetime
import json
from models.invoice import InvoiceStatus

class InvoiceBase(BaseModel):
    """Base invoice schema"""
    job_ticket_id: int
    amount: float
    status: Optional[str] = InvoiceStatus.DRAFT
    line_items: Optional[str] = None
    
    @field_validator('status')
    def validate_status(cls, v):
        """Validate status is one of the allowed values"""
        if v not in [status.value for status in InvoiceStatus]:
            raise ValueError(f"Status must be one of: {', '.join([status.value for status in InvoiceStatus])}")
        return v
    
    @field_validator('line_items')
    def validate_line_items(cls, v):
        """Validate line_items is valid JSON if provided"""
        if v:
            try:
                json.loads(v)
            except json.JSONDecodeError:
                raise ValueError("Line items must be valid JSON")
        return v

class InvoiceCreate(InvoiceBase):
    """Invoice creation schema"""
    pass

class InvoiceUpdate(InvoiceBase):
    """Invoice update schema"""
    job_ticket_id: Optional[int] = None
    amount: Optional[float] = None

class InvoiceResponse(InvoiceBase):
    """Invoice response schema"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = {
        "from_attributes": True
    }

class InvoiceList(BaseModel):
    """Invoice list schema"""
    invoices: List[InvoiceResponse]
    total: int
