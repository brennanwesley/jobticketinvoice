import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { setItem, getItem, removeItem } from '../utils/statePersistence';
import apiService from '../services/apiService';

// Create the context
const DraftTicketContext = createContext();

// Storage keys
const DRAFT_KEY = 'jobTicketDraft';
const DRAFTS_LIST_KEY = 'jobTicketDrafts';

/**
 * Provider component for draft ticket context
 * Handles all draft ticket operations including saving, loading, and deleting drafts
 * 
 * @param {Object} props - Component props
 * @returns {React.Component} Provider component
 */
export const DraftTicketProvider = ({ children }) => {
  // Draft tickets state
  const [draftTickets, setDraftTickets] = useState([]);
  const [selectedDraftTicket, setSelectedDraftTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load draft tickets from storage on mount
  useEffect(() => {
    const loadDrafts = () => {
      setIsLoading(true);
      try {
        // Try to load drafts, but handle potential decryption errors
        try {
          const loadedDrafts = getItem(DRAFTS_LIST_KEY, { 
            encrypted: true, 
            defaultValue: [] 
          });
          // Ensure we always have a valid array
          setDraftTickets(Array.isArray(loadedDrafts) ? loadedDrafts : []);
        } catch (decryptError) {
          console.error('Error loading draft list, using empty array:', decryptError);
          setDraftTickets([]);
          // Clear corrupted data
          removeItem(DRAFTS_LIST_KEY);
        }
        
        // Check for current draft with separate try/catch
        try {
          const currentDraft = getItem(DRAFT_KEY, { encrypted: true });
          if (currentDraft) {
            setSelectedDraftTicket(currentDraft);
          }
        } catch (draftError) {
          console.error('Error loading current draft:', draftError);
          // Clear corrupted data
          removeItem(DRAFT_KEY);
        }
      } catch (error) {
        console.error('Error in draft loading process:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDrafts();
  }, []);
  
  /**
   * Save a draft ticket
   * @param {Object} ticketData - The ticket data to save
   * @returns {Object} The saved draft with ID and timestamp
   */
  const saveDraft = useCallback((ticketData) => {
    try {
      // Add ID and timestamp if not present
      const draft = {
        ...ticketData,
        id: ticketData.id || `draft-${Date.now()}`,
        lastUpdated: new Date().toISOString()
      };
      
      // Save as current draft
      setItem(DRAFT_KEY, draft, { encrypt: true });
      
      // Update drafts list
      const existingDrafts = getItem(DRAFTS_LIST_KEY, { 
        encrypted: true, 
        defaultValue: [] 
      });
      
      const draftIndex = existingDrafts.findIndex(d => d.id === draft.id);
      
      let updatedDrafts;
      if (draftIndex >= 0) {
        updatedDrafts = [...existingDrafts];
        updatedDrafts[draftIndex] = draft;
      } else {
        updatedDrafts = [...existingDrafts, draft];
      }
      
      setItem(DRAFTS_LIST_KEY, updatedDrafts, { encrypt: true });
      setDraftTickets(updatedDrafts);
      setSelectedDraftTicket(draft);
      
      return draft;
    } catch (error) {
      console.error('Error saving draft:', error);
      throw new Error('Failed to save draft');
    }
  }, []);
  
  /**
   * Delete a draft ticket
   * @param {string} draftId - ID of the draft to delete
   * @returns {Array} Updated array of drafts
   */
  const deleteDraft = useCallback((draftId) => {
    try {
      const existingDrafts = getItem(DRAFTS_LIST_KEY, { 
        encrypted: true, 
        defaultValue: [] 
      });
      
      const updatedDrafts = existingDrafts.filter(draft => draft.id !== draftId);
      setItem(DRAFTS_LIST_KEY, updatedDrafts, { encrypt: true });
      setDraftTickets(updatedDrafts);
      
      // If current draft is the one being deleted, clear it
      if (selectedDraftTicket && selectedDraftTicket.id === draftId) {
        removeItem(DRAFT_KEY);
        setSelectedDraftTicket(null);
      }
      
      return updatedDrafts;
    } catch (error) {
      console.error('Error deleting draft:', error);
      throw new Error('Failed to delete draft');
    }
  }, [selectedDraftTicket]);
  
  /**
   * Load a draft ticket into the current draft
   * @param {Object} draft - The draft ticket to load
   */
  const loadDraftIntoForm = useCallback((draft) => {
    try {
      setItem(DRAFT_KEY, draft, { encrypt: true });
      setSelectedDraftTicket(draft);
      return draft;
    } catch (error) {
      console.error('Error loading draft:', error);
      throw new Error('Failed to load draft');
    }
  }, []);
  
  /**
   * Clear the current draft
   */
  const clearCurrentDraft = useCallback(() => {
    try {
      removeItem(DRAFT_KEY);
      setSelectedDraftTicket(null);
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  }, []);
  
  /**
   * Mark a draft as submitted
   * @param {Object} draft - The draft to mark as submitted
   * @param {string} apiId - The API ID of the submitted ticket
   * @returns {Object} Updated draft
   */
  const markDraftAsSubmitted = useCallback((draft, apiId) => {
    try {
      const updatedDraft = { 
        ...draft, 
        status: 'submitted', 
        apiId,
        submittedAt: new Date().toISOString() 
      };
      
      // Update in drafts list
      const existingDrafts = getItem(DRAFTS_LIST_KEY, { 
        encrypted: true, 
        defaultValue: [] 
      });
      
      const draftIndex = existingDrafts.findIndex(d => d.id === draft.id);
      
      if (draftIndex >= 0) {
        const updatedDrafts = [...existingDrafts];
        updatedDrafts[draftIndex] = updatedDraft;
        setItem(DRAFTS_LIST_KEY, updatedDrafts, { encrypt: true });
        setDraftTickets(updatedDrafts);
      }
      
      // If this was the current draft, update it
      if (selectedDraftTicket && selectedDraftTicket.id === draft.id) {
        setItem(DRAFT_KEY, updatedDraft, { encrypt: true });
        setSelectedDraftTicket(updatedDraft);
      }
      
      return updatedDraft;
    } catch (error) {
      console.error('Error marking draft as submitted:', error);
      throw new Error('Failed to update draft status');
    }
  }, [selectedDraftTicket]);
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    draftTickets,
    selectedDraftTicket,
    isLoading,
    saveDraft,
    deleteDraft,
    loadDraftIntoForm,
    clearCurrentDraft,
    markDraftAsSubmitted,
    setSelectedDraftTicket
  }), [
    draftTickets, 
    selectedDraftTicket, 
    isLoading, 
    saveDraft, 
    deleteDraft, 
    loadDraftIntoForm, 
    clearCurrentDraft, 
    markDraftAsSubmitted
  ]);
  
  return (
    <DraftTicketContext.Provider value={contextValue}>
      {children}
    </DraftTicketContext.Provider>
  );
};

/**
 * Custom hook to use the draft ticket context
 * @returns {Object} Draft ticket context value
 */
export const useDraftTickets = () => {
  const context = useContext(DraftTicketContext);
  
  if (!context) {
    throw new Error('useDraftTickets must be used within a DraftTicketProvider');
  }
  
  return context;
};

export default DraftTicketContext;
