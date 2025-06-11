from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from database import Base
from core.encryption import encrypt_field, decrypt_field

class JobTicketStatus(str, enum.Enum):
    """Job ticket status enum"""
    DRAFT = "draft"
    SUBMITTED = "submitted"
    COMPLETE = "complete"

class JobTicket(Base):
    """Job ticket model with field-level encryption for sensitive data and multi-tenancy support"""
    __tablename__ = "job_tickets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    job_number = Column(String, index=True)
    ticket_number = Column(String(8), index=True, unique=True)
    customer_name = Column(String)
    
    # Add a unique constraint to ensure ticket_number is unique
    __table_args__ = (UniqueConstraint('ticket_number', name='uix_ticket_number'),)
    
    # Encrypted fields
    _encrypted_location = Column("location", String)
    _encrypted_work_description = Column("work_description", String)
    
    # Regular fields
    work_type = Column(String)
    equipment = Column(String)
    work_start_time = Column(String)
    work_end_time = Column(String)
    work_total_hours = Column(Float)
    drive_start_time = Column(String)
    drive_end_time = Column(String)
    drive_total_hours = Column(Float)
    travel_type = Column(String)  # "one_way" or "round_trip"
    parts_used = Column(String)  # JSON string of parts
    submitted_by = Column(String)
    status = Column(String, default=JobTicketStatus.DRAFT, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    company = relationship("Company", back_populates="job_tickets")
    user = relationship("User")
    
    # Property for location field
    @property
    def location(self):
        """Decrypt the location field when accessed"""
        if self._encrypted_location is None:
            return None
        return decrypt_field(self._encrypted_location)
    
    @location.setter
    def location(self, value):
        """Encrypt the location field when set"""
        if value is None:
            self._encrypted_location = None
        else:
            self._encrypted_location = encrypt_field(value)
    
    # Property for work_description field
    @property
    def work_description(self):
        """Decrypt the work_description field when accessed"""
        if self._encrypted_work_description is None:
            return None
        return decrypt_field(self._encrypted_work_description)
    
    @work_description.setter
    def work_description(self, value):
        """Encrypt the work_description field when set"""
        if value is None:
            self._encrypted_work_description = None
        else:
            self._encrypted_work_description = encrypt_field(value)
    
    def __repr__(self):
        return f"<JobTicket {self.id}>"
