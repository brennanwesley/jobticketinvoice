import React, { useCallback, useMemo } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useLanguage } from '../../context/LanguageContext';
import { useTicket } from '../../context/TicketContext';
import { useAuth } from '../../context/AuthContext';
import { PumpTechTicketForm, DriverTicketForm } from './forms';
import { Button } from '../ui';

/**
 * Draft Ticket View component
 * Displays a read-only view of a selected draft job ticket
 * Optimized with memoization and performance enhancements
 */
const DraftTicketView = () => {
  const { t } = useLanguage();
  const { selectedDraftTicket, setViewMode, setSelectedDraftTicket } = useTicket();
  const { user } = useAuth();
  
  // Handle back button click - memoized to prevent recreation on each render
  const handleBackClick = useCallback(() => {
    setViewMode('draftList');
    setSelectedDraftTicket(null);
  }, [setViewMode, setSelectedDraftTicket]);
  
  // Get the appropriate form component based on job type - memoized to prevent recalculation
  const FormComponent = useMemo(() => {
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
  }, [user]);
  
  // Memoize the ticket data to prevent unnecessary re-renders
  const ticketData = useMemo(() => selectedDraftTicket || {}, [selectedDraftTicket]);
  
  // If no ticket is selected, show a message
  if (!ticketData.id) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-400 mb-4">{t('jobTicket.noTicketSelected')}</p>
        <Button 
          variant="primary" 
          onClick={handleBackClick}
        >
          {t('jobTicket.returnToDrafts')}
        </Button>
      </div>
    );
  }
  
  return (
    <div className="relative">
      <button 
        onClick={handleBackClick}
        className="absolute top-0 left-0 text-white flex items-center space-x-1 hover:text-gray-300 transition-colors"
        aria-label={t('common.goBack')}
      >
        <ArrowLeftIcon className="h-4 w-4" />
        <span className="text-sm">{t('common.goBack')}</span>
      </button>
      
      <div className="pt-8">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-orange-500 italic">{t('jobTicket.readOnlyMode')}</p>
          <p className="text-sm text-gray-400">
            {t('jobTicket.draftId')}: {ticketData.id.substring(0, 8)}
          </p>
        </div>
        
        <FormComponent 
          readOnly={true}
          draftData={ticketData}
        />
      </div>
    </div>
  );
};

// Export memoized component to prevent unnecessary re-renders
export default React.memo(DraftTicketView);
