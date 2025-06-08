import React, { createContext, useContext, useMemo } from 'react';
import { useDraftTickets } from './DraftTicketContext';
import { useTicketForm } from './TicketFormContext';
import { useTicketSubmission } from './TicketSubmissionContext';
import { useTicketView } from './TicketViewContext';

// This is a backward compatibility layer that combines the focused contexts
// to provide the original TicketContext API for existing components

// Create the context
const TicketContext = createContext();

/**
 * Provider component for ticket context
 * This is a backward compatibility layer that uses the new focused contexts
 * but provides the original API for existing components
 * 
 * @param {Object} props - Component props
 * @returns {React.Component} Provider component
 */
export const TicketProvider = ({ children }) => {
  // We don't need to implement any state or logic here
  // Instead, we'll pass through to the actual provider
  return children;
};

/**
 * Custom hook to use the ticket context
 * This combines all the focused contexts to provide the original API
 * 
 * @returns {Object} Ticket context value
 */
export const useTicket = () => {
  const context = useContext(TicketContext);
  
  // Always call hooks at the top level, regardless of whether we use them
  // Add fallbacks to prevent errors if any context is undefined
  const draftTickets = useDraftTickets() || {};
  const ticketForm = useTicketForm() || {};
  const ticketSubmission = useTicketSubmission() || {};
  const ticketView = useTicketView() || {};
  
  // Create a combined context value that matches the original API
  const combinedContext = useMemo(() => ({
    // Combined context properties here
    // View state from TicketViewContext with fallbacks
    viewMode: ticketView.viewMode || 'landing',
    setViewMode: ticketView.navigateTo || (() => console.warn('navigateTo not available')),
    ticketMode: ticketView.ticketMode || 'view',
    setTicketMode: ticketView.setTicketMode || (() => console.warn('setTicketMode not available')),
    
    // Form state from TicketFormContext
    formData: ticketForm.formData,
    setFormData: ticketForm.setFormData,
    updateFormData: ticketForm.updateFormField,
    handleInputChange: ticketForm.handleInputChange,
    resetForm: ticketForm.resetForm,
    addPart: ticketForm.addPart,
    removePart: ticketForm.removePart,
    
    // Draft state from DraftTicketContext
    draftTickets: draftTickets.draftTickets,
    setDraftTickets: () => console.warn('setDraftTickets is deprecated, use DraftTicketContext methods instead'),
    selectedDraftTicket: draftTickets.selectedDraftTicket,
    setSelectedDraftTicket: draftTickets.setSelectedDraftTicket,
    saveJobTicketAsDraft: draftTickets.saveDraft,
    deleteDraftTicket: draftTickets.deleteDraft,
    loadDraftIntoForm: draftTickets.loadDraftIntoForm,
    
    // Submission state from TicketSubmissionContext
    submitJobTicket: ticketSubmission.submitJobTicket,
    isSubmitting: ticketSubmission.isSubmitting,
    submitError: ticketSubmission.submitError,
    submitSuccess: ticketSubmission.submitSuccess
  }), [
    ticketView,
    ticketForm,
    draftTickets,
    ticketSubmission
  ]);
  
  // Return the legacy context if available, otherwise use the combined context
  return context || combinedContext;
};

export default TicketContext;
