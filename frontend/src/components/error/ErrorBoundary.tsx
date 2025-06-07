import React, { Component, ErrorInfo } from 'react';
import { logError, createError } from '../../utils/errorUtils';
import { ErrorBoundaryProps, FallbackProps, ErrorCategory } from '../../types/errors';
import ErrorFallback from './ErrorFallback';

/**
 * ErrorBoundary component that catches JavaScript errors in its child component tree
 * and displays a fallback UI instead of crashing the whole application
 * 
 * @example
 * // Basic usage
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * 
 * @example
 * // With custom fallback
 * <ErrorBoundary 
 *   fallback={<CustomErrorUI />}
 *   onError={(error, info) => reportError(error, info)}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  /**
   * Update state when an error occurs
   * This is called during the "render" phase, so side effects are not permitted
   * 
   * @param error - The error that was thrown
   * @returns New state with error information
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      error 
    };
  }

  /**
   * Handle the error and log details
   * This is called during the "commit" phase, so side effects are permitted
   * 
   * @param error - The error that was thrown
   * @param errorInfo - React component stack information
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Format the error
    const formattedError = createError({
      message: error.message || 'An unexpected component error occurred',
      category: ErrorCategory.CLIENT,
      originalError: error,
      details: {
        componentStack: errorInfo?.componentStack
      }
    });

    // Log the error
    logError(formattedError, {
      component: this.props.componentName || 'Unknown Component',
      location: window.location.href
    });

    // Store error info for rendering
    this.setState({ errorInfo });

    // Call the onError prop if provided
    if (typeof this.props.onError === 'function') {
      this.props.onError(formattedError, errorInfo);
    }
  }

  /**
   * Reset the error state to allow recovery
   */
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): React.ReactNode {
    const { fallback, children, fallbackRender } = this.props;
    const { hasError, error, errorInfo } = this.state;

    // If there's no error, render children normally
    if (!hasError) {
      return children;
    }

    // Prepare fallback props
    const fallbackProps: FallbackProps = {
      error,
      errorInfo,
      resetErrorBoundary: this.handleReset
    };

    // If a custom fallback render function is provided, use it
    if (typeof fallbackRender === 'function') {
      return fallbackRender(fallbackProps);
    }

    // If a custom fallback component is provided, use it
    if (fallback) {
      return React.cloneElement(fallback, fallbackProps);
    }

    // Otherwise, use the default error fallback
    // Cast to any to bypass TypeScript error with null values
    return <ErrorFallback {...(fallbackProps as any)} />;
  }
}

export default ErrorBoundary;
