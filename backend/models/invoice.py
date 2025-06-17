from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
import json
from database import Base
from core.encryption import encrypt_field, decrypt_field

class InvoiceStatus(str, enum.Enum):
    """Invoice status enum"""
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"
    CANCELLED = "cancelled"

class Invoice(Base):
    """Invoice model with field-level encryption for sensitive data"""
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Invoice identification
    invoice_number = Column(String(50), nullable=False, unique=True, index=True)
    invoice_date = Column(DateTime(timezone=True), nullable=False)
    
    # Customer information (encrypted)
    _encrypted_customer_name = Column("customer_name", String, nullable=False)
    
    # Financial data (encrypted)
    _encrypted_subtotal = Column("subtotal", String, nullable=False)
    _encrypted_service_fee = Column("service_fee", String, nullable=False, default="0.0")
    _encrypted_tax = Column("tax", String, nullable=False, default="0.0")
    _encrypted_total_amount = Column("total_amount", String, nullable=False)
    
    # Line items and job tickets (encrypted JSON)
    _encrypted_line_items = Column("line_items", Text)  # Encrypted JSON string of line items
    _encrypted_job_ticket_ids = Column("job_ticket_ids", String)  # Encrypted JSON array of job ticket IDs
    
    # Company information (encrypted)
    _encrypted_company_name = Column("company_name", String, nullable=False)
    
    # Regular fields
    status = Column(String, default=InvoiceStatus.DRAFT.value, nullable=False)
    created_by = Column(String(100), nullable=False)  # User who created the invoice
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="invoices")
    
    # Property for customer_name field
    @property
    def customer_name(self):
        """Decrypt the customer_name field when accessed"""
        if self._encrypted_customer_name is None:
            return None
        return decrypt_field(self._encrypted_customer_name)
    
    @customer_name.setter
    def customer_name(self, value):
        """Encrypt the customer_name field when set"""
        if value is None:
            raise ValueError("Customer name cannot be None")
        self._encrypted_customer_name = encrypt_field(str(value))
    
    # Property for company_name field
    @property
    def company_name(self):
        """Decrypt the company_name field when accessed"""
        if self._encrypted_company_name is None:
            return None
        return decrypt_field(self._encrypted_company_name)
    
    @company_name.setter
    def company_name(self, value):
        """Encrypt the company_name field when set"""
        if value is None:
            raise ValueError("Company name cannot be None")
        self._encrypted_company_name = encrypt_field(str(value))
    
    # Property for subtotal field
    @property
    def subtotal(self):
        """Decrypt the subtotal field when accessed"""
        if self._encrypted_subtotal is None:
            return None
        return float(decrypt_field(self._encrypted_subtotal))
    
    @subtotal.setter
    def subtotal(self, value):
        """Encrypt the subtotal field when set"""
        if value is None:
            raise ValueError("Subtotal cannot be None")
        self._encrypted_subtotal = encrypt_field(str(value))
    
    # Property for service_fee field
    @property
    def service_fee(self):
        """Decrypt the service_fee field when accessed"""
        if self._encrypted_service_fee is None:
            return 0.0
        return float(decrypt_field(self._encrypted_service_fee))
    
    @service_fee.setter
    def service_fee(self, value):
        """Encrypt the service_fee field when set"""
        self._encrypted_service_fee = encrypt_field(str(value or 0.0))
    
    # Property for tax field
    @property
    def tax(self):
        """Decrypt the tax field when accessed"""
        if self._encrypted_tax is None:
            return 0.0
        return float(decrypt_field(self._encrypted_tax))
    
    @tax.setter
    def tax(self, value):
        """Encrypt the tax field when set"""
        self._encrypted_tax = encrypt_field(str(value or 0.0))
    
    # Property for total_amount field
    @property
    def total_amount(self):
        """Decrypt the total_amount field when accessed"""
        if self._encrypted_total_amount is None:
            return None
        return float(decrypt_field(self._encrypted_total_amount))
    
    @total_amount.setter
    def total_amount(self, value):
        """Encrypt the total_amount field when set"""
        if value is None:
            raise ValueError("Total amount cannot be None")
        self._encrypted_total_amount = encrypt_field(str(value))
    
    # Property for line_items field
    @property
    def line_items(self):
        """Decrypt the line_items field when accessed"""
        if self._encrypted_line_items is None:
            return []
        return json.loads(decrypt_field(self._encrypted_line_items))
    
    @line_items.setter
    def line_items(self, value):
        """Encrypt the line_items field when set"""
        if value is None:
            self._encrypted_line_items = None
        else:
            self._encrypted_line_items = encrypt_field(json.dumps(value))
    
    # Property for job_ticket_ids field
    @property
    def job_ticket_ids(self):
        """Decrypt the job_ticket_ids field when accessed"""
        if self._encrypted_job_ticket_ids is None:
            return []
        return json.loads(decrypt_field(self._encrypted_job_ticket_ids))
    
    @job_ticket_ids.setter
    def job_ticket_ids(self, value):
        """Encrypt the job_ticket_ids field when set"""
        if value is None:
            self._encrypted_job_ticket_ids = None
        else:
            self._encrypted_job_ticket_ids = encrypt_field(json.dumps(value))
    
    def __repr__(self):
        return f"<Invoice {self.invoice_number}>"
