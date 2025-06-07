import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import apiService from '../services/apiService';
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
   * Format ticket data for API submission
   * @param {Object} ticketData - Raw ticket data from form
   * @returns {Object} Formatted data for API
   */
  const formatTicketForApi = useCallback((ticketData) => {
    return {
      customer_name: ticketData.customerName,
      company_name: ticketData.companyName,
      location: ticketData.location,
      job_date: ticketData.jobDate,
      work_type: ticketData.workType,
      equipment: ticketData.equipment,
      work_start_time: ticketData.workStartTime,
      work_end_time: ticketData.workEndTime,
      work_total_hours: parseFloat(ticketData.workTotalHours) || 0,
      travel_start_time: ticketData.driveStartTime,
      travel_end_time: ticketData.driveEndTime,
      travel_total_hours: parseFloat(ticketData.driveTotalHours) || 0,
      travel_type: ticketData.travelType,
      parts_used: JSON.stringify(ticketData.parts || []),
      description: ticketData.workDescription,
      submitted_by: ticketData.submittedBy,
      status: 'submitted'
    };
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
    
    try {
      // Format data for API
      const apiTicketData = formatTicketForApi(ticketData);
      
      // Submit to API
      const response = await apiService.jobTickets.submitTicket(apiTicketData);
      
      // Mark as submitted in local storage
      const updatedTicket = markDraftAsSubmitted(ticketData, response.id);
      
      setSubmitSuccess(true);
      setLastSubmittedTicket(updatedTicket);
      
      return response;
    } catch (error) {
      const errorMessage = error.message || 'Failed to submit job ticket';
      setSubmitError(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [formatTicketForApi, markDraftAsSubmitted]);
  
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
    lastSubmittedTicket,
    submitJobTicket,
    resetSubmissionState
  }), [
    isSubmitting,
    submitError,
    submitSuccess,
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
