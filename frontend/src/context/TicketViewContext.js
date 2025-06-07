import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';

// Create the context
const TicketViewContext = createContext();

/**
 * Provider component for ticket view context
 * Manages view mode and navigation state for tickets
 * 
 * @param {Object} props - Component props
 * @returns {React.Component} Provider component
 */
export const TicketViewProvider = ({ children }) => {
  // View mode state: 'landing', 'form', 'draft', 'draftList', 'submittedList', 'submittedView'
  const [viewMode, setViewMode] = useState('landing');
  
  // Ticket mode state: null, 'manual', 'voice'
  const [ticketMode, setTicketMode] = useState(null);
  
  // Navigation history for back button functionality
  const [navigationHistory, setNavigationHistory] = useState([]);
  
  /**
   * Navigate to a specific view
   * @param {string} mode - View mode to navigate to
   * @param {boolean} addToHistory - Whether to add current view to history
   */
  const navigateTo = useCallback((mode, addToHistory = true) => {
    if (addToHistory) {
      setNavigationHistory(prev => [...prev, viewMode]);
    }
    setViewMode(mode);
  }, [viewMode]);
  
  /**
   * Navigate back to previous view
   * @returns {boolean} True if navigation was successful, false if history was empty
   */
  const navigateBack = useCallback(() => {
    if (navigationHistory.length > 0) {
      const prevView = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prev => prev.slice(0, -1));
      setViewMode(prevView);
      return true;
    }
    return false;
  }, [navigationHistory]);
  
  /**
   * Clear navigation history
   */
  const clearHistory = useCallback(() => {
    setNavigationHistory([]);
  }, []);
  
  /**
   * Start a new ticket with specified mode
   * @param {string} mode - Ticket creation mode ('manual' or 'voice')
   */
  const startNewTicket = useCallback((mode) => {
    setTicketMode(mode);
    navigateTo('form', true);
  }, [navigateTo]);
  
  /**
   * View draft ticket details
   */
  const viewDraftTicket = useCallback(() => {
    navigateTo('draft', true);
  }, [navigateTo]);
  
  /**
   * View draft tickets list
   */
  const viewDraftList = useCallback(() => {
    navigateTo('draftList', true);
  }, [navigateTo]);
  
  /**
   * View submitted tickets list
   */
  const viewSubmittedList = useCallback(() => {
    navigateTo('submittedList', true);
  }, [navigateTo]);
  
  /**
   * Return to landing page
   */
  const returnToLanding = useCallback(() => {
    setViewMode('landing');
    clearHistory();
  }, [clearHistory]);
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    viewMode,
    ticketMode,
    setTicketMode,
    navigateTo,
    navigateBack,
    clearHistory,
    startNewTicket,
    viewDraftTicket,
    viewDraftList,
    viewSubmittedList,
    returnToLanding
  }), [
    viewMode,
    ticketMode,
    navigateTo,
    navigateBack,
    clearHistory,
    startNewTicket,
    viewDraftTicket,
    viewDraftList,
    viewSubmittedList,
    returnToLanding
  ]);
  
  return (
    <TicketViewContext.Provider value={contextValue}>
      {children}
    </TicketViewContext.Provider>
  );
};

/**
 * Custom hook to use the ticket view context
 * @returns {Object} Ticket view context value
 */
export const useTicketView = () => {
  const context = useContext(TicketViewContext);
  
  if (!context) {
    throw new Error('useTicketView must be used within a TicketViewProvider');
  }
  
  return context;
};

export default TicketViewContext;
