from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
import enum
import json
from database import Base
from core.encryption import encrypt_field, decrypt_field

class InvoiceStatus(str, enum.Enum):
    """Invoice status enum"""
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"

class Invoice(Base):
    """Invoice model with field-level encryption for sensitive data"""
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_ticket_id = Column(Integer, ForeignKey("job_tickets.id"), nullable=False)
    
    # Encrypted fields
    _encrypted_amount = Column("amount", String, nullable=False)
    _encrypted_line_items = Column("line_items", String)  # Encrypted JSON string of line items
    
    # Regular fields
    status = Column(String, default=InvoiceStatus.DRAFT, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Property for amount field
    @property
    def amount(self):
        """Decrypt the amount field when accessed"""
        if self._encrypted_amount is None:
            return None
        return float(decrypt_field(self._encrypted_amount))
    
    @amount.setter
    def amount(self, value):
        """Encrypt the amount field when set"""
        if value is None:
            raise ValueError("Amount cannot be None")
        self._encrypted_amount = encrypt_field(str(value))
    
    # Property for line_items field
    @property
    def line_items(self):
        """Decrypt the line_items field when accessed"""
        if self._encrypted_line_items is None:
            return None
        return json.loads(decrypt_field(self._encrypted_line_items))
    
    @line_items.setter
    def line_items(self, value):
        """Encrypt the line_items field when set"""
        if value is None:
            self._encrypted_line_items = None
        else:
            self._encrypted_line_items = encrypt_field(json.dumps(value))
    
    def __repr__(self):
        return f"<Invoice {self.id}>"
