import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import LoginForm from './LoginForm';

/**
 * Login Page component
 * Displays the login form with appropriate context
 */
const LoginPage = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-md mx-auto mb-8">
        <h1 className="text-3xl font-bold text-center text-white mb-2">
          {t('login.title')}
        </h1>
        <p className="text-gray-400 text-center">
          {t('login.description')}
        </p>
      </div>
      
      <LoginForm />
    </div>
  );
};

export default LoginPage;
