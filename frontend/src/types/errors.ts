/**
 * TypeScript type definitions for error handling
 */

/**
 * Error categories
 */
export enum ErrorCategory {
  /** Network-related errors (e.g., failed requests, timeouts) */
  NETWORK = 'network',
  /** Authentication errors (e.g., invalid credentials, expired tokens) */
  AUTH = 'auth',
  /** Permission errors (e.g., insufficient privileges) */
  PERMISSION = 'permission',
  /** Validation errors (e.g., invalid form input) */
  VALIDATION = 'validation',
  /** Server errors (e.g., 500 internal server errors) */
  SERVER = 'server',
  /** Client errors (e.g., JavaScript runtime errors) */
  CLIENT = 'client',
  /** Not found errors (e.g., 404 resources not found) */
  NOT_FOUND = 'not_found',
  /** Unknown or uncategorized errors */
  UNKNOWN = 'unknown',
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  /** Critical errors that prevent the application from functioning */
  CRITICAL = 'critical',
  /** Errors that affect functionality but don't crash the application */
  ERROR = 'error',
  /** Warnings that might affect user experience but don't break functionality */
  WARNING = 'warning',
  /** Informational messages about potential issues */
  INFO = 'info',
}

/**
 * Standard error object structure
 */
export interface AppError {
  /** Human-readable error message */
  message: string;
  /** Error category from ErrorCategory enum */
  category: ErrorCategory;
  /** Error severity from ErrorSeverity enum */
  severity: ErrorSeverity;
  /** Error code (if available) */
  code?: string;
  /** Additional error details */
  details?: Record<string, any>;
  /** Original error object */
  originalError?: Error | unknown;
  /** Error stack trace (in development) */
  stack?: string;
  /** When the error occurred */
  timestamp: string;
}

/**
 * Error creation options
 */
export interface ErrorOptions {
  /** Human-readable error message */
  message: string;
  /** Error category */
  category?: ErrorCategory;
  /** Error severity */
  severity?: ErrorSeverity;
  /** Error code */
  code?: string;
  /** Additional error details */
  details?: Record<string, any>;
  /** Original error object */
  originalError?: Error | unknown;
}

/**
 * Error boundary props
 */
export interface ErrorBoundaryProps {
  /** Component children */
  children: React.ReactNode;
  /** Custom fallback component */
  fallback?: React.ReactElement;
  /** Custom fallback render function */
  fallbackRender?: (props: FallbackProps) => React.ReactNode;
  /** Error handler function */
  onError?: (error: AppError, errorInfo: React.ErrorInfo) => void;
  /** Component name for error logging */
  componentName?: string;
}

/**
 * Error fallback props
 */
export interface FallbackProps {
  /** The error that was caught */
  error: Error | null;
  /** React component stack information */
  errorInfo: React.ErrorInfo | null;
  /** Function to reset the error boundary */
  resetErrorBoundary: () => void;
}

/**
 * API error display props
 */
export interface ApiErrorDisplayProps {
  /** Error object to display */
  error: AppError | null;
  /** Whether to display the error inline (compact) or as a block */
  inline?: boolean;
  /** Optional callback for retry action */
  onRetry?: () => void;
  /** Optional callback for dismissing the error */
  onDismiss?: () => void;
  /** Additional CSS class names */
  className?: string;
}

/**
 * useApiError hook options
 */
export interface UseApiErrorOptions {
  /** Whether to redirect to error page on critical errors */
  redirectOnCritical?: boolean;
  /** Path to redirect to for critical errors */
  errorPagePath?: string;
  /** Optional callback when an error occurs */
  onError?: (error: AppError) => void;
}
