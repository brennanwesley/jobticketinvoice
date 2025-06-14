import { authenticatedFetch } from './auth';

/**
 * Audit logging utilities for tracking user actions and system events
 * Provides centralized logging for compliance and debugging purposes
 */

/**
 * Log an audit event
 * @param {string} action - The action being performed
 * @param {string} category - Category of the action (technician, company, security, system)
 * @param {Object} details - Additional details about the action
 * @param {string} targetId - ID of the target entity (optional)
 * @param {string} targetType - Type of the target entity (optional)
 * @returns {Promise<boolean>} Success status
 */
export const logAuditEvent = async (action, category, details = {}, targetId = null, targetType = null) => {
  try {
    // Check if we have an authentication token before attempting to log
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Skipping audit log - no authentication token available:', { action, category, details });
      return false;
    }

    const auditData = {
      action,
      category,
      description: `${action} - ${category}`,
      details: typeof details === 'string' ? { message: details } : details,
      target_id: targetId,
      target_type: targetType,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      ip_address: null, // Will be populated by backend
    };

    const response = await authenticatedFetch('/audit/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(auditData),
    });

    if (!response.ok) {
      console.error('Failed to log audit event:', response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error logging audit event:', error);
    return false;
  }
};

/**
 * Fetch audit logs with filtering and pagination
 * @param {Object} filters - Filter options
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Number of records per page
 * @returns {Promise<Object>} Audit logs data
 */
export const fetchAuditLogs = async (filters = {}, page = 1, limit = 50) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    const response = await authenticatedFetch(`/audit/logs?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch audit logs');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
};

/**
 * Predefined audit action types for consistency
 */
export const AUDIT_ACTIONS = {
  // Technician management
  TECHNICIAN_INVITED: 'technician_invited',
  TECHNICIAN_ACTIVATED: 'technician_activated',
  TECHNICIAN_DEACTIVATED: 'technician_deactivated',
  TECHNICIAN_REMOVED: 'technician_removed',
  TECHNICIAN_PROFILE_UPDATED: 'technician_profile_updated',
  INVITATION_RESENT: 'invitation_resent',
  BATCH_TECHNICIAN_UPDATE: 'batch_technician_update',
  
  // Company management
  COMPANY_PROFILE_UPDATED: 'company_profile_updated',
  COMPANY_LOGO_UPLOADED: 'company_logo_uploaded',
  COMPANY_LOGO_REMOVED: 'company_logo_removed',
  
  // Security events
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  PASSWORD_CHANGED: 'password_changed',
  PASSWORD_RESET_REQUESTED: 'password_reset_requested',
  PASSWORD_RESET_COMPLETED: 'password_reset_completed',
  UNAUTHORIZED_ACCESS_ATTEMPT: 'unauthorized_access_attempt',
  
  // System events
  DATA_EXPORT: 'data_export',
  SYSTEM_ERROR: 'system_error',
  API_ERROR: 'api_error',
};

/**
 * Audit categories for organizing events
 */
export const AUDIT_CATEGORIES = {
  TECHNICIAN: 'technician',
  COMPANY: 'company',
  SECURITY: 'security',
  SYSTEM: 'system',
  JOB_TICKET: 'job_ticket',
  INVOICE: 'invoice',
};

/**
 * Helper functions for common audit scenarios
 */

/**
 * Log technician management actions
 */
export const auditTechnicianAction = async (action, technicianId, technicianName, details = {}) => {
  return await logAuditEvent(
    action,
    AUDIT_CATEGORIES.TECHNICIAN,
    {
      technician_name: technicianName,
      ...details,
    },
    technicianId,
    'technician'
  );
};

/**
 * Log company profile changes
 */
export const auditCompanyAction = async (action, companyId, details = {}) => {
  return await logAuditEvent(
    action,
    AUDIT_CATEGORIES.COMPANY,
    details,
    companyId,
    'company'
  );
};

/**
 * Log security events
 */
export const auditSecurityEvent = async (action, details = {}) => {
  return await logAuditEvent(
    action,
    AUDIT_CATEGORIES.SECURITY,
    details
  );
};

/**
 * Log system errors and events
 */
export const auditSystemEvent = async (action, details = {}) => {
  return await logAuditEvent(
    action,
    AUDIT_CATEGORIES.SYSTEM,
    details
  );
};

/**
 * Batch audit logging for multiple actions
 */
export const logBatchAuditEvents = async (events) => {
  try {
    const response = await authenticatedFetch('/audit/batch-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: events.map(event => ({
          ...event,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
        })),
      }),
    });

    if (!response.ok) {
      console.error('Failed to log batch audit events:', response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error logging batch audit events:', error);
    return false;
  }
};

/**
 * Format audit log entry for display
 */
export const formatAuditLogEntry = (entry, t) => {
  const timestamp = new Date(entry.timestamp).toLocaleString();
  
  return {
    id: entry.id,
    timestamp,
    user: entry.user_name || entry.user_email || 'System',
    action: t(`audit.actions.${entry.action}`) || entry.action,
    category: t(`audit.categories.${entry.category}`) || entry.category,
    details: entry.details,
    target: entry.target_type && entry.target_id ? `${entry.target_type}:${entry.target_id}` : null,
  };
};

/**
 * Export audit logs to CSV format
 */
export const exportAuditLogs = async (filters = {}, filename = null) => {
  try {
    const params = new URLSearchParams({
      format: 'csv',
      ...filters,
    });

    const response = await authenticatedFetch(`/audit/export?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to export audit logs');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // Log the export action
    await auditSystemEvent(AUDIT_ACTIONS.DATA_EXPORT, {
      export_type: 'audit_logs',
      filters,
      filename: link.download,
    });

    return true;
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    throw error;
  }
};

/**
 * Get audit statistics for dashboard
 */
export const getAuditStats = async (timeframe = '30d') => {
  try {
    const response = await authenticatedFetch(`/audit/stats?timeframe=${timeframe}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch audit statistics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching audit statistics:', error);
    throw error;
  }
};

export default {
  logAuditEvent,
  fetchAuditLogs,
  auditTechnicianAction,
  auditCompanyAction,
  auditSecurityEvent,
  auditSystemEvent,
  logBatchAuditEvents,
  formatAuditLogEntry,
  exportAuditLogs,
  getAuditStats,
  AUDIT_ACTIONS,
  AUDIT_CATEGORIES,
};
