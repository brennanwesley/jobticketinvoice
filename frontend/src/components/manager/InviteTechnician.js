import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * InviteTechnician Modal Component
 * Provides three ways to invite technicians: Create Your Own, Send Email, Send SMS
 */
const InviteTechnician = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('email'); // Default to Send Email
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form states for each tab
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [emailForm, setEmailForm] = useState({
    techName: '',
    email: ''
  });

  const [smsForm, setSmsForm] = useState({
    techName: '',
    phone: ''
  });

  // Reset forms and states when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setActiveTab('email');
      setIsLoading(false);
      setError(null);
      setSuccess(null);
      setCreateForm({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
      setEmailForm({ techName: '', email: '' });
      setSmsForm({ techName: '', phone: '' });
    }
  }, [isOpen]);

  // API Base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

  // Handle form submissions
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (createForm.password !== createForm.confirmPassword) {
      setError(t('manager.inviteTechnician.passwordMismatch'));
      setIsLoading(false);
      return;
    }

    if (createForm.password.length < 8) {
      setError(t('manager.inviteTechnician.passwordMinLengthError'));
      setIsLoading(false);
      return;
    }

    try {
      // This endpoint will need to be implemented in the backend
      const response = await fetch(`${API_BASE_URL}/tech-invites/create-direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          full_name: createForm.fullName,
          email: createForm.email,
          phone: createForm.phone,
          password: createForm.password,
          company_id: user.company_id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || t('manager.inviteTechnician.createError'));
      }

      const result = await response.json();
      setSuccess(t('manager.inviteTechnician.createSuccess', { name: createForm.fullName }));
      onSuccess && onSuccess(result);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/tech-invites/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          tech_name: emailForm.techName,
          email: emailForm.email
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || t('manager.inviteTechnician.emailError'));
      }

      const result = await response.json();
      setSuccess(t('manager.inviteTechnician.emailSuccess', { name: emailForm.techName, email: emailForm.email }));
      onSuccess && onSuccess(result);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSmsSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Placeholder for SMS functionality
      const response = await fetch(`${API_BASE_URL}/tech-invites/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          tech_name: smsForm.techName,
          phone: smsForm.phone
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || t('manager.inviteTechnician.smsError'));
      }

      const result = await response.json();
      setSuccess(t('manager.inviteTechnician.smsSuccess', { name: smsForm.techName, phone: smsForm.phone }));
      onSuccess && onSuccess(result);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('manager.inviteTechnician.title')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('create')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'create'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('manager.inviteTechnician.createTab')}
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'email'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('manager.inviteTechnician.emailTab')}
            </button>
            <button
              onClick={() => setActiveTab('sms')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'sms'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('manager.inviteTechnician.smsTab')}
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Create Your Own Tab */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('manager.inviteTechnician.fullNameRequired')}
                </label>
                <input
                  type="text"
                  required
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm({...createForm, fullName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('manager.inviteTechnician.enterFullName')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('manager.inviteTechnician.emailAddressRequired')}
                </label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('manager.inviteTechnician.enterEmail')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('manager.inviteTechnician.phoneNumber')}
                </label>
                <input
                  type="tel"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({...createForm, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('manager.inviteTechnician.enterPhone')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('manager.inviteTechnician.passwordRequired')} <span className="text-gray-400 font-normal">{t('manager.inviteTechnician.passwordMinLength')}</span>
                </label>
                <input
                  type="password"
                  required
                  value={createForm.password}
                  onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('manager.inviteTechnician.enterPassword')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('manager.inviteTechnician.confirmPasswordRequired')}
                </label>
                <input
                  type="password"
                  required
                  value={createForm.confirmPassword}
                  onChange={(e) => setCreateForm({...createForm, confirmPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('manager.inviteTechnician.confirmPasswordPlaceholder')}
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? t('manager.inviteTechnician.creating') : t('manager.inviteTechnician.createTechnician')}
              </button>
            </form>
          )}

          {/* Send Email Tab */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('manager.inviteTechnician.technicianNameRequired')}
                </label>
                <input
                  type="text"
                  required
                  value={emailForm.techName}
                  onChange={(e) => setEmailForm({...emailForm, techName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('manager.inviteTechnician.enterTechnicianName')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('manager.inviteTechnician.emailAddressRequired')}
                </label>
                <input
                  type="email"
                  required
                  value={emailForm.email}
                  onChange={(e) => setEmailForm({...emailForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('manager.inviteTechnician.enterEmail')}
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                  {t('manager.inviteTechnician.emailInviteInfo')}
                </p>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? t('manager.inviteTechnician.sending') : t('manager.inviteTechnician.sendEmailInvitation')}
              </button>
            </form>
          )}

          {/* Send SMS Tab */}
          {activeTab === 'sms' && (
            <form onSubmit={handleSmsSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('manager.inviteTechnician.technicianNameRequired')}
                </label>
                <input
                  type="text"
                  required
                  value={smsForm.techName}
                  onChange={(e) => setSmsForm({...smsForm, techName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('manager.inviteTechnician.enterTechnicianName')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('manager.inviteTechnician.phoneNumberRequired')}
                </label>
                <input
                  type="tel"
                  required
                  value={smsForm.phone}
                  onChange={(e) => setSmsForm({...smsForm, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('manager.inviteTechnician.enterPhone')}
                />
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-800">
                  {t('manager.inviteTechnician.smsInviteInfo')}
                </p>
              </div>
              
              <button
                type="submit"
                disabled={true}
                className="w-full bg-gray-400 text-white py-2 px-4 rounded-md cursor-not-allowed"
              >
                {t('manager.inviteTechnician.smsInviteComingSoon')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteTechnician;
