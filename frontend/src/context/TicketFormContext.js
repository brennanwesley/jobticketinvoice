import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useDraftTickets } from './DraftTicketContext';

// Create the context
const TicketFormContext = createContext();

/**
 * Provider component for ticket form context
 * Handles form state, validation, and updates
 * 
 * @param {Object} props - Component props
 * @returns {React.Component} Provider component
 */
export const TicketFormProvider = ({ children }) => {
  const { selectedDraftTicket, saveDraft } = useDraftTickets();
  
  // Form data state with initial values
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
  
  // Form validation state
  const [formErrors, setFormErrors] = useState({});
  const [isFormDirty, setIsFormDirty] = useState(false);
  
  // Auto-save timer
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  
  // Load selected draft into form when it changes
  useEffect(() => {
    if (selectedDraftTicket) {
      setFormData(selectedDraftTicket);
      setIsFormDirty(false);
    }
  }, [selectedDraftTicket]);
  
  // Set up auto-save when form is dirty
  useEffect(() => {
    if (isFormDirty) {
      // Clear existing timer
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      // Set new timer for auto-save after 2 seconds of inactivity
      const timer = setTimeout(() => {
        if (isFormDirty) {
          saveDraft(formData);
          setIsFormDirty(false);
        }
      }, 2000);
      
      setAutoSaveTimer(timer);
    }
    
    // Cleanup timer on unmount
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [isFormDirty, formData, saveDraft, autoSaveTimer]);
  
  /**
   * Update a specific field in the form data
   * @param {string} field - Field name
   * @param {any} value - Field value
   */
  const updateFormField = useCallback((field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      return updated;
    });
    setIsFormDirty(true);
    
    // Clear validation error for this field if it exists
    if (formErrors[field]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  }, [formErrors]);
  
  /**
   * Handle form input change event
   * @param {Event} e - Change event
   */
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    updateFormField(name, value);
  }, [updateFormField]);
  
  /**
   * Reset form to initial state
   */
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
    setFormErrors({});
    setIsFormDirty(false);
  }, []);
  
  /**
   * Add a part to the form
   * @param {string} part - Part to add
   */
  const addPart = useCallback((part) => {
    if (!part) return;
    
    setFormData(prev => {
      const updatedParts = [...(prev.parts || []), part];
      return { ...prev, parts: updatedParts };
    });
    setIsFormDirty(true);
  }, []);
  
  /**
   * Remove a part from the form
   * @param {number} partIndex - Index of part to remove
   */
  const removePart = useCallback((partIndex) => {
    setFormData(prev => {
      const updatedParts = [...(prev.parts || [])];
      updatedParts.splice(partIndex, 1);
      return { ...prev, parts: updatedParts };
    });
    setIsFormDirty(true);
  }, []);
  
  /**
   * Validate the form data
   * @returns {boolean} True if valid, false otherwise
   */
  const validateForm = useCallback(() => {
    const errors = {};
    
    // Required fields
    if (!formData.companyName) errors.companyName = 'Company name is required';
    if (!formData.customerName) errors.customerName = 'Customer name is required';
    if (!formData.location) errors.location = 'Location is required';
    if (!formData.jobDate) errors.jobDate = 'Job date is required';
    
    // Work time validation
    if (formData.workStartTime && formData.workEndTime) {
      const start = new Date(`2000-01-01T${formData.workStartTime}`);
      const end = new Date(`2000-01-01T${formData.workEndTime}`);
      
      if (end <= start) {
        errors.workEndTime = 'End time must be after start time';
      }
    }
    
    // Drive time validation
    if (formData.driveStartTime && formData.driveEndTime) {
      const start = new Date(`2000-01-01T${formData.driveStartTime}`);
      const end = new Date(`2000-01-01T${formData.driveEndTime}`);
      
      if (end <= start) {
        errors.driveEndTime = 'End time must be after start time';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);
  
  /**
   * Save the current form data as a draft
   * @returns {Object} Saved draft
   */
  const saveFormAsDraft = useCallback(() => {
    const savedDraft = saveDraft(formData);
    setIsFormDirty(false);
    return savedDraft;
  }, [formData, saveDraft]);
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    formData,
    setFormData,
    formErrors,
    isFormDirty,
    updateFormField,
    handleInputChange,
    resetForm,
    addPart,
    removePart,
    validateForm,
    saveFormAsDraft
  }), [
    formData,
    formErrors,
    isFormDirty,
    updateFormField,
    handleInputChange,
    resetForm,
    addPart,
    removePart,
    validateForm,
    saveFormAsDraft
  ]);
  
  return (
    <TicketFormContext.Provider value={contextValue}>
      {children}
    </TicketFormContext.Provider>
  );
};

/**
 * Custom hook to use the ticket form context
 * @returns {Object} Ticket form context value
 */
export const useTicketForm = () => {
  const context = useContext(TicketFormContext);
  
  if (!context) {
    throw new Error('useTicketForm must be used within a TicketFormProvider');
  }
  
  return context;
};

export default TicketFormContext;
