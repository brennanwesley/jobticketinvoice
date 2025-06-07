/**
 * Custom hook for handling API errors
 * 
 * This hook provides a standardized way to handle API errors, including
 * error state management, logging, and optional redirection on critical errors.
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  formatApiError, 
  logError, 
  shouldRedirectToErrorPage 
} from '../utils/errorUtils';
import { AppError, UseApiErrorOptions } from '../types/errors';

/**
 * Custom hook for handling API errors
 * 
 * @param options - Hook configuration options
 * @returns API error handling utilities
 */
const useApiError = (options: UseApiErrorOptions = {}) => {
  const { 
    redirectOnCritical = true, 
    errorPagePath = '/error',
    onError
  } = options;
  
  const [error, setError] = useState<AppError | null>(null);
  const navigate = useNavigate();

  /**
   * Handle an API error
   * 
   * @param err - Error to handle
   * @returns Formatted error object
   */
  const handleError = useCallback((err: unknown): AppError => {
    // Format the error
    const formattedError = formatApiError(err);
    
    // Log the error
    logError(formattedError, { source: 'useApiError' });
    
    // Set the error state
    setError(formattedError);
    
    // Call the onError callback if provided
    if (onError) {
      onError(formattedError);
    }
    
    // Redirect to error page if needed
    if (redirectOnCritical && shouldRedirectToErrorPage(formattedError)) {
      navigate(errorPagePath, { 
        state: { 
          error: formattedError,
          returnPath: window.location.pathname
        } 
      });
    }
    
    return formattedError;
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
   * @param asyncFn - Async function to execute
   * @returns Promise that resolves to the result of the async function
   */
  const executeWithErrorHandling = useCallback(async <T>(
    asyncFn: () => Promise<T>
  ): Promise<T | undefined> => {
    try {
      clearError();
      return await asyncFn();
    } catch (err) {
      handleError(err);
      return undefined;
    }
  }, [handleError, clearError]);

  return {
    error,
    setError,
    handleError,
    clearError,
    executeWithErrorHandling
  };
};

export default useApiError;
