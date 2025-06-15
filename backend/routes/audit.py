"""
Audit logging routes for tracking system events and user actions
Provides endpoints for logging, retrieving, and exporting audit logs
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
import csv
import io
from datetime import datetime, timedelta

from database import get_db
from core.security import get_current_user, require_role
from models.user import User, UserRole
from models.audit_log import AuditLog
from schemas.audit import (
    AuditLogCreate,
    AuditLogResponse,
    AuditLogListResponse,
    AuditLogExportResponse
)

router = APIRouter(prefix="/audit", tags=["audit"])

@router.post("/log", response_model=dict)
async def log_audit_event(
    audit_data: AuditLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Log an audit event
    """
    try:
        # Debug logging
        print(f"Audit log attempt - User ID: {current_user.id}, Company ID: {current_user.company_id}")
        print(f"Audit data: {audit_data.dict()}")
        
        # Create audit log entry with explicit field mapping
        audit_log = AuditLog(
            user_id=current_user.id,
            company_id=current_user.company_id,
            action=audit_data.action,
            category=audit_data.category,
            description=audit_data.description or f"{audit_data.action} - {audit_data.category}",
            details=audit_data.details or {},
            target_id=audit_data.target_id,
            target_type=audit_data.target_type,
            ip_address=audit_data.ip_address,
            user_agent=audit_data.user_agent,
            timestamp=datetime.utcnow()
        )
        
        print(f"Created audit log object: {audit_log.__dict__}")
        
        db.add(audit_log)
        db.commit()
        
        print("Audit log committed successfully")
        return {"success": True, "message": "Audit event logged successfully"}
        
    except Exception as e:
        db.rollback()
        print(f"Audit logging error: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to log audit event: {str(e)}")

