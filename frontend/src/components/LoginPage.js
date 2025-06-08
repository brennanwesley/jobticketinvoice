import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import LoginForm from './LoginForm';
import LanguageToggle from './LanguageToggle';

/**
 * Login Page component
 * Displays the login form with appropriate context
 */
const LoginPage = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 relative">
      {/* Language Toggle */}
      <div className="h-14 relative">
        <LanguageToggle />
      </div>
      <div className="max-w-md mx-auto mb-8">
        <h1 className="text-3xl font-bold text-center text-white mb-2">
          {t('login.title')}
        </h1>
        <p className="text-gray-400 text-center">
          {t('login.description')}
        </p>
      </div>
      
      {/* Feature Card - This component is called "Feature Card" */}
      <div className="max-w-md mx-auto mb-8">
        <div className="w-full bg-gradient-to-br from-orange-500 to-blue-600 rounded-lg shadow-lg p-8 text-white">
          <div className="flex flex-col items-center justify-center h-48">
            <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h2 className="text-2xl font-bold mb-2 text-center">{t('featureCard.title') || "Job Ticket Platform"}</h2>
            <p className="text-center">{t('featureCard.description') || "Streamline your oilfield service operations"}</p>
          </div>
        </div>
      </div>
      
      <LoginForm />
    </div>
  );
};

export default LoginPage;
