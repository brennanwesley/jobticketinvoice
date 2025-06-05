import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTicket } from '../context/TicketContext';

// Import job type specific forms
import PumpTechTicketForm from './jobTicketForms/PumpTechTicketForm';
import DriverTicketForm from './jobTicketForms/DriverTicketForm';

/**
 * Job Ticket Form Selector Component
 * Dynamically loads the appropriate job ticket form based on user's job type
 */
const JobTicketFormSelector = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { selectedDraftTicket } = useTicket();
  
  // Map of job types to their respective form components
  const jobTypeForms = {
    'pump_tech': PumpTechTicketForm,
    'driver': DriverTicketForm,
    // Add more job types here as they are implemented
  };
  
  // Default to pump tech form if job type is not recognized
  const getJobTypeKey = () => {
    if (!user || !user.job_type) return 'pump_tech';
    
    // Normalize job type string (remove spaces, hyphens, underscores, lowercase)
    const normalizedJobType = user.job_type.toLowerCase().replace(/[\s_-]/g, '_');
    
    // Map common variations to standard keys
    const jobTypeMap = {
      'pump_technician': 'pump_tech',
      'pumptechnician': 'pump_tech',
      'pumptech': 'pump_tech',
      'pump_service_technician': 'pump_tech',
      'pump_service_tech': 'pump_tech',
    };
    
    return jobTypeMap[normalizedJobType] || normalizedJobType;
  };
  
  // Get the appropriate form component based on job type
  const getFormComponent = () => {
    const jobTypeKey = getJobTypeKey();
    return jobTypeForms[jobTypeKey] || PumpTechTicketForm;
  };
  
  // Render the appropriate form
  const FormComponent = getFormComponent();
  
  return (
    <div className="py-6 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {t('jobTicket.createNew')}
      </h1>
      
      {selectedDraftTicket ? (
        <div className="bg-blue-500 bg-opacity-20 border border-blue-500 text-blue-500 px-4 py-3 rounded mb-6">
          {t('jobTicket.editingDraft')}
        </div>
      ) : null}
      
      <FormComponent draftData={selectedDraftTicket} />
    </div>
  );
};

export default JobTicketFormSelector;
