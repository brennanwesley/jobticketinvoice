import React, { memo } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useLanguage } from '../context/LanguageContext';
import { useTicket } from '../context/TicketContext';
import JobTicketForm from './JobTicketForm';

/**
 * Draft Ticket View component
 * Displays a read-only view of a selected draft job ticket
 */
const DraftTicketView = () => {
  const { translations } = useLanguage();
  const { selectedDraftTicket, setViewMode, setSelectedDraftTicket } = useTicket();
  
  // Handle back button click
  const handleBackClick = () => {
    setViewMode('landing');
    setSelectedDraftTicket(null);
  };
  
  return (
    <div className="relative">
      <button 
        onClick={handleBackClick}
        className="absolute top-0 left-0 text-white flex items-center space-x-1 hover:text-gray-300 transition-colors"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        <span className="text-sm">{translations.goBack}</span>
      </button>
      
      <div className="pt-8">
        <p className="text-sm text-orange-500 italic mb-4">{translations.readOnlyMode}</p>
        <JobTicketForm 
          readOnly={true}
          draftData={selectedDraftTicket}
        />
      </div>
    </div>
  );
};

export default memo(DraftTicketView);
