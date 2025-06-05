import React, { memo } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useLanguage } from '../context/LanguageContext';
import { useTicket } from '../context/TicketContext';
import { useAuth } from '../context/AuthContext';
import PumpTechTicketForm from './jobTicketForms/PumpTechTicketForm';
import DriverTicketForm from './jobTicketForms/DriverTicketForm';

/**
 * Draft Ticket View component
 * Displays a read-only view of a selected draft job ticket
 */
const DraftTicketView = () => {
  const { t } = useLanguage();
  const { selectedDraftTicket, setViewMode, setSelectedDraftTicket } = useTicket();
  
  const { user } = useAuth();
  
  // Handle back button click
  const handleBackClick = () => {
    setViewMode('draftList');
    setSelectedDraftTicket(null);
  };
  
  // Get the appropriate form component based on job type
  const getFormComponent = () => {
    if (!user || !user.job_type) return PumpTechTicketForm;
    
    // Normalize job type string
    const normalizedJobType = user.job_type.toLowerCase().replace(/[\s_-]/g, '_');
    
    // Map job types to form components
    const jobTypeForms = {
      'pump_tech': PumpTechTicketForm,
      'pump_technician': PumpTechTicketForm,
      'pumptechnician': PumpTechTicketForm,
      'pump_service_technician': PumpTechTicketForm,
      'driver': DriverTicketForm,
    };
    
    return jobTypeForms[normalizedJobType] || PumpTechTicketForm;
  };
  
  // Get the appropriate form component
  const FormComponent = getFormComponent();
  
  return (
    <div className="relative">
      <button 
        onClick={handleBackClick}
        className="absolute top-0 left-0 text-white flex items-center space-x-1 hover:text-gray-300 transition-colors"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        <span className="text-sm">{t('common.goBack')}</span>
      </button>
      
      <div className="pt-8">
        <p className="text-sm text-orange-500 italic mb-4">{t('jobTicket.readOnlyMode')}</p>
        <FormComponent 
          readOnly={true}
          draftData={selectedDraftTicket}
        />
      </div>
    </div>
  );
};

export default memo(DraftTicketView);
