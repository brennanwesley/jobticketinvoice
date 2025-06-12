import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useManager } from '../../context/ManagerContext';
import { useManagerAccess } from '../../hooks/useManagerAccess';
import { fetchAuditLogs, exportAuditLogs, AUDIT_CATEGORIES } from '../../utils/audit';
import Toast from '../ui/Toast';
import './AuditLogs.css';

/**
 * Audit Logs Component
 * Displays audit logs with filtering, pagination, and export functionality
 */
const AuditLogs = () => {
  const { t } = useLanguage();
  const { auditLogs, loadingAuditLogs, auditError } = useManager();
  const { validateAccess } = useManagerAccess();
  
  // Local state
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    category: '',
    action: '',
    user: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  
  // Sorting
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Export state
  const [exporting, setExporting] = useState(false);

  // Load audit logs
  const loadAuditLogs = useCallback(async () => {
    const { hasAccess } = await validateAccess('audit_logs');
    if (!hasAccess) {
      setError(t('common.accessDenied'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sort_by: sortBy,
        sort_order: sortOrder,
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const result = await fetchAuditLogs(params);
      
      if (result.success) {
        setLogs(result.logs || []);
        setPagination(prev => ({
          ...prev,
          total: result.total || 0,
          totalPages: Math.ceil((result.total || 0) / prev.limit)
        }));
      } else {
        throw new Error(result.error || 'Failed to fetch audit logs');
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
      setError(error.message || t('common.errorOccurred'));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sortBy, sortOrder, filters, validateAccess, t]);

  // Load logs on mount and when dependencies change
  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };

  // Handle sort change
  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Handle export
  const handleExport = async () => {
    const { hasAccess } = await validateAccess('data_export');
    if (!hasAccess) {
      setToast({
        type: 'error',
        message: t('common.accessDenied')
      });
      return;
    }

    setExporting(true);

    try {
      const params = {
        ...filters,
        sort_by: sortBy,
        sort_order: sortOrder
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const result = await exportAuditLogs(params);
      
      if (result.success) {
        // Create download link
        const blob = new Blob([result.csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setToast({
          type: 'success',
          message: t('manager.auditLogs.messages.exportSuccess')
        });
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      setToast({
        type: 'error',
        message: error.message || t('common.errorOccurred')
      });
    } finally {
      setExporting(false);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      category: '',
      action: '',
      user: '',
      dateFrom: '',
      dateTo: '',
      search: ''
    });
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };

  // Format log entry
  const formatLogEntry = (log) => {
    const timestamp = new Date(log.timestamp).toLocaleString();
    const category = log.category || 'System';
    const action = log.action || 'Unknown';
    const user = log.user_name || log.user_email || 'System';
    const details = log.details ? JSON.stringify(log.details, null, 2) : '';
    
    return {
      ...log,
      formattedTimestamp: timestamp,
      formattedCategory: category,
      formattedAction: action,
      formattedUser: user,
      formattedDetails: details
    };
  };

  // Get category badge class
  const getCategoryBadgeClass = (category) => {
    switch (category?.toLowerCase()) {
      case 'security': return 'bg-danger';
      case 'user': return 'bg-primary';
      case 'company': return 'bg-info';
      case 'technician': return 'bg-success';
      case 'system': return 'bg-secondary';
      default: return 'bg-light text-dark';
    }
  };

  // Get unique categories and actions for filters
  const getFilterOptions = () => {
    const categories = [...new Set(logs.map(log => log.category).filter(Boolean))];
    const actions = [...new Set(logs.map(log => log.action).filter(Boolean))];
    const users = [...new Set(logs.map(log => log.user_name || log.user_email).filter(Boolean))];
    
    return { categories, actions, users };
  };

  const { categories, actions, users } = getFilterOptions();

  return (
    <div className="audit-logs">
      {/* Header */}
      <div className="logs-header mb-4">
        <div className="row align-items-center">
          <div className="col">
            <h2 className="h4 mb-1">{t('manager.auditLogs.title')}</h2>
            <p className="text-muted mb-0">{t('manager.auditLogs.subtitle')}</p>
          </div>
          <div className="col-auto">
            <button
              className="btn btn-outline-primary"
              onClick={handleExport}
              disabled={exporting || logs.length === 0}
            >
              {exporting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {t('manager.auditLogs.exporting')}
                </>
              ) : (
                <>
                  <i className="bi bi-download me-2"></i>
                  {t('manager.auditLogs.exportLogs')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section card mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-2">
              <label className="form-label">{t('manager.auditLogs.filters.category')}</label>
              <select
                className="form-select"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">{t('common.all')}</option>
                {Object.values(AUDIT_CATEGORIES).map(category => (
                  <option key={category} value={category}>
                    {t(`manager.auditLogs.categories.${category.toLowerCase()}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">{t('manager.auditLogs.filters.action')}</label>
              <select
                className="form-select"
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
              >
                <option value="">{t('common.all')}</option>
                {actions.map(action => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">{t('manager.auditLogs.filters.user')}</label>
              <select
                className="form-select"
                value={filters.user}
                onChange={(e) => handleFilterChange('user', e.target.value)}
              >
                <option value="">{t('common.all')}</option>
                {users.map(user => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">{t('manager.auditLogs.filters.dateFrom')}</label>
              <input
                type="date"
                className="form-control"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">{t('manager.auditLogs.filters.dateTo')}</label>
              <input
                type="date"
                className="form-control"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-secondary"
                  onClick={clearFilters}
                  title={t('manager.auditLogs.clearFilters')}
                >
                  <i className="bi bi-x-circle"></i>
                </button>
                <button
                  className="btn btn-primary"
                  onClick={loadAuditLogs}
                  disabled={loading}
                  title={t('common.refresh')}
                >
                  <i className="bi bi-arrow-clockwise"></i>
                </button>
              </div>
            </div>
          </div>
          
          <div className="row g-3 mt-2">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder={t('manager.auditLogs.filters.searchPlaceholder')}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center gap-3">
                <small className="text-muted">
                  {t('manager.auditLogs.totalLogs', { count: pagination.total })}
                </small>
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  value={pagination.limit}
                  onChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <small className="text-muted">{t('manager.auditLogs.perPage')}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="logs-table card">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">{t('manager.auditLogs.messages.loadingLogs')}</span>
              </div>
              <p className="mt-2 text-muted">{t('manager.auditLogs.messages.loadingLogs')}</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger m-3" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-journal-text display-1 text-muted"></i>
              <p className="mt-3 text-muted">{t('manager.auditLogs.messages.noLogsFound')}</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th 
                      className="sortable"
                      onClick={() => handleSortChange('timestamp')}
                    >
                      {t('manager.auditLogs.timestamp')}
                      {sortBy === 'timestamp' && (
                        <i className={`bi bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th 
                      className="sortable"
                      onClick={() => handleSortChange('category')}
                    >
                      {t('manager.auditLogs.category')}
                      {sortBy === 'category' && (
                        <i className={`bi bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th 
                      className="sortable"
                      onClick={() => handleSortChange('action')}
                    >
                      {t('manager.auditLogs.action')}
                      {sortBy === 'action' && (
                        <i className={`bi bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th 
                      className="sortable"
                      onClick={() => handleSortChange('user_name')}
                    >
                      {t('manager.auditLogs.user')}
                      {sortBy === 'user_name' && (
                        <i className={`bi bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th>{t('manager.auditLogs.description')}</th>
                    <th>{t('manager.auditLogs.ipAddress')}</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const formattedLog = formatLogEntry(log);
                    return (
                      <tr key={log.id}>
                        <td>
                          <small className="text-muted">
                            {formattedLog.formattedTimestamp}
                          </small>
                        </td>
                        <td>
                          <span className={`badge ${getCategoryBadgeClass(log.category)}`}>
                            {t(`manager.auditLogs.categories.${(log.category || 'system').toLowerCase()}`)}
                          </span>
                        </td>
                        <td>
                          <code className="small">{log.action}</code>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar-sm me-2">
                              <div className="avatar-initials-sm">
                                {(formattedLog.formattedUser[0] || 'S').toUpperCase()}
                              </div>
                            </div>
                            <div>
                              <div className="small fw-medium">{formattedLog.formattedUser}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="log-description">
                            {log.description || log.action}
                            {log.details && (
                              <button
                                className="btn btn-link btn-sm p-0 ms-2"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#details-${log.id}`}
                                aria-expanded="false"
                              >
                                <i className="bi bi-info-circle"></i>
                              </button>
                            )}
                          </div>
                          {log.details && (
                            <div className="collapse mt-2" id={`details-${log.id}`}>
                              <div className="card card-body small">
                                <pre className="mb-0">{formattedLog.formattedDetails}</pre>
                              </div>
                            </div>
                          )}
                        </td>
                        <td>
                          <small className="text-muted font-monospace">
                            {log.ip_address || 'N/A'}
                          </small>
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div>
            <small className="text-muted">
              {t('manager.auditLogs.showingResults', {
                start: (pagination.page - 1) * pagination.limit + 1,
                end: Math.min(pagination.page * pagination.limit, pagination.total),
                total: pagination.total
              })}
            </small>
          </div>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
              </li>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i;
                return (
                  <li key={page} className={`page-item ${pagination.page === page ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  </li>
                );
              })}
              <li className={`page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
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

export default AuditLogs;
