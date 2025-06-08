import React, { memo } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useLanguage } from '../context/LanguageContext';
import { useTicket } from '../context/TicketContext';
import { GenericJobTicketForm } from './tickets/forms';

/**
 * Manual Form component
 * Displays the job ticket form for manual input
 */
const ManualForm = () => {
  const { translations } = useLanguage();
  const { 
    setTicketMode, 
    setViewMode, 
    saveJobTicketAsDraft, 
    setSelectedDraftTicket 
  } = useTicket();
  
  // Handle back button click
  const handleBackClick = () => {
    setTicketMode(null);
    setViewMode('landing');
  };
  
  // Handle form save
  const handleSave = (formData) => {
    const newDraft = saveJobTicketAsDraft(formData);
    setSelectedDraftTicket(newDraft);
    setViewMode('draft');
  };
  
  return (
    <div className="relative py-4">
      <button 
        onClick={handleBackClick}
        className="mb-6 text-white flex items-center space-x-1 hover:text-gray-300 transition-colors"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        <span className="text-sm">{translations.goBack}</span>
      </button>
      
      <div className="pt-4">
        <GenericJobTicketForm onSave={handleSave} />
      </div>
    </div>
  );
};

export default memo(ManualForm);
