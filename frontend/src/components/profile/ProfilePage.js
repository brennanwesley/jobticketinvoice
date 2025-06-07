import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card, Button, Input, LoadingSpinner } from '../ui';

/**
 * ProfilePage Component
 * 
 * Displays and allows editing of user profile information
 * - Personal details
 * - Job preferences
 * - Account settings
 */
const ProfilePage = () => {
  const { user, updateUserProfile, isLoading } = useAuth();
  const { t } = useLanguage();
  
  // Local state for form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    job_type: '',
    preferred_language: '',
    phone: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  
  // Populate form with user data when available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        job_type: user.job_type || '',
        preferred_language: user.preferred_language || '',
        phone: user.phone || ''
      });
    }
  }, [user]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      await updateUserProfile(formData);
      setIsEditing(false);
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveError(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('profile.title') || 'Profile'}</h1>
      
      {saveSuccess && (
        <Card className="bg-green-900 bg-opacity-20 border border-green-700 mb-6">
          <p className="text-green-400 p-3">{t('profile.saveSuccess') || 'Profile updated successfully!'}</p>
        </Card>
      )}
      
      {saveError && (
        <Card className="bg-red-900 bg-opacity-20 border border-red-700 mb-6">
          <p className="text-red-400 p-3">{saveError}</p>
        </Card>
      )}
      
      <Card className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Profile Image */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-slate-700 flex items-center justify-center">
                  {user?.logo_url ? (
                    <img 
                      src={user.logo_url} 
                      alt={user.name} 
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl text-gray-400">{user?.name?.charAt(0) || '?'}</span>
                  )}
                </div>
                {isEditing && (
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 rounded-full bg-orange-600 p-1 text-white"
                    onClick={() => console.log('Change profile picture')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            {/* Name */}
            <Input
              label={t('profile.name') || 'Name'}
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
            />
            
            {/* Email */}
            <Input
              label={t('profile.email') || 'Email'}
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
            />
            
            {/* Phone */}
            <Input
              label={t('profile.phone') || 'Phone'}
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
            />
            
            {/* Job Type */}
            <div>
              <label htmlFor="job_type" className="block text-sm font-medium text-gray-300">
                {t('profile.jobType') || 'Job Type'}
              </label>
              <select
                id="job_type"
                name="job_type"
                className="bg-gray-800 block w-full rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                value={formData.job_type}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="">{t('common.select') || 'Select...'}</option>
                <option value="pump_tech">{t('jobTypes.pumpTech') || 'Pump Technician'}</option>
                <option value="driver">{t('jobTypes.driver') || 'Driver'}</option>
                <option value="admin">{t('jobTypes.admin') || 'Administrator'}</option>
              </select>
            </div>
            
            {/* Preferred Language */}
            <div>
              <label htmlFor="preferred_language" className="block text-sm font-medium text-gray-300">
                {t('profile.preferredLanguage') || 'Preferred Language'}
              </label>
              <select
                id="preferred_language"
                name="preferred_language"
                className="bg-gray-800 block w-full rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                value={formData.preferred_language}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                  >
                    {t('common.cancel') || 'Cancel'}
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      t('common.save') || 'Save'
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setIsEditing(true)}
                >
                  {t('profile.edit') || 'Edit Profile'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProfilePage;
