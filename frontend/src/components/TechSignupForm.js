import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { models } from '../models/user';

/**
 * Tech Signup Form component
 * Handles registration for technician users
 */
const TechSignupForm = () => {
  const { t } = useLanguage();
  const { register } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company_name: '',
    password: '',
    confirmPassword: '',
    job_type: '',
  });
  
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
    
    // Company name validation
    if (!formData.company_name.trim()) {
      newErrors.company_name = t('validation.companyRequired');
    }
    
    // Job type validation
    if (!formData.job_type) {
      newErrors.job_type = t('validation.jobTypeRequired');
    }
    
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
        company_name: formData.company_name,
        password: formData.password,
        role: 'tech',
        job_type: formData.job_type
      });
      
      if (result.success) {
        // Redirect to dashboard on success
        navigate('/dashboard');
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
        {t('signup.techSignup')}
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
        
        {/* Job Type Field */}
        <div>
          <label htmlFor="job_type" className="block text-sm font-medium text-gray-300 mb-1">
            {t('signup.jobType')} *
          </label>
          <select
            id="job_type"
            name="job_type"
            value={formData.job_type}
            onChange={handleChange}
            className={`w-full px-4 py-2 bg-slate-700 border ${errors.job_type ? 'border-red-500' : 'border-gray-600'} rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-white`}
          >
            <option value="">{t('signup.selectJobType')}</option>
            <option value="pump_service_technician">{t('jobTypes.pumpTech')}</option>
            <option value="roustabout">{t('jobTypes.roustabout')}</option>
            <option value="electrician">{t('jobTypes.electrician')}</option>
            <option value="pipeline_operator">{t('jobTypes.pipeline')}</option>
            <option value="truck_driver">{t('jobTypes.truckDriver')}</option>
            <option value="other">{t('jobTypes.other')}</option>
          </select>
          {errors.job_type && <p className="mt-1 text-sm text-red-500">{errors.job_type}</p>}
        </div>
        
        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
            {t('signup.password')} *
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

export default TechSignupForm;
