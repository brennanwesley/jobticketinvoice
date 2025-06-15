import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useManager } from '../../context/ManagerContext';
import { useManagerAccess } from '../../hooks/useManagerAccess';
import { auditTechnicianAction, AUDIT_ACTIONS } from '../../utils/audit';
import InviteTechnicianModal from './InviteTechnicianModal';
import Toast from '../ui/Toast';
import { 
  UsersIcon, 
  CheckCircleIcon, 
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

/**
 * Technician Management Component
 * Clean, mobile-friendly layout with stat boxes and technician table
 */
const TechnicianManagement = () => {
  const { t } = useLanguage();
  const {
    technicians,
    loadingTechnicians,
    technicianError,
    technicianFilter,
    setTechnicianFilter,
    selectedTechnicians,
    setSelectedTechnicians,
    fetchTechnicians,
    updateTechnicianStatus,
    batchUpdateTechnicians,
    resendInvitation,
    getTechnicianStats,
    invitations
  } = useManager();
  
  const { validateAccess } = useManagerAccess();
  
  // Local state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Load technicians on mount
  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  // Mock data for demonstration if no real data
  const mockTechnicians = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '(555) 123-4567',
      is_active: true
    },
    {
      id: 2,
      name: 'Maria Garcia',
      email: 'maria.garcia@example.com',
      phone: '(555) 234-5678',
      is_active: true
    },
    {
      id: 3,
      name: 'David Johnson',
      email: 'david.johnson@example.com',
      phone: '(555) 345-6789',
      is_active: false
    }
  ];

  const displayTechnicians = technicians.length > 0 ? technicians : mockTechnicians;

  // Calculate stats with display data
  const stats = useMemo(() => {
    if (technicians.length > 0) {
      // Use real data stats
      const activeTechnicians = technicians.filter(tech => tech.is_active && !tech.force_password_reset);
      const pendingInvitations = invitations.length;
      
      return {
        total: technicians.length,
        active: activeTechnicians.length,
        pending: pendingInvitations
      };
    } else {
      // Use mock data stats
      const activeTechnicians = mockTechnicians.filter(tech => tech.is_active);
      
      return {
        total: mockTechnicians.length,
        active: activeTechnicians.length,
        pending: 2 // Mock pending invitations
      };
    }
  }, [technicians, invitations]);

  // Filter and sort technicians
  const filteredAndSortedTechnicians = useCallback(() => {
    let filtered = displayTechnicians.filter(tech => {
      const matchesSearch = !searchTerm || 
        tech.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.job_type?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });

    // Sort technicians
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = `${a.first_name || ''} ${a.last_name || ''}`.trim();
          bValue = `${b.first_name || ''} ${b.last_name || ''}`.trim();
          break;
        case 'email':
          aValue = a.email || '';
          bValue = b.email || '';
          break;
        case 'status':
          aValue = getStatusPriority(a);
          bValue = getStatusPriority(b);
          break;
        case 'jobType':
          aValue = a.job_type || '';
          bValue = b.job_type || '';
          break;
        case 'lastActive':
          aValue = new Date(a.last_login || 0);
          bValue = new Date(b.last_login || 0);
          break;
        default:
          aValue = a[sortBy] || '';
          bValue = b[sortBy] || '';
      }

      if (sortBy === 'lastActive') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const comparison = aValue.toString().localeCompare(bValue.toString());
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [displayTechnicians, searchTerm, sortBy, sortOrder]);

  // Get status priority for sorting
  const getStatusPriority = (technician) => {
    if (technician.pending_invitation) return 3; // Pending
    if (technician.is_active) return 1; // Active
    return 2; // Deactivated
  };

  // Get technician status
  const getTechnicianStatus = (technician) => {
    if (technician.pending_invitation) {
      return {
        key: 'pending',
        label: t('manager.techManagement.statusPending'),
        class: 'warning'
      };
    }
    if (technician.is_active) {
      return {
        key: 'active',
        label: t('manager.techManagement.statusActive'),
        class: 'success'
      };
    }
    return {
      key: 'deactivated',
      label: t('manager.techManagement.statusDeactivated'),
      class: 'secondary'
    };
  };

  // Handle invite technician
  const handleInviteTechnician = async () => {
    const { hasAccess } = await validateAccess('invite_technician');
    if (!hasAccess) {
      setToast({
        type: 'error',
        message: t('common.accessDenied')
      });
      return;
    }
    setShowInviteModal(true);
  };

  // Handle invite success
  const handleInviteSuccess = () => {
    setShowInviteModal(false);
    setToast({
      type: 'success',
      message: t('manager.techManagement.messages.invitationSent')
    });
    fetchTechnicians(); // Refresh data
  };

  // Handle technician action
  const handleTechnicianAction = async (technician, action) => {
    const { hasAccess } = await validateAccess('technician_management');
    if (!hasAccess) {
      setToast({
        type: 'error',
        message: t('common.accessDenied')
      });
      return;
    }

    const technicianName = `${technician.first_name} ${technician.last_name}`;
    
    // Show confirmation modal for destructive actions
    if (['deactivate', 'remove'].includes(action)) {
      // Show confirmation modal
      const confirmationModal = {
        title: t(`manager.techManagement.confirmations.${action}.title`),
        message: t(`manager.techManagement.confirmations.${action}.message`, { name: technicianName }),
        confirmText: t(`manager.techManagement.confirmations.${action}.confirm`),
        cancelText: t(`manager.techManagement.confirmations.${action}.cancel`),
        variant: action === 'remove' ? 'danger' : 'warning',
        showWarning: action === 'remove',
        warningText: action === 'remove' ? t(`manager.techManagement.confirmations.${action}.warning`) : null,
        onConfirm: () => executeTechnicianAction(technician, action, technicianName),
        onCancel: () => {}
      };
    } else {
      await executeTechnicianAction(technician, action, technicianName);
    }
  };

  // Execute technician action
  const executeTechnicianAction = async (technician, action, technicianName) => {
    try {
      let result;
      
      if (action === 'reinvite') {
        // Find the invitation for this technician
        const invitation = invitations.find(inv => inv.email === technician.email);
        if (invitation) {
          result = await resendInvitation(invitation.id);
        } else {
          throw new Error('Invitation not found');
        }
      } else {
        result = await updateTechnicianStatus(technician.id, action);
      }

      if (result.success) {
        // Log the action
        await auditTechnicianAction(
          AUDIT_ACTIONS[`TECHNICIAN_${action.toUpperCase()}`] || `technician_${action}`,
          technician.id,
          technicianName,
          { action, previous_status: getTechnicianStatus(technician).key }
        );

        // Show success message
        const messageKey = action === 'reinvite' ? 'invitationResent' : `technician${action.charAt(0).toUpperCase() + action.slice(1)}d`;
        setToast({
          type: 'success',
          message: t(`manager.techManagement.messages.${messageKey}`)
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(`Error ${action} technician:`, error);
      setToast({
        type: 'error',
        message: error.message || t('common.errorOccurred')
      });
    }
  };

  // Handle batch actions
  const handleBatchAction = async (action) => {
    if (selectedTechnicians.length === 0) return;

    const { hasAccess } = await validateAccess('batch_operations');
    if (!hasAccess) {
      setToast({
        type: 'error',
        message: t('common.accessDenied')
      });
      return;
    }

    // Show confirmation modal
    const confirmationModal = {
      title: t(`manager.techManagement.confirmations.batch${action.charAt(0).toUpperCase() + action.slice(1)}.title`),
      message: t(`manager.techManagement.confirmations.batch${action.charAt(0).toUpperCase() + action.slice(1)}.message`, { count: selectedTechnicians.length }),
      confirmText: t(`manager.techManagement.confirmations.batch${action.charAt(0).toUpperCase() + action.slice(1)}.confirm`),
      cancelText: t(`manager.techManagement.confirmations.batch${action.charAt(0).toUpperCase() + action.slice(1)}.cancel`),
      variant: action === 'remove' ? 'danger' : 'warning',
      showWarning: action === 'remove',
      warningText: action === 'remove' ? t(`manager.techManagement.confirmations.batch${action.charAt(0).toUpperCase() + action.slice(1)}.warning`) : null,
      onConfirm: () => executeBatchAction(action),
      onCancel: () => {}
    };
  };

  // Execute batch action
  const executeBatchAction = async (action) => {
    try {
      const result = await batchUpdateTechnicians(selectedTechnicians, action);
      
      if (result.success || result.successCount > 0) {
        // Log batch action
        await auditTechnicianAction(
          AUDIT_ACTIONS.BATCH_TECHNICIAN_UPDATE,
          null,
          'Multiple technicians',
          {
            action,
            technician_ids: selectedTechnicians,
            success_count: result.successCount,
            failure_count: result.failureCount
          }
        );

        // Show success message
        const messageKey = `technicians${action.charAt(0).toUpperCase() + action.slice(1)}d`;
        setToast({
          type: result.failureCount > 0 ? 'warning' : 'success',
          message: t(`manager.techManagement.messages.${messageKey}`, { count: result.successCount })
        });

        // Clear selection
        setSelectedTechnicians([]);
      } else {
        throw new Error('Batch operation failed');
      }
    } catch (error) {
      console.error(`Error batch ${action}:`, error);
      setToast({
        type: 'error',
        message: t('common.errorOccurred')
      });
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedTechnicians.length === filteredAndSortedTechnicians().length) {
      setSelectedTechnicians([]);
    } else {
      setSelectedTechnicians(filteredAndSortedTechnicians().map(tech => tech.id));
    }
  };

  // Handle individual selection
  const handleSelectTechnician = (technicianId) => {
    setSelectedTechnicians(prev => {
      if (prev.includes(technicianId)) {
        return prev.filter(id => id !== technicianId);
      } else {
        return [...prev, technicianId];
      }
    });
  };

  const filteredTechnicians = filteredAndSortedTechnicians();

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {t('manager.techManagement.title')}
            </h1>
            <p className="text-gray-400">
              {t('manager.techManagement.subtitle')}
            </p>
          </div>
          <button
            onClick={handleInviteTechnician}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
          >
            <UserPlusIcon className="h-5 w-5" />
            {t('manager.techManagement.inviteTechnician')}
          </button>
        </div>
      </div>

      {/* Technician Management - Top Box Summary */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Technician Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Technicians */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">
                  {loadingTechnicians ? '...' : stats.total}
                </p>
                <p className="text-gray-400 text-sm">
                  {t('manager.techManagement.totalTechnicians')}
                </p>
              </div>
            </div>
          </div>

          {/* Active Technicians */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">
                  {loadingTechnicians ? '...' : stats.active}
                </p>
                <p className="text-gray-400 text-sm">
                  {t('manager.techManagement.activeTechnicians')}
                </p>
              </div>
            </div>
          </div>

          {/* Pending Invitations */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">
                  {loadingTechnicians ? '...' : stats.pending}
                </p>
                <p className="text-gray-400 text-sm">
                  {t('manager.techManagement.pendingInvitations')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technician Team - Table Section */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Technician Team</h2>
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
          {loadingTechnicians ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-400">{t('common.loading')}</p>
            </div>
          ) : technicianError ? (
            <div className="p-8 text-center">
              <p className="text-red-400">{technicianError}</p>
            </div>
          ) : filteredTechnicians.length === 0 ? (
            <div className="p-8 text-center">
              <UsersIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No technicians found</p>
              <p className="text-gray-500 text-sm">Invite your first technician to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                      Phone Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredTechnicians.map((technician, index) => (
                    <tr key={technician.id || index} className="hover:bg-gray-750 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {technician.name || `${technician.first_name || ''} ${technician.last_name || ''}`.trim()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-300">
                          <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-500" />
                          {technician.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="flex items-center text-sm text-gray-300">
                          <PhoneIcon className="h-4 w-4 mr-2 text-gray-500" />
                          {technician.phone || 'Not provided'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm text-green-400 font-medium">
                            Active
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button
                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                            onClick={() => handleTechnicianAction(technician, 'deactivate')}
                          >
                            Deactivate
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Invite Technician Modal */}
      {showInviteModal && (
        <InviteTechnicianModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onSuccess={handleInviteSuccess}
        />
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default TechnicianManagement;
