/**
 * Error utilities for standardized error handling across the application
 * 
 * This module provides utilities for handling errors in a consistent way,
 * including error categorization, formatting, logging, and reporting.
 */
import { 
  AppError, 
  ErrorCategory, 
  ErrorOptions, 
  ErrorSeverity 
} from '../types/errors';

/**
 * Creates a standardized error object
 * 
 * @param options - Error options
 * @returns Standardized error object
 */
export const createError = ({
  message,
  category = ErrorCategory.UNKNOWN,
  severity = ErrorSeverity.ERROR,
  code,
  details,
  originalError,
}: ErrorOptions): AppError => {
  const error: AppError = {
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
      if (originalError instanceof Error) {
        error.stack = originalError.stack;
      }
    }
  }

  return error;
};

/**
 * Categorizes an error based on its properties
 * 
 * @param error - Error to categorize
 * @returns Error category from ErrorCategory enum
 */
export const categorizeError = (error: Error | Record<string, any> | unknown): ErrorCategory => {
  if (!error) return ErrorCategory.UNKNOWN;

  // Type guard to check if error is an object with properties
  const isErrorObject = (err: unknown): err is Record<string, any> => {
    return typeof err === 'object' && err !== null;
  };

  if (!isErrorObject(error)) return ErrorCategory.UNKNOWN;

  // Network errors
  if (error.name === 'NetworkError' || 
      (typeof error.message === 'string' && (
        error.message.includes('network') || 
        error.message.includes('Network Error') ||
        error.message.includes('Failed to fetch')
      ))) {
    return ErrorCategory.NETWORK;
  }

  // Authentication errors
  if (error.status === 401 || 
      error.statusCode === 401 ||
      (typeof error.message === 'string' && (
        error.message.includes('unauthorized') ||
        error.message.includes('unauthenticated')
      ))) {
    return ErrorCategory.AUTH;
  }

  // Permission errors
  if (error.status === 403 || 
      error.statusCode === 403 ||
      (typeof error.message === 'string' && (
        error.message.includes('forbidden') ||
        error.message.includes('permission')
      ))) {
    return ErrorCategory.PERMISSION;
  }

  // Validation errors
  if (error.status === 422 || 
      error.statusCode === 422 ||
      error.name === 'ValidationError' ||
      (typeof error.message === 'string' && 
        error.message.includes('validation'))) {
    return ErrorCategory.VALIDATION;
  }

  // Not found errors
  if (error.status === 404 || 
      error.statusCode === 404 ||
      (typeof error.message === 'string' && 
        error.message.includes('not found'))) {
    return ErrorCategory.NOT_FOUND;
  }

  // Server errors
  if ((error.status >= 500 && error.status < 600) || 
      (error.statusCode >= 500 && error.statusCode < 600) ||
      (typeof error.message === 'string' && 
        error.message.includes('server error'))) {
    return ErrorCategory.SERVER;
  }

  return ErrorCategory.UNKNOWN;
};

/**
 * Formats an API error response into a standardized error object
 * 
 * @param apiError - API error response
 * @returns Standardized error object
 */
export const formatApiError = (apiError: unknown): AppError => {
  let message = 'An unexpected error occurred';
  let category = ErrorCategory.UNKNOWN;
  let code: string | undefined = undefined;
  let details: Record<string, any> | undefined = undefined;

  // Type guard to check if apiError is an object with properties
  const isErrorObject = (err: unknown): err is Record<string, any> => {
    return typeof err === 'object' && err !== null;
  };

  if (isErrorObject(apiError)) {
    // Handle different API error formats
    if (apiError.message && typeof apiError.message === 'string') {
      message = apiError.message;
    } else if (apiError.error) {
      message = typeof apiError.error === 'string' ? apiError.error : 'API Error';
    }

    // Extract error code if available
    if (apiError.code && typeof apiError.code === 'string') {
      code = apiError.code;
    } else if (apiError.status && typeof apiError.status === 'number') {
      code = `HTTP_${apiError.status}`;
    } else if (apiError.statusCode && typeof apiError.statusCode === 'number') {
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
 * @param error - Error to log
 * @param context - Additional context information
 */
export const logError = (error: AppError | Error | unknown, context: Record<string, any> = {}): void => {
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
 * @param error - Error object
 * @param fallbackMessages - Fallback messages for different error categories
 * @returns User-friendly error message
 */
export const getUserFriendlyMessage = (
  error: AppError | Error | unknown, 
  fallbackMessages: Partial<Record<ErrorCategory, string>> = {}
): string => {
  // Type guard to check if error is an AppError
  const isAppError = (err: unknown): err is AppError => {
    return typeof err === 'object' && 
           err !== null && 
           'category' in err && 
           'message' in err;
  };

  // If it's already a formatted AppError, use its message
  if (isAppError(error)) {
    return error.message;
  }

  // Otherwise, categorize and provide appropriate message
  const category = categorizeError(error);
  const defaultMessages: Record<ErrorCategory, string> = {
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
  
  // Type guard to check if error is an object with a message property
  const hasMessage = (err: unknown): err is { message: string } => {
    return typeof err === 'object' && 
           err !== null && 
           'message' in err && 
           typeof (err as any).message === 'string';
  };

  // Use the error message if available, otherwise use the category fallback
  return hasMessage(error) ? error.message : messages[category];
};

/**
 * Determines if an error should trigger a redirect to an error page
 * 
 * @param error - Error to evaluate
 * @returns Whether the error should trigger a redirect
 */
export const shouldRedirectToErrorPage = (error: AppError | Error | unknown): boolean => {
  if (!error) return false;
  
  // Type guard to check if error is an AppError
  const isAppError = (err: unknown): err is AppError => {
    return typeof err === 'object' && 
           err !== null && 
           'category' in err && 
           'severity' in err;
  };
  
  // Format the error if it's not already formatted
  const formattedError = isAppError(error) 
    ? error 
    : createError({
        message: hasMessage(error) ? error.message : 'Unknown error',
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

// Type guard to check if error is an object with a message property
const hasMessage = (err: unknown): err is { message: string } => {
  return typeof err === 'object' && 
         err !== null && 
         'message' in err && 
         typeof (err as any).message === 'string';
};

/**
 * Handles an error by logging it and returning a standardized error object
 * 
 * @param error - Error to handle
 * @param context - Additional context information
 * @returns Standardized error object
 */
export const handleError = (error: Error | unknown, context: Record<string, any> = {}): AppError => {
  // Categorize and format the error
  const category = categorizeError(error);
  const formattedError = createError({
    message: hasMessage(error) ? error.message : 'An unexpected error occurred',
    category,
    originalError: error,
  });

  // Log the error
  logError(formattedError, context);

  return formattedError;
};
