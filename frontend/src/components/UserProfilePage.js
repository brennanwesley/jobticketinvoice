import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import UserProfile from './UserProfile';

/**
 * User Profile Page component
 * Displays the user profile with appropriate context and authentication check
 */
const UserProfilePage = () => {
  const { t } = useLanguage();
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-center text-white mb-2">
          {t('profile.title')}
        </h1>
        <p className="text-gray-400 text-center">
          {t('profile.description')}
        </p>
      </div>
      
      <UserProfile />
    </div>
  );
};

export default UserProfilePage;
