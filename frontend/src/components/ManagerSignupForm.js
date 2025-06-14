import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Manager Signup Form component
 * Handles registration for manager users with company logo upload
 */
const ManagerSignupForm = () => {
  const { t } = useLanguage();
  const { register, uploadLogo } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company_name: '',
    password: '',
    confirmPassword: '',
  });
  
  // Logo state
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  
  // Error and loading states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  // Handle logo file selection
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ 
        ...prev, 
        logo: t('validation.invalidFileType') 
      }));
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ 
        ...prev, 
        logo: t('validation.fileTooLarge') 
      }));
      return;
    }
    
    // Set logo file and create preview
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
    
    // Clear logo error
    if (errors.logo) {
      setErrors(prev => ({ ...prev, logo: null }));
    }
  };
  
  // Clear logo selection
  const handleClearLogo = () => {
    setLogo(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = t('validation.nameRequired');
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = t('validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('validation.emailInvalid');
    }
    
    // Company name validation
    if (!formData.company_name.trim()) {
      newErrors.company_name = t('validation.companyNameRequired');
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = t('validation.passwordRequired');
    } else if (formData.password.length < 8) {
      newErrors.password = t('validation.passwordLength');
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordsDoNotMatch');
    }
    
    // Logo validation (optional for initial signup)
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Register user
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'manager',
        company_name: formData.company_name
      });
      
      if (result.success) {
        console.log('Manager signup successful, user data:', result.user);
        
        // Upload logo if provided
        if (logo) {
          const logoResult = await uploadLogo(logo);
          if (!logoResult.success) {
            console.warn('Logo upload failed:', logoResult.error);
            // Continue anyway as this is not critical
          }
        }
        
        // Wait a moment for authentication state to be fully set
        setTimeout(() => {
          console.log('Redirecting to manager dashboard...');
          navigate('/manager-dashboard');
        }, 100);
      } else {
        setSubmitError(result.error);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitError(t('errors.registrationFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto bg-slate-800 rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-center mb-6">
        {t('signup.managerSignup')}
      </h2>
      
      {submitError && (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
          {submitError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
            {t('signup.name')} *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 bg-slate-700 border ${errors.name ? 'border-red-500' : 'border-gray-600'} rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-400`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>
        
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            {t('signup.email')} *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2 bg-slate-700 border ${errors.email ? 'border-red-500' : 'border-gray-600'} rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-400`}
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>
        
        {/* Company Name Field */}
        <div>
          <label htmlFor="company_name" className="block text-sm font-medium text-gray-300 mb-1">
            {t('signup.company')} *
          </label>
          <input
            type="text"
            id="company_name"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            className={`w-full px-4 py-2 bg-slate-700 border ${errors.company_name ? 'border-red-500' : 'border-gray-600'} rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-400`}
          />
          {errors.company_name && <p className="mt-1 text-sm text-red-500">{errors.company_name}</p>}
        </div>
        
        {/* Logo Upload Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {t('signup.companyLogo')}
          </label>
          <div className={`border-2 border-dashed rounded-lg p-4 ${errors.logo ? 'border-red-500' : 'border-gray-600'} hover:border-orange-500 transition-colors`}>
            {logoPreview ? (
              <div className="flex flex-col items-center">
                <img 
                  src={logoPreview} 
                  alt="Company logo preview" 
                  className="max-h-32 max-w-full mb-2 rounded"
                />
                <button
                  type="button"
                  onClick={handleClearLogo}
                  className="text-sm text-red-500 hover:text-red-400"
                >
                  {t('common.remove')}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-1 text-sm text-gray-400">
                  {t('signup.dragDropOrClick')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {t('signup.logoRequirements')}
                </p>
                <input
                  type="file"
                  id="logo"
                  name="logo"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleLogoChange}
                  ref={fileInputRef}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 inline-flex items-center px-3 py-1 border border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-300 bg-slate-700 hover:bg-slate-600 transition-colors"
                >
                  {t('signup.selectFile')}
                </button>
              </div>
            )}
          </div>
          {errors.logo && <p className="mt-1 text-sm text-red-500">{errors.logo}</p>}
        </div>
        
        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
            {t('signup.password')} * <span className="text-gray-400 font-normal">(minimum of 8 characters required)</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-4 py-2 bg-slate-700 border ${errors.password ? 'border-red-500' : 'border-gray-600'} rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-400`}
          />
          {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
        </div>
        
        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
            {t('signup.confirmPassword')} *
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full px-4 py-2 bg-slate-700 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-600'} rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-400`}
          />
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t('common.submitting') : 'Create Account'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <Link to="/signup/role" className="text-orange-500 hover:text-orange-400 font-medium">
          &larr; {t('common.back')}
        </Link>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-gray-400 text-sm mb-2">
          {t('signup.alreadyHaveAccount')}
        </p>
        <Link to="/login" className="text-orange-500 hover:text-orange-400 font-medium">
          {t('signup.loginInstead')}
        </Link>
      </div>
    </div>
  );
};

export default ManagerSignupForm;
