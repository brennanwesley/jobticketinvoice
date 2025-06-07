/**
 * Error utilities for standardized error handling across the application
 * 
 * This module provides utilities for handling errors in a consistent way,
 * including error categorization, formatting, logging, and reporting.
 */

/**
 * Error categories used for classifying different types of errors
 * @enum {string}
 */
export const ErrorCategory = {
  /** Network-related errors (e.g., failed requests, timeouts) */
  NETWORK: 'network',
  /** Authentication errors (e.g., invalid credentials, expired tokens) */
  AUTH: 'auth',
  /** Permission errors (e.g., insufficient privileges) */
  PERMISSION: 'permission',
  /** Validation errors (e.g., invalid form input) */
  VALIDATION: 'validation',
  /** Server errors (e.g., 500 internal server errors) */
  SERVER: 'server',
  /** Client errors (e.g., JavaScript runtime errors) */
  CLIENT: 'client',
  /** Not found errors (e.g., 404 resources not found) */
  NOT_FOUND: 'not_found',
  /** Unknown or uncategorized errors */
  UNKNOWN: 'unknown',
};

/**
 * Error severity levels for prioritizing and displaying errors
 * @enum {string}
 */
export const ErrorSeverity = {
  /** Critical errors that prevent the application from functioning */
  CRITICAL: 'critical',
  /** Errors that affect functionality but don't crash the application */
  ERROR: 'error',
  /** Warnings that might affect user experience but don't break functionality */
  WARNING: 'warning',
  /** Informational messages about potential issues */
  INFO: 'info',
};

/**
 * Standard error object structure used throughout the application
 * @typedef {Object} AppError
 * @property {string} message - Human-readable error message
 * @property {string} category - Error category from ErrorCategory enum
 * @property {string} severity - Error severity from ErrorSeverity enum
 * @property {string} [code] - Error code (if available)
 * @property {Object} [details] - Additional error details
 * @property {Error} [originalError] - Original error object
 * @property {string} [stack] - Error stack trace (in development)
 * @property {string} timestamp - When the error occurred
 */

/**
 * Creates a standardized error object
 * 
 * @param {Object} options - Error options
 * @param {string} options.message - Human-readable error message
 * @param {string} [options.category=ErrorCategory.UNKNOWN] - Error category
 * @param {string} [options.severity=ErrorSeverity.ERROR] - Error severity
 * @param {string} [options.code] - Error code
 * @param {Object} [options.details] - Additional error details
 * @param {Error} [options.originalError] - Original error object
 * @returns {AppError} Standardized error object
 */
export const createError = ({
  message,
  category = ErrorCategory.UNKNOWN,
  severity = ErrorSeverity.ERROR,
  code,
  details,
  originalError,
}) => {
  const error = {
    message,
    category,
    severity,
    timestamp: new Date().toISOString(),
  };

  if (code) error.code = code;
  if (details) error.details = details;
  
  if (originalError) {
    error.originalError = originalError;
    
    // In development, include stack trace
    if (process.env.NODE_ENV === 'development') {
      error.stack = originalError.stack;
    }
  }

  return error;
};

/**
 * Categorizes an error based on its properties
 * 
 * @param {Error|Object} error - Error to categorize
 * @returns {string} Error category from ErrorCategory enum
 */
export const categorizeError = (error) => {
  if (!error) return ErrorCategory.UNKNOWN;

  // Network errors
  if (error.name === 'NetworkError' || 
      error.message?.includes('network') || 
      error.message?.includes('Network Error') ||
      error.message?.includes('Failed to fetch')) {
    return ErrorCategory.NETWORK;
  }

  // Authentication errors
  if (error.status === 401 || 
      error.statusCode === 401 ||
      error.message?.includes('unauthorized') ||
      error.message?.includes('unauthenticated')) {
    return ErrorCategory.AUTH;
  }

  // Permission errors
  if (error.status === 403 || 
      error.statusCode === 403 ||
      error.message?.includes('forbidden') ||
      error.message?.includes('permission')) {
    return ErrorCategory.PERMISSION;
  }

  // Validation errors
  if (error.status === 422 || 
      error.statusCode === 422 ||
      error.name === 'ValidationError' ||
      error.message?.includes('validation')) {
    return ErrorCategory.VALIDATION;
  }

  // Not found errors
  if (error.status === 404 || 
      error.statusCode === 404 ||
      error.message?.includes('not found')) {
    return ErrorCategory.NOT_FOUND;
  }

  // Server errors
  if ((error.status >= 500 && error.status < 600) || 
      (error.statusCode >= 500 && error.statusCode < 600) ||
      error.message?.includes('server error')) {
    return ErrorCategory.SERVER;
  }

  return ErrorCategory.UNKNOWN;
};