@router.get("/logs", response_model=AuditLogListResponse)
async def get_audit_logs(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=100, description="Number of records per page"),
    category: Optional[str] = Query(None, description="Filter by category"),
    action: Optional[str] = Query(None, description="Filter by action"),
    user: Optional[str] = Query(None, description="Filter by user name or email"),
    date_from: Optional[str] = Query(None, description="Filter from date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Filter to date (YYYY-MM-DD)"),
    search: Optional[str] = Query(None, description="Search in description and details"),
    sort_by: str = Query("timestamp", description="Sort field"),
    sort_order: str = Query("desc", description="Sort order (asc/desc)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.MANAGER, UserRole.ADMIN]))
):
    """
    Get audit logs with filtering and pagination
    Only managers and admins can access audit logs
    """
    try:
        # Build query with company filtering for multi-tenancy
        query = db.query(AuditLog).filter(AuditLog.company_id == current_user.company_id)
        
        # Apply filters
        if category:
            query = query.filter(AuditLog.category == category)
        
        if action:
            query = query.filter(AuditLog.action == action)
        
        if user:
            # Join with User table to filter by user name or email
            query = query.join(User, AuditLog.user_id == User.id)
            query = query.filter(
                (User.name.ilike(f"%{user}%")) |
                (User.email.ilike(f"%{user}%"))
            )
        
        if date_from:
            try:
                from_date = datetime.strptime(date_from, "%Y-%m-%d")
                query = query.filter(AuditLog.timestamp >= from_date)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date_from format. Use YYYY-MM-DD")
        
        if date_to:
            try:
                to_date = datetime.strptime(date_to, "%Y-%m-%d") + timedelta(days=1)
                query = query.filter(AuditLog.timestamp < to_date)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date_to format. Use YYYY-MM-DD")
        
        if search:
            query = query.filter(
                (AuditLog.description.ilike(f"%{search}%")) |
                (AuditLog.details.ilike(f"%{search}%"))
            )
        
        # Get total count before pagination
        total = query.count()
        
        # Apply sorting
        if sort_order.lower() == "desc":
            if sort_by == "timestamp":
                query = query.order_by(AuditLog.timestamp.desc())
            elif sort_by == "category":
                query = query.order_by(AuditLog.category.desc())
            elif sort_by == "action":
                query = query.order_by(AuditLog.action.desc())
            elif sort_by == "user_name":
                query = query.join(User, AuditLog.user_id == User.id)
                query = query.order_by(User.name.desc())
        else:
            if sort_by == "timestamp":
                query = query.order_by(AuditLog.timestamp.asc())
            elif sort_by == "category":
                query = query.order_by(AuditLog.category.asc())
            elif sort_by == "action":
                query = query.order_by(AuditLog.action.asc())
            elif sort_by == "user_name":
                query = query.join(User, AuditLog.user_id == User.id)
                query = query.order_by(User.name.asc())
        
        # Apply pagination
        offset = (page - 1) * limit
        logs = query.offset(offset).limit(limit).all()
        
        # Calculate pagination info
        total_pages = (total + limit - 1) // limit
        
        # Format response
        log_responses = []
        for log in logs:
            user = db.query(User).filter(User.id == log.user_id).first()
            log_response = AuditLogResponse(
                id=log.id,
                user_id=log.user_id,
                user_name=user.name if user else "Unknown",
                user_email=user.email if user else "unknown@example.com",
                company_id=log.company_id,
                action=log.action,
                category=log.category,
                description=log.description,
                details=log.details,
                target_id=log.target_id,
                target_type=log.target_type,
                ip_address=log.ip_address,
                user_agent=log.user_agent,
                timestamp=log.timestamp
            )
            log_responses.append(log_response)
        
        return AuditLogListResponse(
            logs=log_responses,
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch audit logs: {str(e)}")

@router.get("/export", response_model=dict)
async def export_audit_logs(
    category: Optional[str] = Query(None, description="Filter by category"),
    action: Optional[str] = Query(None, description="Filter by action"),
    user: Optional[str] = Query(None, description="Filter by user name or email"),
    date_from: Optional[str] = Query(None, description="Filter from date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Filter to date (YYYY-MM-DD)"),
    search: Optional[str] = Query(None, description="Search in description and details"),
    sort_by: str = Query("timestamp", description="Sort field"),
    sort_order: str = Query("desc", description="Sort order (asc/desc)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.MANAGER, UserRole.ADMIN]))
):
    """
    Export audit logs to CSV format
    Only managers and admins can export audit logs
    """
    try:
        # Build query with same filtering logic as get_audit_logs
        query = db.query(AuditLog).filter(AuditLog.company_id == current_user.company_id)
        
        # Apply filters (same logic as above)
        if category:
            query = query.filter(AuditLog.category == category)
        
        if action:
            query = query.filter(AuditLog.action == action)
        
        if user:
            query = query.join(User, AuditLog.user_id == User.id)
            query = query.filter(
                (User.name.ilike(f"%{user}%")) |
                (User.email.ilike(f"%{user}%"))
            )
        
        if date_from:
            try:
                from_date = datetime.strptime(date_from, "%Y-%m-%d")
                query = query.filter(AuditLog.timestamp >= from_date)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date_from format. Use YYYY-MM-DD")
        
        if date_to:
            try:
                to_date = datetime.strptime(date_to, "%Y-%m-%d") + timedelta(days=1)
                query = query.filter(AuditLog.timestamp < to_date)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date_to format. Use YYYY-MM-DD")
        
        if search:
            query = query.filter(
                (AuditLog.description.ilike(f"%{search}%")) |
                (AuditLog.details.ilike(f"%{search}%"))
            )
        
        # Apply sorting
        if sort_order.lower() == "desc":
            if sort_by == "timestamp":
                query = query.order_by(AuditLog.timestamp.desc())
            elif sort_by == "category":
                query = query.order_by(AuditLog.category.desc())
            elif sort_by == "action":
                query = query.order_by(AuditLog.action.desc())
        else:
            if sort_by == "timestamp":
                query = query.order_by(AuditLog.timestamp.asc())
            elif sort_by == "category":
                query = query.order_by(AuditLog.category.asc())
            elif sort_by == "action":
                query = query.order_by(AuditLog.action.asc())
        
        # Get all matching logs (limit to reasonable number for export)
        logs = query.limit(10000).all()  # Limit to prevent memory issues
        
        # Create CSV content
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            'Timestamp',
            'Category',
            'Action',
            'User Name',
            'User Email',
            'Description',
            'Details',
            'Target ID',
            'Target Type',
            'IP Address',
            'User Agent'
        ])
        
        # Write data rows
        for log in logs:
            user = db.query(User).filter(User.id == log.user_id).first()
            user_name = user.name if user else "Unknown"
            user_email = user.email if user else "unknown@example.com"
            
            writer.writerow([
                log.timestamp.isoformat() if log.timestamp else '',
                log.category or '',
                log.action or '',
                user_name,
                user_email,
                log.description or '',
                str(log.details) if log.details else '',
                log.target_id or '',
                log.target_type or '',
                log.ip_address or '',
                log.user_agent or ''
            ])
        
        csv_content = output.getvalue()
        output.close()
        
        return {
            "success": True,
            "csv": csv_content,
            "filename": f"audit-logs-{datetime.now().strftime('%Y%m%d-%H%M%S')}.csv",
            "total_records": len(logs)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export audit logs: {str(e)}")

@router.get("/stats", response_model=dict)
async def get_audit_stats(
    timeframe: str = Query("30d", description="Timeframe for stats (7d, 30d, 90d)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.MANAGER, UserRole.ADMIN]))
):
    """
    Get audit log statistics for dashboard
    """
    try:
        # Calculate date range based on timeframe
        now = datetime.utcnow()
        if timeframe == "7d":
            start_date = now - timedelta(days=7)
        elif timeframe == "30d":
            start_date = now - timedelta(days=30)
        elif timeframe == "90d":
            start_date = now - timedelta(days=90)
        else:
            start_date = now - timedelta(days=30)  # Default to 30 days
        
        # Base query with company filtering
        base_query = db.query(AuditLog).filter(
            AuditLog.company_id == current_user.company_id,
            AuditLog.timestamp >= start_date
        )
        
        # Get total events
        total_events = base_query.count()
        
        # Get events by category
        category_stats = {}
        categories = db.query(AuditLog.category).filter(
            AuditLog.company_id == current_user.company_id,
            AuditLog.timestamp >= start_date
        ).distinct().all()
        
        for (category,) in categories:
            if category:
                count = base_query.filter(AuditLog.category == category).count()
                category_stats[category] = count
        
        # Get recent security events
        security_events = base_query.filter(AuditLog.category == "security").count()
        
        # Get most active users
        user_activity = db.query(
            User.name,
            User.email,
            func.count(AuditLog.id).label('event_count')
        ).join(
            AuditLog, User.id == AuditLog.user_id
        ).filter(
            AuditLog.company_id == current_user.company_id,
            AuditLog.timestamp >= start_date
        ).group_by(
            User.id, User.name, User.email
        ).order_by(
            func.count(AuditLog.id).desc()
        ).limit(5).all()
        
        top_users = [
            {
                "name": user.name,
                "email": user.email,
                "event_count": user.event_count
            }
            for user in user_activity
        ]
        
        return {
            "timeframe": timeframe,
            "total_events": total_events,
            "security_events": security_events,
            "category_breakdown": category_stats,
            "top_users": top_users,
            "period_start": start_date.isoformat(),
            "period_end": now.isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get audit stats: {str(e)}")
