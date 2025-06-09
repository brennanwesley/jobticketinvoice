import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import jobTicketService from '../services/jobTicketService';
import { useDraftTickets } from './DraftTicketContext';

// Create the context
const TicketSubmissionContext = createContext();

/**
 * Provider component for ticket submission context
 * Handles submission of tickets to the API and related state
 * 
 * @param {Object} props - Component props
 * @returns {React.Component} Provider component
 */
export const TicketSubmissionProvider = ({ children }) => {
  const { markDraftAsSubmitted } = useDraftTickets();
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [lastSubmittedTicket, setLastSubmittedTicket] = useState(null);
  
  /**
   * Track submission progress
   * @param {number} progress - Progress percentage (0-100)
   */
  const [submissionProgress, setSubmissionProgress] = useState(0);
  
  /**
   * Handle submission progress updates
   * @param {number} progress - Progress percentage (0-100)
   */
  const handleProgress = useCallback((progress) => {
    setSubmissionProgress(progress);
  }, []);
  
  /**
   * Submit a job ticket to the API
   * @param {Object} ticketData - The ticket data to submit
   * @returns {Promise<Object>} API response
   */
  const submitJobTicket = useCallback(async (ticketData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    setSubmissionProgress(0);
    
    try {
      // Validate ticket data
      const validation = jobTicketService.validateJobTicket(ticketData);
      if (!validation.isValid) {
        const errorMessage = Object.values(validation.errors).join(', ');
        throw new Error(`Validation failed: ${errorMessage}`);
      }
      
      // Submit to API with progress tracking
      const result = await jobTicketService.submitJobTicket(ticketData, handleProgress);
      
      if (result.success) {
        // Mark as submitted in local storage
        const updatedTicket = markDraftAsSubmitted(ticketData, result.id);
        
        setSubmitSuccess(true);
        setLastSubmittedTicket({
          ...updatedTicket,
          ticketNumber: result.ticketNumber
        });
        
        return result;
      } else {
        throw new Error(result.message || 'Failed to submit job ticket');
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to submit job ticket';
      setSubmitError(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [handleProgress, markDraftAsSubmitted]);
  
  /**
   * Reset submission state
   */
  const resetSubmissionState = useCallback(() => {
    setSubmitError(null);
    setSubmitSuccess(false);
    setLastSubmittedTicket(null);
  }, []);
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isSubmitting,
    submitError,
    submitSuccess,
    submissionProgress,
    lastSubmittedTicket,
    submitJobTicket,
    resetSubmissionState
  }), [
    isSubmitting,
    submitError,
    submitSuccess,
    submissionProgress,
    lastSubmittedTicket,
    submitJobTicket,
    resetSubmissionState
  ]);
  
  return (
    <TicketSubmissionContext.Provider value={contextValue}>
      {children}
    </TicketSubmissionContext.Provider>
  );
};

/**
 * Custom hook to use the ticket submission context
 * @returns {Object} Ticket submission context value
 */
export const useTicketSubmission = () => {
  const context = useContext(TicketSubmissionContext);
  
  if (!context) {
    throw new Error('useTicketSubmission must be used within a TicketSubmissionProvider');
  }
  
  return context;
};

export default TicketSubmissionContext;
