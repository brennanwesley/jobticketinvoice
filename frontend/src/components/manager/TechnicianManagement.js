import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useManager } from '../../context/ManagerContext';
import { useManagerAccess } from '../../hooks/useManagerAccess';
import { auditTechnicianAction, AUDIT_ACTIONS } from '../../utils/audit';
import InviteTechnicianModal from './InviteTechnicianModal';
import ConfirmationModal from '../common/ConfirmationModal';
import Toast from '../common/Toast';
import './TechnicianManagement.css';

/**
 * Technician Management Component
 * Handles listing, filtering, and managing technicians
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
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Load technicians on mount
  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  // Filter and sort technicians
  const filteredAndSortedTechnicians = useCallback(() => {
    let filtered = technicians.filter(tech => {
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
  }, [technicians, searchTerm, sortBy, sortOrder]);

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
      setConfirmationModal({
        title: t(`manager.techManagement.confirmations.${action}.title`),
        message: t(`manager.techManagement.confirmations.${action}.message`, { name: technicianName }),
        confirmText: t(`manager.techManagement.confirmations.${action}.confirm`),
        cancelText: t(`manager.techManagement.confirmations.${action}.cancel`),
        variant: action === 'remove' ? 'danger' : 'warning',
        showWarning: action === 'remove',
        warningText: action === 'remove' ? t(`manager.techManagement.confirmations.${action}.warning`) : null,
        onConfirm: () => executeTechnicianAction(technician, action, technicianName),
        onCancel: () => setConfirmationModal(null)
      });
    } else {
      await executeTechnicianAction(technician, action, technicianName);
    }
  };

  // Execute technician action
  const executeTechnicianAction = async (technician, action, technicianName) => {
    setConfirmationModal(null);
    
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
    setConfirmationModal({
      title: t(`manager.techManagement.confirmations.batch${action.charAt(0).toUpperCase() + action.slice(1)}.title`),
      message: t(`manager.techManagement.confirmations.batch${action.charAt(0).toUpperCase() + action.slice(1)}.message`, { count: selectedTechnicians.length }),
      confirmText: t(`manager.techManagement.confirmations.batch${action.charAt(0).toUpperCase() + action.slice(1)}.confirm`),
      cancelText: t(`manager.techManagement.confirmations.batch${action.charAt(0).toUpperCase() + action.slice(1)}.cancel`),
      variant: action === 'remove' ? 'danger' : 'warning',
      showWarning: action === 'remove',
      warningText: action === 'remove' ? t(`manager.techManagement.confirmations.batch${action.charAt(0).toUpperCase() + action.slice(1)}.warning`) : null,
      onConfirm: () => executeBatchAction(action),
      onCancel: () => setConfirmationModal(null)
    });
  };

  // Execute batch action
  const executeBatchAction = async (action) => {
    setConfirmationModal(null);
    
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

  const stats = getTechnicianStats();
  const filteredTechnicians = filteredAndSortedTechnicians();

  return (
    <div className="technician-management">
      {/* Header */}
      <div className="management-header mb-4">
        <div className="row align-items-center">
          <div className="col">
            <h2 className="h4 mb-1">{t('manager.techManagement.title')}</h2>
            <p className="text-muted mb-0">{t('manager.techManagement.subtitle')}</p>
          </div>
          <div className="col-auto">
            <button
              className="btn btn-primary"
              onClick={() => setShowInviteModal(true)}
            >
              <i className="bi bi-person-plus me-2"></i>
              {t('manager.techManagement.inviteTechnician')}
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="stat-card card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="stat-icon bg-primary me-3">
                  <i className="bi bi-people-fill text-white"></i>
                </div>
                <div>
                  <h5 className="mb-0">{stats.total}</h5>
                  <small className="text-muted">{t('manager.techManagement.totalTechnicians')}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="stat-icon bg-success me-3">
                  <i className="bi bi-check-circle-fill text-white"></i>
                </div>
                <div>
                  <h5 className="mb-0">{stats.active}</h5>
                  <small className="text-muted">{t('manager.techManagement.activeTechnicians')}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="stat-icon bg-warning me-3">
                  <i className="bi bi-clock-fill text-white"></i>
                </div>
                <div>
                  <h5 className="mb-0">{stats.pending}</h5>
                  <small className="text-muted">{t('manager.techManagement.pendingInvitations')}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="stat-icon bg-secondary me-3">
                  <i className="bi bi-pause-circle-fill text-white"></i>
                </div>
                <div>
                  <h5 className="mb-0">{stats.deactivated}</h5>
                  <small className="text-muted">{t('manager.techManagement.deactivatedTechnicians')}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section card mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-md-3">
              <label className="form-label">{t('common.search')}</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder={t('common.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-2">
              <label className="form-label">{t('common.status')}</label>
              <select
                className="form-select"
                value={technicianFilter}
                onChange={(e) => setTechnicianFilter(e.target.value)}
              >
                <option value="all">{t('manager.techManagement.filterAll')}</option>
                <option value="active">{t('manager.techManagement.filterActive')}</option>
                <option value="pending">{t('manager.techManagement.filterPending')}</option>
                <option value="deactivated">{t('manager.techManagement.filterDeactivated')}</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">{t('common.sortBy')}</label>
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">{t('manager.techManagement.name')}</option>
                <option value="email">{t('manager.techManagement.email')}</option>
                <option value="status">{t('manager.techManagement.status')}</option>
                <option value="jobType">{t('manager.techManagement.jobType')}</option>
                <option value="lastActive">{t('manager.techManagement.lastActive')}</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">{t('common.order')}</label>
              <select
                className="form-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="asc">{t('common.ascending')}</option>
                <option value="desc">{t('common.descending')}</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">&nbsp;</label>
              <div className="d-flex gap-2">
                {selectedTechnicians.length > 0 && (
                  <div className="dropdown">
                    <button
                      className="btn btn-outline-primary dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                    >
                      {t('manager.techManagement.batchActions')} ({selectedTechnicians.length})
                    </button>
                    <ul className="dropdown-menu">
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => handleBatchAction('activate')}
                        >
                          <i className="bi bi-check-circle me-2"></i>
                          {t('manager.techManagement.batchActivate')}
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => handleBatchAction('deactivate')}
                        >
                          <i className="bi bi-pause-circle me-2"></i>
                          {t('manager.techManagement.batchDeactivate')}
                        </button>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button
                          className="dropdown-item text-danger"
                          onClick={() => handleBatchAction('remove')}
                        >
                          <i className="bi bi-trash me-2"></i>
                          {t('manager.techManagement.batchRemove')}
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technicians Table */}
      <div className="technicians-table card">
        <div className="card-body p-0">
          {loadingTechnicians ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">{t('manager.techManagement.messages.loadingTechnicians')}</span>
              </div>
              <p className="mt-2 text-muted">{t('manager.techManagement.messages.loadingTechnicians')}</p>
            </div>
          ) : technicianError ? (
            <div className="alert alert-danger m-3" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {technicianError}
            </div>
          ) : filteredTechnicians.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-people display-1 text-muted"></i>
              <p className="mt-3 text-muted">{t('manager.techManagement.messages.noTechniciansFound')}</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowInviteModal(true)}
              >
                <i className="bi bi-person-plus me-2"></i>
                {t('manager.techManagement.inviteTechnician')}
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={selectedTechnicians.length === filteredTechnicians.length && filteredTechnicians.length > 0}
                          onChange={handleSelectAll}
                        />
                      </div>
                    </th>
                    <th>{t('manager.techManagement.name')}</th>
                    <th>{t('manager.techManagement.email')}</th>
                    <th>{t('manager.techManagement.jobType')}</th>
                    <th>{t('manager.techManagement.status')}</th>
                    <th>{t('manager.techManagement.lastActive')}</th>
                    <th>{t('manager.techManagement.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTechnicians.map((technician) => {
                    const status = getTechnicianStatus(technician);
                    return (
                      <tr key={technician.id}>
                        <td>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={selectedTechnicians.includes(technician.id)}
                              onChange={() => handleSelectTechnician(technician.id)}
                            />
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar me-3">
                              <div className="avatar-initials">
                                {(technician.first_name?.[0] || '') + (technician.last_name?.[0] || '')}
                              </div>
                            </div>
                            <div>
                              <div className="fw-medium">
                                {technician.first_name} {technician.last_name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{technician.email}</td>
                        <td>
                          <span className="badge bg-light text-dark">
                            {technician.job_type || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge bg-${status.class}`}>
                            {status.label}
                          </span>
                        </td>
                        <td>
                          {technician.last_login ? 
                            new Date(technician.last_login).toLocaleDateString() : 
                            t('common.never')
                          }
                        </td>
                        <td>
                          <div className="dropdown">
                            <button
                              className="btn btn-sm btn-outline-secondary dropdown-toggle"
                              type="button"
                              data-bs-toggle="dropdown"
                            >
                              {t('manager.techManagement.actions')}
                            </button>
                            <ul className="dropdown-menu">
                              {status.key === 'pending' && (
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleTechnicianAction(technician, 'reinvite')}
                                  >
                                    <i className="bi bi-envelope me-2"></i>
                                    {t('manager.techManagement.reinvite')}
                                  </button>
                                </li>
                              )}
                              {status.key === 'deactivated' && (
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleTechnicianAction(technician, 'activate')}
                                  >
                                    <i className="bi bi-check-circle me-2"></i>
                                    {t('manager.techManagement.activate')}
                                  </button>
                                </li>
                              )}
                              {status.key === 'active' && (
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleTechnicianAction(technician, 'deactivate')}
                                  >
                                    <i className="bi bi-pause-circle me-2"></i>
                                    {t('manager.techManagement.deactivate')}
                                  </button>
                                </li>
                              )}
                              <li><hr className="dropdown-divider" /></li>
                              <li>
                                <button
                                  className="dropdown-item text-danger"
                                  onClick={() => handleTechnicianAction(technician, 'remove')}
                                >
                                  <i className="bi bi-trash me-2"></i>
                                  {t('manager.techManagement.remove')}
                                </button>
                              </li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showInviteModal && (
        <InviteTechnicianModal
          show={showInviteModal}
          onHide={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false);
            setToast({
              type: 'success',
              message: t('manager.techManagement.inviteForm.invitationSent')
            });
          }}
        />
      )}

      {confirmationModal && (
        <ConfirmationModal
          show={true}
          title={confirmationModal.title}
          message={confirmationModal.message}
          confirmText={confirmationModal.confirmText}
          cancelText={confirmationModal.cancelText}
          variant={confirmationModal.variant}
          showWarning={confirmationModal.showWarning}
          warningText={confirmationModal.warningText}
          onConfirm={confirmationModal.onConfirm}
          onCancel={confirmationModal.onCancel}
        />
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          show={true}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default TechnicianManagement;
