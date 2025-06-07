import { useState, useCallback } from 'react';
import { formatApiError, logError, shouldRedirectToErrorPage } from '../utils/errorUtils';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for handling API errors consistently across the application
 * 
 * @param {Object} options - Hook options
 * @param {boolean} options.redirectOnCritical - Whether to redirect to error page on critical errors
 * @param {string} options.errorPagePath - Path to redirect to for critical errors
 * @param {Function} options.onError - Optional callback when an error occurs
 * @returns {Object} Error handling utilities
 */
const useApiError = ({
  redirectOnCritical = true,
  errorPagePath = '/error',
  onError,
} = {}) => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * Handle an API error
   * 
   * @param {Error|Object} err - Error object from API call
   * @param {Object} context - Additional context for error logging
   */
  const handleError = useCallback((err, context = {}) => {
    if (!err) return;

    // Format the error into our standard format
    const formattedError = formatApiError(err);
    
    // Log the error
    logError(formattedError, context);
    
    // Set the error state
    setError(formattedError);
    
    // Call the onError callback if provided
    if (onError && typeof onError === 'function') {
      onError(formattedError);
    }
    
    // Redirect to error page if it's a critical error
    if (redirectOnCritical && shouldRedirectToErrorPage(formattedError)) {
      navigate(errorPagePath, { 
        state: { 
          error: formattedError,
          returnTo: window.location.pathname
        } 
      });
    }
  }, [navigate, redirectOnCritical, errorPagePath, onError]);

  /**
   * Clear the current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Execute an async function with error handling
   * 
   * @param {Function} asyncFn - Async function to execute
   * @param {Object} errorContext - Additional context for error logging
   * @returns {Promise<*>} Result of the async function
   */
  const executeWithErrorHandling = useCallback(async (asyncFn, errorContext = {}) => {
    if (typeof asyncFn !== 'function') {
      throw new Error('executeWithErrorHandling requires a function');
    }
    
    setIsLoading(true);
    clearError();
    
    try {
      const result = await asyncFn();
      return result;
    } catch (err) {
      handleError(err, errorContext);
      throw err; // Re-throw to allow caller to handle if needed
    } finally {
      setIsLoading(false);
    }
  }, [handleError, clearError]);

  return {
    error,
    isLoading,
    handleError,
    clearError,
    executeWithErrorHandling,
  };
};

export default useApiError;
