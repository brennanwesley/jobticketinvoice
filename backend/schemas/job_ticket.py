from typing import Optional, List
from pydantic import BaseModel, field_validator
from datetime import datetime
import json
from models.job_ticket import JobTicketStatus

class JobTicketBase(BaseModel):
    """Base job ticket schema"""
    job_number: Optional[str] = None
    company_name: str
    customer_name: Optional[str] = None
    location: Optional[str] = None
    work_type: Optional[str] = None
    equipment: Optional[str] = None
    work_start_time: Optional[str] = None
    work_end_time: Optional[str] = None
    work_total_hours: Optional[float] = None
    drive_start_time: Optional[str] = None
    drive_end_time: Optional[str] = None
    drive_total_hours: Optional[float] = None
    travel_type: Optional[str] = None
    parts_used: Optional[str] = None
    work_description: Optional[str] = None
    submitted_by: Optional[str] = None
    status: Optional[str] = JobTicketStatus.DRAFT

    @field_validator('status')
    def validate_status(cls, v):
        """Validate status is one of the allowed values"""
        if v not in [status.value for status in JobTicketStatus]:
            raise ValueError(f"Status must be one of: {', '.join([status.value for status in JobTicketStatus])}")
        return v
    
    @field_validator('parts_used')
    def validate_parts_used(cls, v):
        """Validate parts_used is valid JSON if provided"""
        if v:
            try:
                json.loads(v)
            except json.JSONDecodeError:
                raise ValueError("Parts used must be valid JSON")
        return v

class JobTicketCreate(JobTicketBase):
    """Job ticket creation schema"""
    pass

class JobTicketUpdate(JobTicketBase):
    """Job ticket update schema"""
    pass

class JobTicketResponse(JobTicketBase):
    """Job ticket response schema"""
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = {
        "from_attributes": True
    }

class JobTicketSubmit(JobTicketBase):
    """Job ticket submission schema (no authentication required)"""
    # Override company_name to be optional for field technicians
    company_name: Optional[str] = None
    # Make description required for submitted tickets
    description: str
    # Make submitted_by required
    submitted_by: str
    # Rename drive fields to travel fields
    travel_start_time: Optional[str] = None
    travel_end_time: Optional[str] = None
    travel_total_hours: Optional[float] = None
    
    model_config = {
        "from_attributes": True
    }
    
    # Map travel fields to drive fields in the model
    def dict(self, *args, **kwargs):
        data = super().dict(*args, **kwargs)
        # Map travel fields to drive fields
        if 'travel_start_time' in data:
            data['drive_start_time'] = data.pop('travel_start_time')
        if 'travel_end_time' in data:
            data['drive_end_time'] = data.pop('travel_end_time')
        if 'travel_total_hours' in data:
            data['drive_total_hours'] = data.pop('travel_total_hours')
        if 'description' in data:
            data['work_description'] = data.pop('description')
        return data

class JobTicketList(BaseModel):
    """Job ticket list schema"""
    job_tickets: List[JobTicketResponse]
    total: int
