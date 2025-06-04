import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { saveDraft, loadDraft, loadAllDrafts, deleteDraft, saveAllDrafts } from '../utils/localStorage';
import apiService from '../services/api';

// Create the context
const TicketContext = createContext();

/**
 * Provider component for ticket context
 * @param {Object} props - Component props
 * @returns {React.Component} Provider component
 */
export const TicketProvider = ({ children }) => {
  // View mode state: 'landing', 'form', 'draft', 'draftList'
  const [viewMode, setViewMode] = useState('landing');
  
  // Ticket mode state: null, 'manual', 'voice'
  const [ticketMode, setTicketMode] = useState(null);
  
  // Form data state
  const [formData, setFormData] = useState({
    id: null,
    jobDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    companyName: '',
    customerName: '',
    location: '',
    workType: '',
    equipment: '',
    workStartTime: '',
    workEndTime: '',
    workTotalHours: '',
    driveStartTime: '',
    driveEndTime: '',
    driveTotalHours: '',
    travelType: 'roundTrip',
    parts: [],
    workDescription: '',
    submittedBy: '',
    customerSignature: '',
  });
  
  // Draft tickets state
  const [draftTickets, setDraftTickets] = useState([]);
  const [selectedDraftTicket, setSelectedDraftTicket] = useState(null);
  
  // Load draft tickets from localStorage on mount
  useEffect(() => {
    const loadedDrafts = loadAllDrafts();
    setDraftTickets(loadedDrafts);
    
    // Check for current draft
    const currentDraft = loadDraft();
    if (currentDraft) {
      setFormData(currentDraft);
    }
  }, []);
  
  // Update form data
  const updateFormData = useCallback((field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      return updated;
    });
  }, []);
  
  // Handle form input change
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    updateFormData(name, value);
  }, [updateFormData]);
  
  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData({
      id: null,
      jobDate: new Date().toISOString().split('T')[0],
      companyName: '',
      customerName: '',
      location: '',
      workType: '',
      equipment: '',
      workStartTime: '',
      workEndTime: '',
      workTotalHours: '',
      driveStartTime: '',
      driveEndTime: '',
      driveTotalHours: '',
      travelType: 'roundTrip',
      parts: [],
      workDescription: '',
      submittedBy: '',
      customerSignature: '',
    });
  }, []);
  
  // Save job ticket as draft
  const saveJobTicketAsDraft = useCallback((data = null) => {
    const ticketData = data || formData;
    const savedDraft = saveDraft(ticketData);
    
    setDraftTickets(prevDrafts => {
      const existingIndex = prevDrafts.findIndex(d => d.id === savedDraft.id);
      if (existingIndex >= 0) {
        const updatedDrafts = [...prevDrafts];
        updatedDrafts[existingIndex] = savedDraft;
        return updatedDrafts;
      } else {
        return [...prevDrafts, savedDraft];
      }
    });
    
    return savedDraft;
  }, [formData]);
  
  // Delete a draft ticket
  const deleteDraftTicket = useCallback((draftId) => {
    const updatedDrafts = deleteDraft(draftId);
    setDraftTickets(updatedDrafts);
    
    if (selectedDraftTicket && selectedDraftTicket.id === draftId) {
      setSelectedDraftTicket(null);
    }
  }, [selectedDraftTicket]);
  
  // Add a part to the form
  const addPart = useCallback((part) => {
    if (!part) return;
    
    setFormData(prev => {
      const updatedParts = [...prev.parts, part];
      return { ...prev, parts: updatedParts };
    });
  }, []);
  
  // Remove a part from the form
  const removePart = useCallback((partIndex) => {
    setFormData(prev => {
      const updatedParts = [...prev.parts];
      updatedParts.splice(partIndex, 1);
      return { ...prev, parts: updatedParts };
    });
  }, []);
  
  // Load a draft ticket into the form
  const loadDraftIntoForm = useCallback((draft) => {
    setFormData(draft);
    setSelectedDraftTicket(draft);
  }, []);
  
  // Submit job ticket to backend API
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const submitJobTicket = useCallback(async (ticketData = null) => {
    const dataToSubmit = ticketData || formData;
    
    // Format the data for the API
    const apiTicketData = {
      customer_name: dataToSubmit.customerName,
      company_name: dataToSubmit.companyName,
      location: dataToSubmit.location,
      job_date: dataToSubmit.jobDate,
      work_type: dataToSubmit.workType,
      equipment: dataToSubmit.equipment,
      work_start_time: dataToSubmit.workStartTime,
      work_end_time: dataToSubmit.workEndTime,
      work_total_hours: parseFloat(dataToSubmit.workTotalHours) || 0,
      travel_start_time: dataToSubmit.driveStartTime,
      travel_end_time: dataToSubmit.driveEndTime,
      travel_total_hours: parseFloat(dataToSubmit.driveTotalHours) || 0,
      travel_type: dataToSubmit.travelType,
      parts_used: JSON.stringify(dataToSubmit.parts),
      description: dataToSubmit.workDescription,
      submitted_by: dataToSubmit.submittedBy,
      status: 'submitted'
    };
    
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    
    try {
      // Submit to API
      const response = await apiService.jobTickets.submitTicket(apiTicketData);
      
      // Mark as submitted in local storage
      const updatedTicket = { ...dataToSubmit, status: 'submitted', apiId: response.id };
      saveJobTicketAsDraft(updatedTicket);
      
      setSubmitSuccess(true);
      return response;
    } catch (error) {
      setSubmitError(error.message || 'Failed to submit job ticket');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, saveJobTicketAsDraft]);

  // Context value
  const contextValue = {
    viewMode,
    setViewMode,
    ticketMode,
    setTicketMode,
    formData,
    setFormData,
    updateFormData,
    handleInputChange,
    resetForm,
    draftTickets,
    setDraftTickets,
    selectedDraftTicket,
    setSelectedDraftTicket,
    saveJobTicketAsDraft,
    deleteDraftTicket,
    addPart,
    removePart,
    loadDraftIntoForm,
    submitJobTicket,
    isSubmitting,
    submitError,
    submitSuccess
  };
  
  return (
    <TicketContext.Provider value={contextValue}>
      {children}
    </TicketContext.Provider>
  );
};

/**
 * Custom hook to use the ticket context
 * @returns {Object} Ticket context value
 */
export const useTicket = () => {
  const context = useContext(TicketContext);
  
  if (!context) {
    throw new Error('useTicket must be used within a TicketProvider');
  }
  
  return context;
};

export default TicketContext;
