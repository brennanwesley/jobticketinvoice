import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useDraftTickets } from '../../context/DraftTicketContext';
import DraftTicketManager from './DraftTicketManager';

/**
 * DraftTicketSelector Component
 * 
 * Provides a button to open the draft ticket manager modal
 * for selecting and loading a draft ticket into the current form.
 * 
 * This component is designed to be used within job ticket forms.
 */
const DraftTicketSelector = ({ onDraftSelected }) => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { draftTickets } = useDraftTickets();
  
  // Count drafts (only those with status 'draft')
  const draftCount = draftTickets?.filter(draft => draft.status === 'draft')?.length || 0;
  
  // Open draft manager modal
  const openDraftManager = () => {
    setIsModalOpen(true);
  };
  
  // Close draft manager modal
  const closeDraftManager = () => {
    setIsModalOpen(false);
  };
  
  // Handle draft selection
  const handleDraftSelected = (draft) => {
    if (onDraftSelected) {
      onDraftSelected(draft);
    }
    closeDraftManager();
  };
  
  return (
    <>
      <button
        type="button"
        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
        onClick={openDraftManager}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 mr-2" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
          />
        </svg>
        {t('jobTicket.loadDraft')}
        {draftCount > 0 && (
          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-800 text-blue-100">
            {draftCount}
          </span>
        )}
      </button>
      
      <DraftTicketManager
        showAsModal={true}
        isOpen={isModalOpen}
        onClose={closeDraftManager}
        onDraftSelected={handleDraftSelected}
      />
    </>
  );
};

export default DraftTicketSelector;
