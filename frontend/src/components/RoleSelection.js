import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

/**
 * Role Selection component
 * Allows users to select their role (Tech or Manager) during signup
 */
const RoleSelection = ({ onRoleSelect }) => {
  const { t } = useLanguage();
  
  return (
    <div className="max-w-md mx-auto bg-slate-800 rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-center mb-6">
        {t('signup.selectRole')}
      </h2>
      <p className="text-gray-300 mb-8 text-center">
        {t('signup.roleDescription')}
      </p>
      
      <div className="space-y-4">
        {/* Tech Role Button */}
        <button
          onClick={() => onRoleSelect('tech')}
          className="w-full flex items-center justify-between bg-slate-700 hover:bg-slate-600 p-4 rounded-lg transition-colors"
        >
          <div className="flex items-center">
            <div className="bg-blue-500 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg">{t('signup.techRole')}</h3>
              <p className="text-gray-400 text-sm">{t('signup.techDescription')}</p>
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* Manager Role Button */}
        <button
          onClick={() => onRoleSelect('manager')}
          className="w-full flex items-center justify-between bg-slate-700 hover:bg-slate-600 p-4 rounded-lg transition-colors"
        >
          <div className="flex items-center">
            <div className="bg-orange-500 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg">{t('signup.managerRole')}</h3>
              <p className="text-gray-400 text-sm">{t('signup.managerDescription')}</p>
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className="mt-8 text-center">
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

export default RoleSelection;
