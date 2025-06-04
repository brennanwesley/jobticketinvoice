import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

/**
 * User Profile component
 * Displays the logged-in user's information in a read-only view
 */
const UserProfile = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  // Format job type for display
  const formatJobType = (jobType) => {
    if (!jobType) return '';
    
    const jobTypeKey = jobType.replace(/[_-]/g, '').toLowerCase();
    return t(`jobTypes.${jobTypeKey}`) || jobType;
  };
  
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto bg-slate-800 rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-400 py-8">
          {t('profile.notLoggedIn')}
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto bg-slate-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header with user name */}
      <div className="bg-slate-700 p-6">
        <h2 className="text-2xl font-bold">{t('profile.title')}</h2>
      </div>
      
      <div className="p-6">
        {/* User info grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Basic info */}
          <div className="md:col-span-2 space-y-6">
            {/* Name */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">
                {t('profile.name')}
              </h3>
              <p className="text-lg">{user.name || '-'}</p>
            </div>
            
            {/* Email */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">
                {t('profile.email')}
              </h3>
              <p className="text-lg">{user.email}</p>
            </div>
            
            {/* Role */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">
                {t('profile.role')}
              </h3>
              <p className="text-lg capitalize">{user.role}</p>
            </div>
            
            {/* Job Type (for techs) */}
            {user.role === 'tech' && user.job_type && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">
                  {t('profile.jobType')}
                </h3>
                <p className="text-lg">{formatJobType(user.job_type)}</p>
              </div>
            )}
            
            {/* Company Name (for managers) */}
            {user.role === 'manager' && user.company_name && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">
                  {t('profile.companyName')}
                </h3>
                <p className="text-lg">{user.company_name}</p>
              </div>
            )}
            
            {/* Account created date */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">
                {t('profile.memberSince')}
              </h3>
              <p className="text-lg">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {/* Right column - Logo (for managers) */}
          {user.role === 'manager' && (
            <div className="flex flex-col items-center justify-start">
              <h3 className="text-sm font-medium text-gray-400 mb-3 self-start">
                {t('profile.companyLogo')}
              </h3>
              
              {user.logo_url ? (
                <img 
                  src={user.logo_url} 
                  alt={`${user.company_name} logo`} 
                  className="max-w-full max-h-48 rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/200x200?text=Logo+Not+Found';
                  }}
                />
              ) : (
                <div className="w-full h-32 bg-slate-700 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400 text-sm">
                    {t('profile.noLogoUploaded')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
