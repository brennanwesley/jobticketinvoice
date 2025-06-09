import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import BaseJobTicketForm from '../components/jobTicketForms/BaseJobTicketForm';
import { TicketSubmissionProvider } from '../context/TicketSubmissionContext';
import { DraftTicketProvider } from '../context/DraftTicketContext';

/**
 * Job Ticket Form Page
 * 
 * Page component for submitting job tickets with the "By Hand" form.
 * Provides context providers for draft management and submission handling.
 */
const JobTicketFormPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
        <DraftTicketProvider>
          <TicketSubmissionProvider>
            <BaseJobTicketForm 
              workType="byHand"
              redirectAfterSubmit="/dashboard/submitted"
            />
          </TicketSubmissionProvider>
        </DraftTicketProvider>
      </div>
    </div>
  );
};

export default JobTicketFormPage;
