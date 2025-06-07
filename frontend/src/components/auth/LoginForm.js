import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Form, Card } from '../ui';

/**
 * Login Form component
 * Handles user authentication
 */
const LoginForm = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    
    // Special case for admin username
    // DEVELOPMENT ONLY - This check will be removed in production
    const isAdminLogin = formData.email.trim() === 'BrennanWesley';
    
    // Email validation - skip format validation for admin username
    if (!formData.email.trim()) {
      newErrors.email = t('validation.emailRequired');
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = t('validation.passwordRequired');
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
      // Login user
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // For the dev admin account, redirect directly to job ticket entry page
        // DEVELOPMENT ONLY - This special routing will be removed in production
        if (result.is_dev_admin) {
          navigate('/dashboard');
        } else {
          // Regular user flow - redirect to dashboard
          navigate('/dashboard');
        }
      } else {
        setSubmitError(result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      setSubmitError(t('errors.loginFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="max-w-md mx-auto p-8">
      <h2 className="text-2xl font-bold text-center mb-6">
        {t('login.title')}
      </h2>
      
      <Form 
        onSubmit={handleSubmit} 
        error={submitError}
        isSubmitting={isSubmitting}
        submitText={t('login.signIn')}
        loadingText={t('common.submitting')}
      >
        {/* Email Field */}
        <Input
          type="text" /* Changed from type="email" to type="text" to allow non-email usernames */
          id="email"
          name="email"
          label={t('login.email')}
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="Email or Admin Username" /* Updated placeholder */
        />
        
        {/* Password Field */}
        <Input
          type="password"
          id="password"
          name="password"
          label={t('login.password')}
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />
      </Form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm mb-2">
          {t('login.noAccount')}
        </p>
        <Link to="/signup" className="text-orange-500 hover:text-orange-400 font-medium">
          {t('login.createAccount')}
        </Link>
      </div>
    </Card>
  );
};

export default LoginForm;
