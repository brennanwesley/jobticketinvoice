import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import LoginForm from './LoginForm';
import LanguageToggle from './LanguageToggle';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

/**
 * Login Page component
 * Displays the login form with appropriate context
 */
const LoginPage = () => {
  const { t, language } = useLanguage();
  
  // Handle help button click (placeholder for future functionality)
  const handleHelpClick = () => {
    console.log('Help button clicked');
    // Future functionality will be added here
  };
  
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
      
      <LoginForm />
      
      {/* Need Help button */}
      <div className="fixed bottom-4 right-4 z-20">
        <button
          onClick={handleHelpClick}
          className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full transition-colors shadow-lg"
          aria-label="Need Help"
        >
          <QuestionMarkCircleIcon className="h-5 w-5 text-white" />
          <span className="text-sm">
            {language === 'en' ? 'Need Help' : '¿Necesita Ayuda?'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
