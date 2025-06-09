import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import SubmittedTicketList from '../components/jobTicketForms/SubmittedTicketList';

/**
 * Submitted Ticket List Page
 * 
 * Page component that displays the list of submitted job tickets.
 */
const SubmittedTicketListPage = () => {
  const { t } = useLanguage();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-6">
          {t('jobTicket.submittedTickets')}
        </h1>
        
        <SubmittedTicketList />
      </div>
    </div>
  );
};

export default SubmittedTicketListPage;
