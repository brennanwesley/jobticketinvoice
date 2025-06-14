import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner, Button, Input } from './ui';

/**
 * Technician Signup Page
 * Handles token-based invitation acceptance for field technicians
 */
const TechnicianSignupPage = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get token from URL params
  const token = searchParams.get('token');
  
  // State management
  const [invitationData, setInvitationData] = useState(null);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [tokenError, setTokenError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });
  
  // Form validation errors
  const [errors, setErrors] = useState({});

  // Validate token on component mount
  useEffect(() => {
    if (!token) {
      setTokenError(t('techSignup.errors.noToken'));
      setIsValidatingToken(false);
      return;
    }

    validateInvitationToken();
  }, [token]);

  // Validate invitation token
  const validateInvitationToken = async () => {
    try {
      setIsValidatingToken(true);
      setTokenError(null);

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${apiUrl}/invitations/check/${token}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.valid) {
        setTokenError(result.message || t('techSignup.errors.invalidToken'));
        return;
      }

      // Token is valid, set invitation data and prefill form
      setInvitationData(result.invitation);
      setFormData(prev => ({
        ...prev,
        name: result.invitation.name || ''
      }));

    } catch (error) {
      console.error('Token validation error:', error);
      setTokenError(t('techSignup.errors.validationFailed'));
    } finally {
      setIsValidatingToken(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = t('validation.nameRequired');
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t('validation.nameMinLength');
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = t('validation.passwordRequired');
    } else if (formData.password.length < 8) {
      newErrors.password = t('validation.passwordMinLength');
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordMismatch');
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

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${apiUrl}/invitations/accept/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          password: formData.password,
          name: formData.name.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const userData = await response.json();
      
      // Account created successfully, now log in the user
      try {
        await login(invitationData.email, formData.password);
        
        // Navigate to appropriate dashboard based on role
        navigate('/dashboard');
      } catch (loginError) {
        console.error('Auto-login error:', loginError);
        // Account was created but auto-login failed, redirect to login page with success message
        navigate('/login', { 
          state: { 
            message: t('techSignup.errors.accountCreated'),
            email: invitationData.email 
          }
        });
      }

    } catch (error) {
      console.error('Signup error:', error);
      setSubmitError(error.message || t('techSignup.errors.signupFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render loading state
  if (isValidatingToken) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center">
            <LoadingSpinner size="lg" variant="primary" />
            <h2 className="mt-4 text-xl font-semibold text-white">
              {t('techSignup.validatingInvitation')}
            </h2>
            <p className="mt-2 text-gray-400">
              {t('techSignup.pleaseWait')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state for invalid token
  if (tokenError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              {t('techSignup.invalidInvitation')}
            </h2>
            <p className="text-gray-400 mb-6">
              {tokenError}
            </p>
            <Button
              onClick={() => navigate('/')}
              variant="primary"
              className="w-full"
            >
              {t('common.goHome')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render signup form
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            {t('techSignup.title')}
          </h1>
          <p className="text-gray-400">
            {t('techSignup.subtitle')}
          </p>
        </div>

        {/* Invitation Info */}
        {invitationData && (
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              {t('techSignup.invitationDetails')}
            </h3>
            <div className="space-y-1 text-sm">
              <p className="text-white">
                <span className="text-gray-400">{t('common.email')}:</span> {invitationData.email}
              </p>
              {invitationData.job_type && (
                <p className="text-white">
                  <span className="text-gray-400">{t('common.jobType')}:</span> {invitationData.job_type}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              {t('common.fullName')} *
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder={t('techSignup.placeholders.fullName')}
              error={errors.name}
              required
              className="w-full"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              {t('common.password')} *
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder={t('techSignup.placeholders.password')}
              error={errors.password}
              required
              className="w-full"
            />
            <p className="mt-1 text-xs text-gray-400">
              {t('validation.passwordRequirements')}
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              {t('common.confirmPassword')} *
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder={t('techSignup.placeholders.confirmPassword')}
              error={errors.confirmPassword}
              required
              className="w-full"
            />
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-3">
              <p className="text-red-200 text-sm">{submitError}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" className="mr-2" />
                {t('techSignup.creating')}
              </div>
            ) : (
              t('techSignup.createAccount')
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            {t('techSignup.footer')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TechnicianSignupPage;
