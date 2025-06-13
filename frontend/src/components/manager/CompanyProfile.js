import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useManager } from '../../context/ManagerContext';
import { useAuth } from '../../context/AuthContext';
import { useManagerAccess } from '../../hooks/useManagerAccess';
import Toast from '../ui/Toast';
import './CompanyProfile.css';

/**
 * Company Profile Component
 * Simplified version showing basic company info and settings placeholder
 */
const CompanyProfile = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const {
    companyProfile,
    loadingCompany,
    companyError,
    fetchCompanyProfile
  } = useManager();
  
  const { validateAccess } = useManagerAccess();
  const [toast, setToast] = useState(null);
  
  // Load company data on mount
  useEffect(() => {
    console.log('CompanyProfile: Component mounted, fetching company profile...');
    fetchCompanyProfile();
  }, [fetchCompanyProfile]);

  // Validate access
  useEffect(() => {
    if (!validateAccess()) {
      setToast({
        type: 'error',
        message: t('common.insufficientPermissions'),
        duration: 5000
      });
    }
  }, [validateAccess, t]);

  const showToast = (type, message, duration = 3000) => {
    setToast({ type, message, duration });
  };

  if (loadingCompany) {
    return (
      <div className="company-profile-container">
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t('common.loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (companyError) {
    return (
      <div className="company-profile-container">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">{t('common.error')}</h4>
          <p>{companyError}</p>
          <button 
            className="btn btn-outline-danger"
            onClick={fetchCompanyProfile}
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="company-profile-container">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          onClose={() => setToast(null)}
        />
      )}

      {/* Company Profile Section */}
      <div className="card shadow-sm border mb-4">
        <div className="card-header bg-primary text-white">
          <h3 className="card-title mb-0">
            <i className="fas fa-building me-2"></i>
            {t('manager.companyProfile.title')}
          </h3>
        </div>
        
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <strong>{t('manager.companyProfile.companyName')}:</strong>
                <span className="ms-2">{companyProfile?.name || t('common.notAvailable')}</span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <strong>{t('manager.companyProfile.managerName')}:</strong>
                <span className="ms-2">{user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.email || t('common.notAvailable')}</span>
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <strong>{t('manager.companyProfile.technicianCount')}:</strong>
                <span className="ms-2">0</span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <strong>{t('manager.companyProfile.rateSheet')}:</strong>
                <div className="ms-2 d-inline-block">
                  <button className="btn btn-outline-primary btn-sm me-2" disabled>
                    <i className="fas fa-upload me-1"></i>
                    {t('manager.companyProfile.uploadRateSheet')}
                  </button>
                  <small className="text-muted">{t('manager.companyProfile.rateSheetNote')}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="card shadow-sm border">
        <div className="card-header bg-secondary text-white">
          <h3 className="card-title mb-0">
            <i className="fas fa-cog me-2"></i>
            {t('manager.settings.title')}
          </h3>
        </div>
        
        <div className="card-body">
          <div className="text-center py-4">
            <i className="fas fa-tools fa-3x text-muted mb-3"></i>
            <p className="text-muted mb-0">{t('manager.settings.comingSoon')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
