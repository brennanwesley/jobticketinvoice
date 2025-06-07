import React from 'react';
import { DraftTicketProvider } from './DraftTicketContext';
import { TicketFormProvider } from './TicketFormContext';
import { TicketSubmissionProvider } from './TicketSubmissionContext';
import { TicketViewProvider } from './TicketViewContext';

/**
 * Combined Ticket Provider that integrates all ticket-related contexts
 * This provider composes the more focused context providers to create a complete
 * ticket management system while preventing unnecessary re-renders
 * 
 * @param {Object} props - Component props
 * @returns {React.Component} Provider component
 */
export const TicketProvider = ({ children }) => {
  return (
    <TicketViewProvider>
      <DraftTicketProvider>
        <TicketFormProvider>
          <TicketSubmissionProvider>
            {children}
          </TicketSubmissionProvider>
        </TicketFormProvider>
      </DraftTicketProvider>
    </TicketViewProvider>
  );
};

export default TicketProvider;
