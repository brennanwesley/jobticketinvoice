import { authenticatedFetch, getToken, isAuthenticated } from './auth';

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
  // Silently skip audit logging if not authenticated
  if (!isAuthenticated()) {
    console.log('Audit logging: User not authenticated, skipping log');
    return false;
  }

  // Silently skip audit logging if no token
  const token = getToken();
  if (!token) {
    console.log('Audit logging: No authentication token, skipping log');
    return false;
  }

  try {
    const auditData = {
      action,
      category,
      details: details, // Send as object, not JSON string - backend expects Dict[str, Any]
      target_id: targetId,
      target_type: targetType,
      // Remove timestamp and ip_address - backend sets these
      user_agent: navigator.userAgent
    };

    const response = await authenticatedFetch('/audit/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(auditData),
    });

    if (!response.ok) {
      // Silently fail for audit logging - don't disrupt user experience
      if (response.status === 404) {
        console.log('Audit logging: Endpoint not available (404), continuing without audit');
        return false;
      } else if (response.status === 500) {
        console.log('Audit logging: Server error (500), continuing without audit');
        return false;
      } else if (response.status === 422) {
        console.log('Audit logging: Validation error (422), continuing without audit');
        return false;
      } else {
        console.log(`Audit logging: HTTP ${response.status}, continuing without audit`);
        return false;
      }
    }

    const result = await response.json();
    return result.success || true;
  } catch (error) {
    // Silently handle audit logging errors - never disrupt user flow
    console.log('Audit logging error (non-critical):', error.message);
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
  // Check if user is authenticated before making request
  if (!isAuthenticated()) {
    console.log('Audit logs: User not authenticated, skipping fetch');
    return {
      success: false,
      logs: [],
      total: 0,
      error: 'Authentication required'
    };
  }

  // Check if token exists
  const token = getToken();
  if (!token) {
    console.log('Audit logs: No authentication token found, skipping fetch');
    return {
      success: false,
      logs: [],
      total: 0,
      error: 'No authentication token'
    };
  }

  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    const response = await authenticatedFetch(`/audit/logs?${params}`);
    
    if (!response.ok) {
      // Handle different HTTP status codes appropriately
      if (response.status === 404) {
        console.log('Audit logs: Endpoint not found (404), returning empty results');
        return {
          success: true,
          logs: [],
          total: 0,
          message: 'Audit logging not yet implemented'
        };
      } else if (response.status === 500) {
        console.log('Audit logs: Server error (500), returning empty results');
        return {
          success: true,
          logs: [],
          total: 0,
          message: 'Audit logs temporarily unavailable'
        };
      } else if (response.status === 401 || response.status === 403) {
        console.log('Audit logs: Authentication/authorization error, returning empty results');
        return {
          success: false,
          logs: [],
          total: 0,
          error: 'Insufficient permissions'
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }

    const data = await response.json();
    return {
      success: true,
      logs: data.logs || data || [],
      total: data.total || (data.logs ? data.logs.length : 0),
      page: data.page || page,
      limit: data.limit || limit
    };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    
    // Return graceful fallback instead of throwing
    return {
      success: false,
      logs: [],
      total: 0,
      error: error.message || 'Failed to fetch audit logs'
    };
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