/**
 * Formats an API error response into a standardized error object
 * 
 * @param {Object} apiError - API error response
 * @returns {AppError} Standardized error object
 */
export const formatApiError = (apiError) => {
  let message = 'An unexpected error occurred';
  let category = ErrorCategory.UNKNOWN;
  let code = null;
  let details = null;

  if (apiError) {
    // Handle different API error formats
    if (apiError.message) {
      message = apiError.message;
    } else if (apiError.error) {
      message = typeof apiError.error === 'string' ? apiError.error : 'API Error';
    }

    // Extract error code if available
    if (apiError.code) {
      code = apiError.code;
    } else if (apiError.status) {
      code = `HTTP_${apiError.status}`;
    } else if (apiError.statusCode) {
      code = `HTTP_${apiError.statusCode}`;
    }

    // Extract error details
    if (apiError.details || apiError.errors) {
      details = apiError.details || apiError.errors;
    }

    // Categorize the error
    category = categorizeError(apiError);
  }

  return createError({
    message,
    category,
    code,
    details,
    originalError: apiError,
  });
};

/**
 * Logs an error to the console and/or error tracking service
 * 
 * @param {AppError|Error|Object} error - Error to log
 * @param {Object} [context] - Additional context information
 */
export const logError = (error, context = {}) => {
  // In production, we might want to send this to an error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: errorTrackingService.captureException(error, { extra: context });
    console.error('[ERROR]', error);
  } else {
    // In development, log detailed error information
    console.group('%c Application Error', 'color: #ff0000; font-weight: bold;');
    console.error('Error:', error);
    if (Object.keys(context).length > 0) {
      console.log('Context:', context);
    }
    console.groupEnd();
  }
};

/**
 * Gets a user-friendly error message based on the error
 * 
 * @param {AppError|Error|Object} error - Error object
 * @param {Object} [fallbackMessages] - Fallback messages for different error categories
 * @returns {string} User-friendly error message
 */
export const getUserFriendlyMessage = (error, fallbackMessages = {}) => {
  // If it's already a formatted AppError, use its message
  if (error && error.category && error.message) {
    return error.message;
  }

  // Otherwise, categorize and provide appropriate message
  const category = categorizeError(error);
  const defaultMessages = {
    [ErrorCategory.NETWORK]: 'Unable to connect to the server. Please check your internet connection and try again.',
    [ErrorCategory.AUTH]: 'Your session has expired or you are not authorized. Please sign in again.',
    [ErrorCategory.PERMISSION]: 'You do not have permission to perform this action.',
    [ErrorCategory.VALIDATION]: 'Please check your input and try again.',
    [ErrorCategory.SERVER]: 'The server encountered an error. Please try again later.',
    [ErrorCategory.CLIENT]: 'An unexpected error occurred. Please refresh the page and try again.',
    [ErrorCategory.NOT_FOUND]: 'The requested resource was not found.',
    [ErrorCategory.UNKNOWN]: 'An unexpected error occurred. Please try again.',
  };

  const messages = { ...defaultMessages, ...fallbackMessages };
  
  // Use the error message if available, otherwise use the category fallback
  return (error && error.message) ? error.message : messages[category];
};

/**
 * Determines if an error should trigger a redirect to an error page
 * 
 * @param {AppError|Error|Object} error - Error to evaluate
 * @returns {boolean} Whether the error should trigger a redirect
 */
export const shouldRedirectToErrorPage = (error) => {
  if (!error) return false;
  
  // Format the error if it's not already formatted
  const formattedError = error.category ? error : createError({
    message: error.message || 'Unknown error',
    category: categorizeError(error),
    originalError: error,
  });

  // Critical errors should redirect to error page
  if (formattedError.severity === ErrorSeverity.CRITICAL) {
    return true;
  }

  // Certain categories should always redirect
  const redirectCategories = [
    ErrorCategory.SERVER,
    ErrorCategory.CLIENT,
  ];

  return redirectCategories.includes(formattedError.category);
};

/**
 * Handles an error by logging it and returning a standardized error object
 * 
 * @param {Error|Object} error - Error to handle
 * @param {Object} [context] - Additional context information
 * @returns {AppError} Standardized error object
 */
export const handleError = (error, context = {}) => {
  // Categorize and format the error
  const category = categorizeError(error);
  const formattedError = createError({
    message: error.message || 'An unexpected error occurred',
    category,
    originalError: error,
  });

  // Log the error
  logError(formattedError, context);

  return formattedError;
};
