import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useManager } from '../../context/ManagerContext';
import { useManagerAccess } from '../../hooks/useManagerAccess';
import { auditTechnicianAction, AUDIT_ACTIONS } from '../../utils/audit';

/**
 * Invite Technician Modal Component
 * Handles technician invitation form
 */
const InviteTechnicianModal = ({ show, onHide, onSuccess }) => {
  const { t } = useLanguage();
  const { inviteTechnician } = useManager();
  const { validateAccess } = useManagerAccess();
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    jobType: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Job types
  const jobTypes = [
    'Electrician',
    'Plumber',
    'HVAC Technician',
    'Carpenter',
    'General Maintenance',
    'Appliance Repair',
    'Landscaper',
    'Painter',
    'Cleaner',
    'Other'
  ];

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

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = t('manager.techManagement.inviteForm.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('manager.techManagement.inviteForm.errors.emailInvalid');
    }

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = t('manager.techManagement.inviteForm.errors.firstNameRequired');
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = t('manager.techManagement.inviteForm.errors.firstNameTooShort');
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = t('manager.techManagement.inviteForm.errors.lastNameRequired');
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = t('manager.techManagement.inviteForm.errors.lastNameTooShort');
    }

    // Job type validation
    if (!formData.jobType) {
      newErrors.jobType = t('manager.techManagement.inviteForm.errors.jobTypeRequired');
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
    const { hasAccess } = await validateAccess('invitation_management');
    if (!hasAccess) {
      setErrors({ submit: t('common.accessDenied') });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await inviteTechnician({
        email: formData.email.trim(),
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        job_type: formData.jobType
      });

      if (result.success) {
        // Log the invitation
        await auditTechnicianAction(
          AUDIT_ACTIONS.TECHNICIAN_INVITED,
          null,
          `${formData.firstName} ${formData.lastName}`,
          {
            email: formData.email,
            job_type: formData.jobType,
            invitation_id: result.invitation?.id
          }
        );

        // Reset form
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          jobType: ''
        });

        // Call success callback
        onSuccess();
      } else {
        // Handle specific error cases
        if (result.error?.includes('already exists') || result.error?.includes('duplicate')) {
          setErrors({ email: t('manager.techManagement.inviteForm.errors.emailExists') });
        } else if (result.error?.includes('invalid email')) {
          setErrors({ email: t('manager.techManagement.inviteForm.errors.emailInvalid') });
        } else {
          setErrors({ submit: result.error || t('common.errorOccurred') });
        }
      }
    } catch (error) {
      console.error('Error inviting technician:', error);
      setErrors({ submit: t('common.errorOccurred') });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        jobType: ''
      });
      setErrors({});
      onHide();
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-person-plus me-2"></i>
              {t('manager.techManagement.inviteForm.title')}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={isSubmitting}
              aria-label={t('common.close')}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <p className="text-muted mb-4">
                {t('manager.techManagement.inviteForm.description')}
              </p>

              {errors.submit && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {errors.submit}
                </div>
              )}

              <div className="row g-3">
                {/* Email */}
                <div className="col-12">
                  <label htmlFor="email" className="form-label">
                    {t('manager.techManagement.inviteForm.email')} <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t('manager.techManagement.inviteForm.emailPlaceholder')}
                    disabled={isSubmitting}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <div className="invalid-feedback">
                      {errors.email}
                    </div>
                  )}
                  <div className="form-text">
                    {t('manager.techManagement.inviteForm.emailHelp')}
                  </div>
                </div>

                {/* First Name */}
                <div className="col-md-6">
                  <label htmlFor="firstName" className="form-label">
                    {t('manager.techManagement.inviteForm.firstName')} <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder={t('manager.techManagement.inviteForm.firstNamePlaceholder')}
                    disabled={isSubmitting}
                    autoComplete="given-name"
                  />
                  {errors.firstName && (
                    <div className="invalid-feedback">
                      {errors.firstName}
                    </div>
                  )}
                </div>

                {/* Last Name */}
                <div className="col-md-6">
                  <label htmlFor="lastName" className="form-label">
                    {t('manager.techManagement.inviteForm.lastName')} <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder={t('manager.techManagement.inviteForm.lastNamePlaceholder')}
                    disabled={isSubmitting}
                    autoComplete="family-name"
                  />
                  {errors.lastName && (
                    <div className="invalid-feedback">
                      {errors.lastName}
                    </div>
                  )}
                </div>

                {/* Job Type */}
                <div className="col-12">
                  <label htmlFor="jobType" className="form-label">
                    {t('manager.techManagement.inviteForm.jobType')} <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${errors.jobType ? 'is-invalid' : ''}`}
                    id="jobType"
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  >
                    <option value="">
                      {t('manager.techManagement.inviteForm.jobTypePlaceholder')}
                    </option>
                    {jobTypes.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.jobType && (
                    <div className="invalid-feedback">
                      {errors.jobType}
                    </div>
                  )}
                  <div className="form-text">
                    {t('manager.techManagement.inviteForm.jobTypeHelp')}
                  </div>
                </div>
              </div>

              {/* Information Box */}
              <div className="alert alert-info mt-4" role="alert">
                <i className="bi bi-info-circle me-2"></i>
                <strong>{t('manager.techManagement.inviteForm.infoTitle')}</strong>
                <ul className="mb-0 mt-2">
                  <li>{t('manager.techManagement.inviteForm.info1')}</li>
                  <li>{t('manager.techManagement.inviteForm.info2')}</li>
                  <li>{t('manager.techManagement.inviteForm.info3')}</li>
                </ul>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {t('manager.techManagement.inviteForm.sending')}
                  </>
                ) : (
                  <>
                    <i className="bi bi-envelope me-2"></i>
                    {t('manager.techManagement.inviteForm.sendInvitation')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InviteTechnicianModal;
