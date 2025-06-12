import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { authenticatedFetch } from '../utils/auth';
import { auditTechnicianAction, auditCompanyAction, AUDIT_ACTIONS } from '../utils/audit';

// Create the context
const ManagerContext = createContext();

/**
 * Provider component for manager-specific context
 * Handles technician management, company profile, and audit logging
 */
export const ManagerProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  
  // State for technicians
  const [technicians, setTechnicians] = useState([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);
  const [technicianError, setTechnicianError] = useState(null);
  
  // State for company profile
  const [companyProfile, setCompanyProfile] = useState(null);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [companyError, setCompanyError] = useState(null);
  
  // State for invitations
  const [invitations, setInvitations] = useState([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  
  // State for audit logs
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);
  const [auditError, setAuditError] = useState(null);
  
  // Filters and pagination
  const [technicianFilter, setTechnicianFilter] = useState('all');
  const [selectedTechnicians, setSelectedTechnicians] = useState([]);
  
  // Check if user has manager access
  const hasManagerAccess = useCallback(() => {
    return isAuthenticated && user && (user.role === 'manager' || user.role === 'admin');
  }, [isAuthenticated, user]);
  
  // Fetch technicians
  const fetchTechnicians = useCallback(async () => {
    if (!hasManagerAccess()) return;
    
    setLoadingTechnicians(true);
    setTechnicianError(null);
    
    try {
      const response = await authenticatedFetch('/users/technicians');
      if (response.ok) {
        const data = await response.json();
        setTechnicians(data);
      } else {
        throw new Error('Failed to fetch technicians');
      }
    } catch (error) {
      console.error('Error fetching technicians:', error);
      setTechnicianError(t('manager.techManagement.messages.errorLoadingTechnicians'));
    } finally {
      setLoadingTechnicians(false);
    }
  }, [hasManagerAccess, t]);
  
  // Fetch company profile
  const fetchCompanyProfile = useCallback(async () => {
    console.log('ManagerContext: fetchCompanyProfile called');
    console.log('ManagerContext: isAuthenticated:', isAuthenticated, 'user:', user);
    console.log('ManagerContext: hasManagerAccess():', hasManagerAccess());
    
    if (!hasManagerAccess()) {
      console.log('ManagerContext: No manager access, returning early');
      return;
    }
    
    setLoadingCompany(true);
    setCompanyError(null);
    
    try {
      console.log('ManagerContext: Making API call to /companies/current');
      const response = await authenticatedFetch('/companies/current');
      console.log('ManagerContext: API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('ManagerContext: Company profile data received:', data);
        setCompanyProfile(data);
      } else {
        const errorData = await response.text();
        console.error('Company profile fetch failed:', response.status, errorData);
        throw new Error(`Failed to fetch company profile: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Error fetching company profile:', error);
      setCompanyError(error.message || 'Failed to load company profile');
    } finally {
      setLoadingCompany(false);
    }
  }, [hasManagerAccess, isAuthenticated, user]);
  
  // Fetch invitations
  const fetchInvitations = useCallback(async () => {
    if (!hasManagerAccess()) return;
    
    setLoadingInvitations(true);
    
    try {
      const response = await authenticatedFetch('/invitations/');
      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoadingInvitations(false);
    }
  }, [hasManagerAccess]);
  
  // Invite technician
  const inviteTechnician = useCallback(async (invitationData) => {
    if (!hasManagerAccess()) return { success: false, error: 'Unauthorized' };
    
    try {
      const response = await authenticatedFetch('/invitations/invite-technician', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invitationData),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Refresh invitations list
        await fetchInvitations();
        await auditTechnicianAction(AUDIT_ACTIONS.TECHNICIAN_INVITED, invitationData);
        return { success: true, data };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || 'Failed to send invitation' };
      }
    } catch (error) {
      console.error('Error inviting technician:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }, [hasManagerAccess, fetchInvitations]);
  
  // Update technician status
  const updateTechnicianStatus = useCallback(async (technicianId, action) => {
    if (!hasManagerAccess()) return { success: false, error: 'Unauthorized' };
    
    try {
      let endpoint = '';
      let method = 'PUT';
      
      switch (action) {
        case 'activate':
          endpoint = `/users/${technicianId}/activate`;
          break;
        case 'deactivate':
          endpoint = `/users/${technicianId}/deactivate`;
          break;
        case 'remove':
          endpoint = `/users/${technicianId}`;
          method = 'DELETE';
          break;
        default:
          return { success: false, error: 'Invalid action' };
      }
      
      const response = await authenticatedFetch(endpoint, { method });
      
      if (response.ok) {
        // Refresh technicians list
        await fetchTechnicians();
        await auditTechnicianAction(
          action === 'activate' ? AUDIT_ACTIONS.TECHNICIAN_ACTIVATED :
          action === 'deactivate' ? AUDIT_ACTIONS.TECHNICIAN_DEACTIVATED :
          AUDIT_ACTIONS.TECHNICIAN_REMOVED,
          technicianId,
          null,
          { action, technicianId }
        );
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || `Failed to ${action} technician` };
      }
    } catch (error) {
      console.error(`Error ${action} technician:`, error);
      return { success: false, error: 'Network error occurred' };
    }
  }, [hasManagerAccess, fetchTechnicians]);
  
  // Batch update technicians
  const batchUpdateTechnicians = useCallback(async (technicianIds, action) => {
    if (!hasManagerAccess()) return { success: false, error: 'Unauthorized' };
    
    const results = [];
    for (const id of technicianIds) {
      const result = await updateTechnicianStatus(id, action);
      results.push({ id, ...result });
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    if (successCount > 0) {
      await auditTechnicianAction(AUDIT_ACTIONS.BATCH_TECHNICIAN_UPDATE, null, null, { 
        technicianIds, 
        action, 
        successCount, 
        failureCount 
      });
    }
    
    return {
      success: failureCount === 0,
      successCount,
      failureCount,
      results
    };
  }, [hasManagerAccess, updateTechnicianStatus]);
  
  // Resend invitation
  const resendInvitation = useCallback(async (invitationId) => {
    if (!hasManagerAccess()) return { success: false, error: 'Unauthorized' };
    
    try {
      const response = await authenticatedFetch(`/invitations/${invitationId}/resend`, {
        method: 'POST',
      });
      
      if (response.ok) {
        await fetchInvitations();
        await auditTechnicianAction(AUDIT_ACTIONS.INVITATION_RESENT, invitationId, null, { invitationId });
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || 'Failed to resend invitation' };
      }
    } catch (error) {
      console.error('Error resending invitation:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }, [hasManagerAccess, fetchInvitations]);
  
  // Update company profile
  const updateCompanyProfile = useCallback(async (profileData) => {
    if (!hasManagerAccess()) return { success: false, error: 'Unauthorized' };
    
    try {
      const response = await authenticatedFetch('/companies/current', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompanyProfile(data);
        await auditCompanyAction(AUDIT_ACTIONS.COMPANY_PROFILE_UPDATED, user?.company_id, profileData);
        return { success: true, data };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || 'Failed to update company profile' };
      }
    } catch (error) {
      console.error('Error updating company profile:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }, [hasManagerAccess]);
  
  // Upload company logo
  const uploadCompanyLogo = useCallback(async (logoFile) => {
    if (!hasManagerAccess()) return { success: false, error: 'Unauthorized' };
    
    try {
      const formData = new FormData();
      formData.append('logo', logoFile);
      
      const response = await authenticatedFetch('/companies/current/logo', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update company profile with new logo URL
        setCompanyProfile(prev => ({ ...prev, logo_url: data.logo_url }));
        await auditCompanyAction(AUDIT_ACTIONS.COMPANY_LOGO_UPLOADED, user?.company_id, { 
          filename: logoFile.name, 
          size: logoFile.size 
        });
        return { success: true, data };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || 'Failed to upload logo' };
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }, [hasManagerAccess]);
  
  // Fetch audit logs
  const fetchAuditLogs = useCallback(async (filters = {}) => {
    if (!hasManagerAccess()) return { success: false, error: 'Access denied' };
    
    setLoadingAuditLogs(true);
    setAuditError(null);
    
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });
      
      const response = await authenticatedFetch(`/audit/logs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.logs || []);
        return { 
          success: true, 
          logs: data.logs || [], 
          total: data.total || 0,
          page: data.page || 1,
          totalPages: data.total_pages || 0
        };
      } else {
        throw new Error('Failed to fetch audit logs');
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      const errorMessage = t('manager.auditLogs.messages.loadingError') || 'Failed to load audit logs';
      setAuditError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoadingAuditLogs(false);
    }
  }, [hasManagerAccess, t]);
  
  // Filter technicians based on current filter
  const filteredTechnicians = useCallback(() => {
    if (!technicians) return [];
    
    switch (technicianFilter) {
      case 'active':
        return technicians.filter(tech => tech.is_active && !tech.pending_invitation);
      case 'pending':
        return technicians.filter(tech => tech.pending_invitation);
      case 'deactivated':
        return technicians.filter(tech => !tech.is_active);
      default:
        return technicians;
    }
  }, [technicians, technicianFilter]);
  
  // Get technician statistics
  const getTechnicianStats = useCallback(() => {
    if (!technicians) return { total: 0, active: 0, pending: 0, deactivated: 0 };
    
    return {
      total: technicians.length,
      active: technicians.filter(tech => tech.is_active && !tech.pending_invitation).length,
      pending: technicians.filter(tech => tech.pending_invitation).length,
      deactivated: technicians.filter(tech => !tech.is_active).length,
    };
  }, [technicians]);
  
  // Load initial data when user changes
  useEffect(() => {
    if (hasManagerAccess()) {
      fetchTechnicians();
      fetchCompanyProfile();
      fetchInvitations();
    }
  }, [hasManagerAccess, fetchTechnicians, fetchCompanyProfile, fetchInvitations]);
  
  // Context value
  const contextValue = {
    // Access control
    hasManagerAccess,
    
    // Technician management
    technicians: filteredTechnicians(),
    allTechnicians: technicians,
    loadingTechnicians,
    technicianError,
    technicianFilter,
    setTechnicianFilter,
    selectedTechnicians,
    setSelectedTechnicians,
    fetchTechnicians,
    inviteTechnician,
    updateTechnicianStatus,
    batchUpdateTechnicians,
    getTechnicianStats,
    
    // Invitations
    invitations,
    loadingInvitations,
    fetchInvitations,
    resendInvitation,
    
    // Company profile
    companyProfile,
    loadingCompany,
    companyError,
    fetchCompanyProfile,
    updateCompanyProfile,
    uploadCompanyLogo,
    
    // Audit logs
    auditLogs,
    loadingAuditLogs,
    auditError,
    fetchAuditLogs,
  };
  
  return (
    <ManagerContext.Provider value={contextValue}>
      {children}
    </ManagerContext.Provider>
  );
};

/**
 * Custom hook to use the manager context
 * @returns {Object} Manager context value
 */
export const useManager = () => {
  const context = useContext(ManagerContext);
  if (context === undefined) {
    throw new Error('useManager must be used within a ManagerProvider');
  }
  return context;
};

export default ManagerContext;
