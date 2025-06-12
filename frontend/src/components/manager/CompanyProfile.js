import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useManager } from '../../context/ManagerContext';
import { useManagerAccess } from '../../hooks/useManagerAccess';
import { auditCompanyAction, AUDIT_ACTIONS } from '../../utils/audit';
import Toast from '../ui/Toast';
import './CompanyProfile.css';

/**
 * Company Profile Component
 * Handles company profile editing and logo upload
 */
const CompanyProfile = () => {
  const { t } = useLanguage();
  const {
    companyProfile,
    loadingCompany,
    companyError,
    fetchCompanyProfile,
    updateCompanyProfile,
    uploadCompanyLogo
  } = useManager();
  
  const { validateAccess } = useManagerAccess();
  const fileInputRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Logo state
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);

  // Load company data on mount
  useEffect(() => {
    fetchCompanyProfile();
  }, [fetchCompanyProfile]);

  // Update form when company data changes
  useEffect(() => {
    if (companyProfile) {
      const data = {
        name: companyProfile.name || '',
        address: companyProfile.address || '',
        phone: companyProfile.phone || '',
        email: companyProfile.email || '',
        website: companyProfile.website || ''
      };
      setFormData(data);
      setOriginalData(data);
      setLogoPreview(companyProfile.logo_url || null);
    }
  }, [companyProfile]);

  // Check for changes
  useEffect(() => {
    const changed = Object.keys(formData).some(key => 
      formData[key] !== originalData[key]
    ) || logoFile !== null;
    setHasChanges(changed);
  }, [formData, originalData, logoFile]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Handle logo file selection
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setToast({
        type: 'error',
        message: t('manager.companyProfile.logoForm.errors.invalidFileType')
      });
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      setToast({
        type: 'error',
        message: t('manager.companyProfile.logoForm.errors.fileTooLarge')
      });
      return;
    }

    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Remove logo
  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(companyProfile?.logo_url || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Company name validation
    if (!formData.name.trim()) {
      newErrors.name = t('manager.companyProfile.form.errors.nameRequired');
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t('manager.companyProfile.form.errors.nameTooShort');
    }

    // Email validation (optional but must be valid if provided)
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('manager.companyProfile.form.errors.emailInvalid');
    }

    // Phone validation (optional but must be valid if provided)
    if (formData.phone.trim() && !/^[\d\s\-+()]+$/.test(formData.phone)) {
      newErrors.phone = t('manager.companyProfile.form.errors.phoneInvalid');
    }

    // Website validation (optional but must be valid if provided)
    if (formData.website.trim() && !/^https?:\/\/.+\..+/.test(formData.website)) {
      newErrors.website = t('manager.companyProfile.form.errors.websiteInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check access
    const { hasAccess } = await validateAccess('company_profile_edit');
    if (!hasAccess) {
      setToast({
        type: 'error',
        message: t('common.accessDenied')
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Upload logo first if there's a new one
      let logoUrl = companyProfile?.logo_url;
      if (logoFile) {
        setLogoUploading(true);
        const logoResult = await uploadCompanyLogo(logoFile);
        if (logoResult.success) {
          logoUrl = logoResult.logo_url;
        } else {
          throw new Error(logoResult.error || 'Logo upload failed');
        }
        setLogoUploading(false);
      }

      // Update company profile
      const updateData = {
        ...formData,
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        website: formData.website.trim()
      };

      const result = await updateCompanyProfile(updateData);

      if (result.success) {
        // Log the update
        const changes = {};
        Object.keys(formData).forEach(key => {
          if (formData[key] !== originalData[key]) {
            changes[key] = {
              from: originalData[key],
              to: formData[key]
            };
          }
        });

        if (logoFile) {
          changes.logo = {
            from: companyProfile?.logo_url || null,
            to: logoUrl
          };
        }

        await auditCompanyAction(
          AUDIT_ACTIONS.COMPANY_UPDATED,
          companyProfile.id,
          companyProfile.name,
          { changes }
        );

        // Update original data
        setOriginalData(formData);
        setLogoFile(null);

        setToast({
          type: 'success',
          message: t('manager.companyProfile.messages.updateSuccess')
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating company profile:', error);
      setToast({
        type: 'error',
        message: error.message || t('common.errorOccurred')
      });
    } finally {
      setIsSubmitting(false);
      setLogoUploading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData(originalData);
    setErrors({});
    setLogoFile(null);
    setLogoPreview(companyProfile?.logo_url || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loadingCompany) {
    return (
      <div className="company-profile">
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">{t('manager.companyProfile.messages.loadingCompany')}</span>
          </div>
          <p className="mt-2 text-muted">{t('manager.companyProfile.messages.loadingCompany')}</p>
        </div>
      </div>
    );
  }

  if (companyError) {
    return (
      <div className="company-profile">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {companyError}
        </div>
      </div>
    );
  }

  return (
    <div className="company-profile">
      {/* Header */}
      <div className="profile-header mb-4">
        <div className="row align-items-center">
          <div className="col">
            <h2 className="h4 mb-1">{t('manager.companyProfile.title')}</h2>
            <p className="text-muted mb-0">{t('manager.companyProfile.subtitle')}</p>
          </div>
          {hasChanges && (
            <div className="col-auto">
              <span className="badge bg-warning">
                <i className="bi bi-exclamation-circle me-1"></i>
                {t('manager.companyProfile.unsavedChanges')}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="row">
        {/* Company Logo */}
        <div className="col-lg-4 mb-4">
          <div className="logo-section card">
            <div className="card-body text-center">
              <h5 className="card-title">{t('manager.companyProfile.logoForm.title')}</h5>
              
              <div className="logo-preview mb-3">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt={t('manager.companyProfile.logoForm.logoAlt')}
                    className="company-logo-preview"
                  />
                ) : (
                  <div className="logo-placeholder">
                    <i className="bi bi-building display-1 text-muted"></i>
                    <p className="text-muted mt-2">{t('manager.companyProfile.logoForm.noLogo')}</p>
                  </div>
                )}
              </div>

              <div className="logo-actions">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoChange}
                  accept="image/*"
                  className="d-none"
                />
                <button
                  type="button"
                  className="btn btn-outline-primary me-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={logoUploading}
                >
                  <i className="bi bi-upload me-2"></i>
                  {logoPreview ? t('manager.companyProfile.logoForm.changeLogo') : t('manager.companyProfile.logoForm.uploadLogo')}
                </button>
                {logoFile && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleRemoveLogo}
                    disabled={logoUploading}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    {t('manager.companyProfile.logoForm.removeLogo')}
                  </button>
                )}
              </div>

              <div className="form-text mt-2">
                {t('manager.companyProfile.logoForm.requirements')}
              </div>
            </div>
          </div>
        </div>

        {/* Company Information Form */}
        <div className="col-lg-8">
          <div className="profile-form card">
            <div className="card-body">
              <h5 className="card-title">{t('manager.companyProfile.form.title')}</h5>
              
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {/* Company Name */}
                  <div className="col-12">
                    <label htmlFor="name" className="form-label">
                      {t('manager.companyProfile.form.name')} <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      autoComplete="organization"
                    />
                    {errors.name && (
                      <div className="invalid-feedback">
                        {errors.name}
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div className="col-12">
                    <label htmlFor="address" className="form-label">
                      {t('manager.companyProfile.form.address')}
                    </label>
                    <textarea
                      className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                      id="address"
                      name="address"
                      rows="3"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      autoComplete="street-address"
                    ></textarea>
                    {errors.address && (
                      <div className="invalid-feedback">
                        {errors.address}
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="col-md-6">
                    <label htmlFor="phone" className="form-label">
                      {t('manager.companyProfile.form.phone')}
                    </label>
                    <input
                      type="tel"
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      autoComplete="tel"
                    />
                    {errors.phone && (
                      <div className="invalid-feedback">
                        {errors.phone}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="col-md-6">
                    <label htmlFor="email" className="form-label">
                      {t('manager.companyProfile.form.email')}
                    </label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      autoComplete="email"
                    />
                    {errors.email && (
                      <div className="invalid-feedback">
                        {errors.email}
                      </div>
                    )}
                  </div>

                  {/* Website */}
                  <div className="col-12">
                    <label htmlFor="website" className="form-label">
                      {t('manager.companyProfile.form.website')}
                    </label>
                    <input
                      type="url"
                      className={`form-control ${errors.website ? 'is-invalid' : ''}`}
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                      disabled={isSubmitting}
                      autoComplete="url"
                    />
                    {errors.website && (
                      <div className="invalid-feedback">
                        {errors.website}
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions mt-4 pt-3 border-top">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      {hasChanges && (
                        <small className="text-muted">
                          <i className="bi bi-info-circle me-1"></i>
                          {t('manager.companyProfile.form.hasChanges')}
                        </small>
                      )}
                    </div>
                    <div>
                      <button
                        type="button"
                        className="btn btn-outline-secondary me-2"
                        onClick={handleCancel}
                        disabled={isSubmitting || !hasChanges}
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting || !hasChanges}
                      >
                        {isSubmitting || logoUploading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            {logoUploading ? t('manager.companyProfile.form.uploading') : t('manager.companyProfile.form.saving')}
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-lg me-2"></i>
                            {t('manager.companyProfile.form.saveChanges')}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

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

export default CompanyProfile;
