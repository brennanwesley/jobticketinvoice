import { useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { auditSecurityEvent, AUDIT_ACTIONS } from '../utils/audit';

/**
 * Custom hook for role-based access control in manager features
 * Provides utilities for checking permissions and logging unauthorized access attempts
 */
export const useManagerAccess = () => {
  const { user, isAuthenticated } = useAuth();

  // Check if user has manager role
  const isManager = useMemo(() => {
    return isAuthenticated && user && (user.role === 'MANAGER' || user.role === 'ADMIN');
  }, [isAuthenticated, user]);

  // Check if user has admin role
  const isAdmin = useMemo(() => {
    return isAuthenticated && user && user.role === 'ADMIN';
  }, [isAuthenticated, user]);

  // Check if user has technician role
  const isTechnician = useMemo(() => {
    return isAuthenticated && user && user.role === 'TECHNICIAN';
  }, [isAuthenticated, user]);

  // Get user's company ID for multi-tenancy
  const companyId = useMemo(() => {
    return user?.company_id || null;
  }, [user]);

  // Check if user can access manager features
  const canAccessManagerFeatures = useCallback(() => {
    if (!isAuthenticated || !user) {
      return false;
    }
    return user.role === 'MANAGER' || user.role === 'ADMIN';
  }, [isAuthenticated, user]);

  // Check if user can manage technicians
  const canManageTechnicians = useCallback(() => {
    return canAccessManagerFeatures();
  }, [canAccessManagerFeatures]);

  // Check if user can edit company profile
  const canEditCompanyProfile = useCallback(() => {
    return canAccessManagerFeatures();
  }, [canAccessManagerFeatures]);

  // Check if user can view audit logs
  const canViewAuditLogs = useCallback(() => {
    return canAccessManagerFeatures();
  }, [canAccessManagerFeatures]);

  // Check if user can export data
  const canExportData = useCallback(() => {
    return canAccessManagerFeatures();
  }, [canAccessManagerFeatures]);

  // Check if user can invite technicians
  const canInviteTechnicians = useCallback(() => {
    return canAccessManagerFeatures();
  }, [canAccessManagerFeatures]);

  // Check if user can deactivate/remove technicians
  const canDeactivateTechnicians = useCallback(() => {
    return canAccessManagerFeatures();
  }, [canAccessManagerFeatures]);

  // Check if user can perform batch operations
  const canPerformBatchOperations = useCallback(() => {
    return canAccessManagerFeatures();
  }, [canAccessManagerFeatures]);

  // Check if user can upload company logo
  const canUploadCompanyLogo = useCallback(() => {
    return canAccessManagerFeatures();
  }, [canAccessManagerFeatures]);

  // Check if user belongs to the same company (for multi-tenancy)
  const belongsToSameCompany = useCallback((targetCompanyId) => {
    if (!companyId || !targetCompanyId) {
      return false;
    }
    return companyId === targetCompanyId;
  }, [companyId]);

  // Validate access and log unauthorized attempts
  const validateAccess = useCallback(async (requiredPermission, context = {}) => {
    let hasAccess = false;
    let reason = '';

    // Check authentication
    if (!isAuthenticated) {
      reason = 'User not authenticated';
    } else if (!user) {
      reason = 'User data not available';
    } else {
      // Check specific permissions
      switch (requiredPermission) {
        case 'manager_features':
          hasAccess = canAccessManagerFeatures();
          reason = hasAccess ? '' : 'Insufficient role permissions';
          break;
        case 'technician_management':
          hasAccess = canManageTechnicians();
          reason = hasAccess ? '' : 'Cannot manage technicians';
          break;
        case 'company_profile':
          hasAccess = canEditCompanyProfile();
          reason = hasAccess ? '' : 'Cannot edit company profile';
          break;
        case 'audit_logs':
          hasAccess = canViewAuditLogs();
          reason = hasAccess ? '' : 'Cannot view audit logs';
          break;
        case 'data_export':
          hasAccess = canExportData();
          reason = hasAccess ? '' : 'Cannot export data';
          break;
        case 'invite_technicians':
          hasAccess = canInviteTechnicians();
          reason = hasAccess ? '' : 'Cannot invite technicians';
          break;
        case 'deactivate_technicians':
          hasAccess = canDeactivateTechnicians();
          reason = hasAccess ? '' : 'Cannot deactivate technicians';
          break;
        case 'batch_operations':
          hasAccess = canPerformBatchOperations();
          reason = hasAccess ? '' : 'Cannot perform batch operations';
          break;
        case 'upload_logo':
          hasAccess = canUploadCompanyLogo();
          reason = hasAccess ? '' : 'Cannot upload company logo';
          break;
        default:
          hasAccess = false;
          reason = 'Unknown permission type';
      }

      // Additional company-level check if target company is specified
      if (hasAccess && context.targetCompanyId) {
        if (!belongsToSameCompany(context.targetCompanyId)) {
          hasAccess = false;
          reason = 'Cross-company access denied';
        }
      }
    }

    // Log unauthorized access attempts
    if (!hasAccess) {
      await auditSecurityEvent(AUDIT_ACTIONS.UNAUTHORIZED_ACCESS_ATTEMPT, {
        permission: requiredPermission,
        reason,
        context,
        user_id: user?.id || null,
        user_email: user?.email || null,
        user_role: user?.role || null,
        company_id: companyId,
        url: window.location.pathname,
        timestamp: new Date().toISOString(),
      });
    }

    return {
      hasAccess,
      reason: hasAccess ? null : reason,
    };
  }, [
    isAuthenticated,
    user,
    companyId,
    canAccessManagerFeatures,
    canManageTechnicians,
    canEditCompanyProfile,
    canViewAuditLogs,
    canExportData,
    canInviteTechnicians,
    canDeactivateTechnicians,
    canPerformBatchOperations,
    canUploadCompanyLogo,
    belongsToSameCompany,
  ]);

  // Higher-order component for protecting routes
  const withManagerAccess = useCallback((WrappedComponent, requiredPermission = 'manager_features') => {
    return function ProtectedComponent(props) {
      const { hasAccess } = validateAccess(requiredPermission);
      
      if (!hasAccess) {
        return (
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Access Denied</h4>
            <p>You don't have permission to access this feature.</p>
            <hr />
            <p className="mb-0">Please contact your administrator if you believe this is an error.</p>
          </div>
        );
      }
      
      return <WrappedComponent {...props} />;
    };
  }, [validateAccess]);

  // Get user permissions summary
  const getPermissionsSummary = useCallback(() => {
    return {
      isAuthenticated,
      isManager,
      isAdmin,
      isTechnician,
      companyId,
      permissions: {
        managerFeatures: canAccessManagerFeatures(),
        technicianManagement: canManageTechnicians(),
        companyProfile: canEditCompanyProfile(),
        auditLogs: canViewAuditLogs(),
        dataExport: canExportData(),
        inviteTechnicians: canInviteTechnicians(),
        deactivateTechnicians: canDeactivateTechnicians(),
        batchOperations: canPerformBatchOperations(),
        uploadLogo: canUploadCompanyLogo(),
      },
    };
  }, [
    isAuthenticated,
    isManager,
    isAdmin,
    isTechnician,
    companyId,
    canAccessManagerFeatures,
    canManageTechnicians,
    canEditCompanyProfile,
    canViewAuditLogs,
    canExportData,
    canInviteTechnicians,
    canDeactivateTechnicians,
    canPerformBatchOperations,
    canUploadCompanyLogo,
  ]);

  return {
    // User role checks
    isManager,
    isAdmin,
    isTechnician,
    isAuthenticated,
    user,
    companyId,

    // Permission checks
    canAccessManagerFeatures,
    canManageTechnicians,
    canEditCompanyProfile,
    canViewAuditLogs,
    canExportData,
    canInviteTechnicians,
    canDeactivateTechnicians,
    canPerformBatchOperations,
    canUploadCompanyLogo,
    belongsToSameCompany,

    // Utilities
    validateAccess,
    withManagerAccess,
    getPermissionsSummary,
  };
};

export default useManagerAccess;
