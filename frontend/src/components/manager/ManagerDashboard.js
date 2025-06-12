import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useManager } from '../../context/ManagerContext';
import { useManagerAccess } from '../../hooks/useManagerAccess';
import TechnicianManagement from './TechnicianManagement';
import CompanyProfile from './CompanyProfile';
import AuditLogs from './AuditLogs';
import './ManagerDashboard.css';

/**
 * Main Manager Dashboard Component
 * Provides navigation and content area for manager-specific features
 */
const ManagerDashboard = () => {
  const { t } = useLanguage();
  const { hasManagerAccess, getTechnicianStats } = useManager();
  const { validateAccess } = useManagerAccess();
  const [activeTab, setActiveTab] = useState('overview');
  const [accessValidated, setAccessValidated] = useState(false);
  const [accessError, setAccessError] = useState(null);

  // Validate access on component mount
  useEffect(() => {
    const checkAccess = async () => {
      const { hasAccess, reason } = await validateAccess('manager_features');
      if (hasAccess) {
        setAccessValidated(true);
      } else {
        setAccessError(reason);
      }
    };
    
    checkAccess();
  }, [validateAccess]);

  // Show loading or access denied if not validated
  if (!accessValidated) {
    if (accessError) {
      return (
        <div className="manager-dashboard">
          <div className="container-fluid py-4">
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">{t('common.accessDenied')}</h4>
              <p>{accessError}</p>
              <hr />
              <p className="mb-0">{t('common.contactAdmin')}</p>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="manager-dashboard">
        <div className="container-fluid py-4">
          <div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">{t('common.loading')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const techStats = getTechnicianStats();

  // Tab navigation items
  const tabItems = [
    {
      id: 'overview',
      label: t('manager.overview'),
      icon: 'bi-speedometer2',
      component: <OverviewTab stats={techStats} />
    },
    {
      id: 'technicians',
      label: t('manager.technicians'),
      icon: 'bi-people',
      component: <TechnicianManagement />
    },
    {
      id: 'company',
      label: t('manager.company'),
      icon: 'bi-building',
      component: <CompanyProfile />
    },
    {
      id: 'audit',
      label: t('audit.title'),
      icon: 'bi-clipboard-data',
      component: <AuditLogs />
    }
  ];

  return (
    <div className="manager-dashboard">
      <div className="container-fluid">
        {/* Dashboard Header */}
        <div className="dashboard-header py-3 mb-4">
          <div className="row align-items-center">
            <div className="col">
              <h1 className="h3 mb-0">{t('manager.dashboard')}</h1>
              <p className="text-muted mb-0">{t('manager.dashboardSubtitle')}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="dashboard-tabs mb-4">
          <ul className="nav nav-tabs nav-tabs-custom" role="tablist">
            {tabItems.map((tab) => (
              <li className="nav-item" key={tab.id}>
                <button
                  className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                >
                  <i className={`bi ${tab.icon} me-2`}></i>
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Tab Content */}
        <div className="dashboard-content">
          {tabItems.find(tab => tab.id === activeTab)?.component}
        </div>
      </div>
    </div>
  );
};

/**
 * Overview Tab Component
 * Shows dashboard statistics and quick actions
 */
const OverviewTab = ({ stats }) => {
  const { t } = useLanguage();
  const { companyProfile, loadingCompany } = useManager();

  return (
    <div className="overview-tab">
      <div className="row">
        {/* Statistics Cards */}
        <div className="col-12 mb-4">
          <div className="row g-3">
            <div className="col-md-3">
              <div className="stat-card card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="stat-icon bg-primary">
                      <i className="bi bi-people-fill text-white"></i>
                    </div>
                    <div className="ms-3">
                      <h5 className="card-title mb-0">{stats.total}</h5>
                      <p className="card-text text-muted">{t('manager.techManagement.totalTechnicians')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="stat-card card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="stat-icon bg-success">
                      <i className="bi bi-check-circle-fill text-white"></i>
                    </div>
                    <div className="ms-3">
                      <h5 className="card-title mb-0">{stats.active}</h5>
                      <p className="card-text text-muted">{t('manager.techManagement.activeTechnicians')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="stat-card card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="stat-icon bg-warning">
                      <i className="bi bi-clock-fill text-white"></i>
                    </div>
                    <div className="ms-3">
                      <h5 className="card-title mb-0">{stats.pending}</h5>
                      <p className="card-text text-muted">{t('manager.techManagement.pendingInvitations')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="stat-card card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="stat-icon bg-secondary">
                      <i className="bi bi-pause-circle-fill text-white"></i>
                    </div>
                    <div className="ms-3">
                      <h5 className="card-title mb-0">{stats.deactivated}</h5>
                      <p className="card-text text-muted">{t('manager.techManagement.deactivatedTechnicians')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Info Card */}
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">{t('manager.companyProfile.title')}</h5>
            </div>
            <div className="card-body">
              {loadingCompany ? (
                <div className="text-center">
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">{t('common.loading')}</span>
                  </div>
                </div>
              ) : companyProfile ? (
                <div>
                  <div className="d-flex align-items-center mb-3">
                    {companyProfile.logo_url && (
                      <img 
                        src={companyProfile.logo_url} 
                        alt={companyProfile.name}
                        className="company-logo me-3"
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                    )}
                    <div>
                      <h6 className="mb-1">{companyProfile.name}</h6>
                      <p className="text-muted mb-0">{companyProfile.email}</p>
                    </div>
                  </div>
                  {companyProfile.phone && (
                    <p className="mb-2">
                      <i className="bi bi-telephone me-2"></i>
                      {companyProfile.phone}
                    </p>
                  )}
                  {companyProfile.website && (
                    <p className="mb-2">
                      <i className="bi bi-globe me-2"></i>
                      <a href={companyProfile.website} target="_blank" rel="noopener noreferrer">
                        {companyProfile.website}
                      </a>
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted">{t('common.noDataAvailable')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">{t('common.quickActions')}</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    // This would be handled by parent component to switch tabs
                    const event = new CustomEvent('switchTab', { detail: 'technicians' });
                    window.dispatchEvent(event);
                  }}
                >
                  <i className="bi bi-person-plus me-2"></i>
                  {t('manager.techManagement.inviteTechnician')}
                </button>
                
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    const event = new CustomEvent('switchTab', { detail: 'company' });
                    window.dispatchEvent(event);
                  }}
                >
                  <i className="bi bi-building me-2"></i>
                  {t('manager.companyProfile.title')}
                </button>
                
                <button 
                  className="btn btn-outline-info"
                  onClick={() => {
                    const event = new CustomEvent('switchTab', { detail: 'audit' });
                    window.dispatchEvent(event);
                  }}
                >
                  <i className="bi bi-clipboard-data me-2"></i>
                  {t('audit.title')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
