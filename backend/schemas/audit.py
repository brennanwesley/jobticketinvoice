"""
Audit log schemas for API request/response validation
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID

class AuditLogCreate(BaseModel):
    """Schema for creating audit log entries"""
    action: str = Field(..., description="Action performed", max_length=100)
    category: str = Field(..., description="Category of action", max_length=50)
    description: Optional[str] = Field(None, description="Human-readable description")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional structured data")
    target_id: Optional[str] = Field(None, description="ID of target entity", max_length=100)
    target_type: Optional[str] = Field(None, description="Type of target entity", max_length=50)
    ip_address: Optional[str] = Field(None, description="Client IP address", max_length=45)
    user_agent: Optional[str] = Field(None, description="Client user agent")

    class Config:
        json_schema_extra = {
            "example": {
                "action": "technician_invited",
                "category": "technician",
                "description": "Invited new technician to company",
                "details": {
                    "technician_email": "john@example.com",
                    "technician_name": "John Doe",
                    "job_type": "pump_tech"
                },
                "target_id": "123",
                "target_type": "technician_invitation",
                "ip_address": "192.168.1.100",
                "user_agent": "Mozilla/5.0..."
            }
        }

class AuditLogResponse(BaseModel):
    """Schema for audit log responses"""
    id: int
    user_id: Optional[int]
    user_name: Optional[str] = Field(None, description="Full name of user who performed action")
    user_email: Optional[str] = Field(None, description="Email of user who performed action")
    company_id: UUID
    action: str
    category: str
    description: Optional[str]
    details: Optional[Dict[str, Any]]
    target_id: Optional[str]
    target_type: Optional[str]
    ip_address: Optional[str]
    user_agent: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 123,
                "user_name": "Jane Manager",
                "user_email": "jane@company.com",
                "company_id": "550e8400-e29b-41d4-a716-446655440000",
                "action": "technician_invited",
                "category": "technician",
                "description": "Invited new technician to company",
                "details": {
                    "technician_email": "john@example.com",
                    "technician_name": "John Doe",
                    "job_type": "pump_tech"
                },
                "target_id": "123",
                "target_type": "technician_invitation",
                "ip_address": "192.168.1.100",
                "user_agent": "Mozilla/5.0...",
                "timestamp": "2024-01-15T10:30:00Z"
            }
        }

class AuditLogListResponse(BaseModel):
    """Schema for paginated audit log list responses"""
    logs: List[AuditLogResponse]
    total: int = Field(..., description="Total number of logs matching filters")
    page: int = Field(..., description="Current page number")
    limit: int = Field(..., description="Number of logs per page")
    total_pages: int = Field(..., description="Total number of pages")

    class Config:
        json_schema_extra = {
            "example": {
                "logs": [
                    {
                        "id": 1,
                        "user_id": 123,
                        "user_name": "Jane Manager",
                        "user_email": "jane@company.com",
                        "company_id": "550e8400-e29b-41d4-a716-446655440000",
                        "action": "technician_invited",
                        "category": "technician",
                        "description": "Invited new technician to company",
                        "details": {"technician_email": "john@example.com"},
                        "target_id": "123",
                        "target_type": "technician_invitation",
                        "ip_address": "192.168.1.100",
                        "user_agent": "Mozilla/5.0...",
                        "timestamp": "2024-01-15T10:30:00Z"
                    }
                ],
                "total": 150,
                "page": 1,
                "limit": 50,
                "total_pages": 3
            }
        }

class AuditLogExportResponse(BaseModel):
    """Schema for audit log export responses"""
    success: bool
    csv: str = Field(..., description="CSV content as string")
    filename: str = Field(..., description="Suggested filename for download")
    total_records: int = Field(..., description="Number of records exported")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "csv": "Timestamp,Category,Action,User Name,User Email,Description...\n2024-01-15T10:30:00Z,technician,technician_invited,Jane Manager,jane@company.com,Invited new technician...",
                "filename": "audit-logs-20240115-103000.csv",
                "total_records": 150
            }
        }

class AuditLogStats(BaseModel):
    """Schema for audit log statistics"""
    timeframe: str = Field(..., description="Timeframe for statistics")
    total_events: int = Field(..., description="Total number of events in timeframe")
    security_events: int = Field(..., description="Number of security events")
    category_breakdown: Dict[str, int] = Field(..., description="Event count by category")
    top_users: List[Dict[str, Any]] = Field(..., description="Most active users")
    period_start: str = Field(..., description="Start of period (ISO format)")
    period_end: str = Field(..., description="End of period (ISO format)")

    class Config:
        json_schema_extra = {
            "example": {
                "timeframe": "30d",
                "total_events": 1250,
                "security_events": 45,
                "category_breakdown": {
                    "technician": 450,
                    "company": 200,
                    "security": 45,
                    "system": 555
                },
                "top_users": [
                    {
                        "name": "Jane Manager",
                        "email": "jane@company.com",
                        "event_count": 125
                    }
                ],
                "period_start": "2024-01-01T00:00:00Z",
                "period_end": "2024-01-31T23:59:59Z"
            }
        }

# Audit categories enum for consistency
class AuditCategory:
    SECURITY = "security"
    USER = "user"
    COMPANY = "company"
    TECHNICIAN = "technician"
    SYSTEM = "system"
    JOB_TICKET = "job_ticket"
    INVOICE = "invoice"
    
    @classmethod
    def all(cls):
        return [
            cls.SECURITY,
            cls.USER,
            cls.COMPANY,
            cls.TECHNICIAN,
            cls.SYSTEM,
            cls.JOB_TICKET,
            cls.INVOICE
        ]

# Common audit actions for consistency
class AuditAction:
    # User actions
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    USER_LOGIN_FAILED = "user_login_failed"
    USER_CREATED = "user_created"
    USER_UPDATED = "user_updated"
    USER_DEACTIVATED = "user_deactivated"
    USER_ACTIVATED = "user_activated"
    PASSWORD_CHANGED = "password_changed"
    PASSWORD_RESET = "password_reset"
    
    # Technician actions
    TECHNICIAN_INVITED = "technician_invited"
    TECHNICIAN_INVITATION_ACCEPTED = "technician_invitation_accepted"
    TECHNICIAN_INVITATION_CANCELLED = "technician_invitation_cancelled"
    TECHNICIAN_ACTIVATED = "technician_activated"
    TECHNICIAN_DEACTIVATED = "technician_deactivated"
    TECHNICIAN_REMOVED = "technician_removed"
    TECHNICIAN_REINVITED = "technician_reinvited"
    
    # Company actions
    COMPANY_CREATED = "company_created"
    COMPANY_UPDATED = "company_updated"
    COMPANY_LOGO_UPLOADED = "company_logo_uploaded"
    COMPANY_LOGO_REMOVED = "company_logo_removed"
    
    # Security actions
    UNAUTHORIZED_ACCESS_ATTEMPT = "unauthorized_access_attempt"
    PERMISSION_DENIED = "permission_denied"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    ACCOUNT_LOCKED = "account_locked"
    ACCOUNT_UNLOCKED = "account_unlocked"
    
    # System actions
    SYSTEM_ERROR = "system_error"
    SYSTEM_WARNING = "system_warning"
    SYSTEM_INFO = "system_info"
    DATA_EXPORT = "data_export"
    DATA_IMPORT = "data_import"
    
    # Job ticket actions
    JOB_TICKET_CREATED = "job_ticket_created"
    JOB_TICKET_UPDATED = "job_ticket_updated"
    JOB_TICKET_DELETED = "job_ticket_deleted"
    JOB_TICKET_SUBMITTED = "job_ticket_submitted"
    
    # Invoice actions
    INVOICE_CREATED = "invoice_created"
    INVOICE_UPDATED = "invoice_updated"
    INVOICE_SENT = "invoice_sent"
    INVOICE_PAID = "invoice_paid"
