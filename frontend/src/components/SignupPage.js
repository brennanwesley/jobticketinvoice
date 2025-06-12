import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import ManagerSignupForm from './ManagerSignupForm';
import LanguageToggle from './LanguageToggle';

/**
 * Signup Page component
 * As of June 11, 2025: Only managers may self-register. 
 * Technicians are invited/onboarded by their manager via the dashboard.
 * 
 * This page now directly shows the Manager signup form without role selection.
 * The role selection step has been removed to prevent technician self-registration.
 */
const SignupPage = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 relative">
      {/* Language Toggle */}
      <div className="h-14 relative">
        <LanguageToggle />
      </div>
      <div className="max-w-md mx-auto mb-8">
        <h1 className="text-3xl font-bold text-center text-white mb-2">
          {t('signup.managerTitle')}
        </h1>
        <p className="text-gray-400 text-center mb-4">
          {t('signup.managerOnlyDescription')}
        </p>
        <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-4">
          <p className="text-blue-200 text-sm text-center">
            {t('signup.technicianNote')}
          </p>
        </div>
      </div>
      
      <ManagerSignupForm />
    </div>
  );
};

export default SignupPage;
