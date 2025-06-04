import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import RoleSelection from './RoleSelection';
import TechSignupForm from './TechSignupForm';
import ManagerSignupForm from './ManagerSignupForm';

/**
 * Signup Page component
 * Manages the multi-step signup flow with role selection
 */
const SignupPage = () => {
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState(null);
  
  // Handle role selection
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };
  
  // Render appropriate form based on selected role
  const renderForm = () => {
    if (!selectedRole) {
      return <RoleSelection onRoleSelect={handleRoleSelect} />;
    }
    
    switch (selectedRole) {
      case 'tech':
        return <TechSignupForm />;
      case 'manager':
        return <ManagerSignupForm />;
      default:
        return <RoleSelection onRoleSelect={handleRoleSelect} />;
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-md mx-auto mb-8">
        <h1 className="text-3xl font-bold text-center text-white mb-2">
          {selectedRole ? t(`signup.${selectedRole}Signup`) : t('signup.title')}
        </h1>
        <p className="text-gray-400 text-center">
          {selectedRole ? t(`signup.${selectedRole}Description`) : t('signup.description')}
        </p>
      </div>
      
      {renderForm()}
    </div>
  );
};

export default SignupPage;
