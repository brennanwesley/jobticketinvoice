import React, { Component } from 'react';
import { logError, ErrorCategory, createError } from '../../utils/errorUtils';
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
class ErrorBoundary extends Component {
  constructor(props) {
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
   * @param {Error} error - The error that was thrown
   * @returns {Object} New state with error information
   */
  static getDerivedStateFromError(error) {
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
   * @param {Error} error - The error that was thrown
   * @param {Object} errorInfo - React component stack information
   */
  componentDidCatch(error, errorInfo) {
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
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    const { fallback, children, fallbackRender } = this.props;
    const { hasError, error, errorInfo } = this.state;

    // If there's no error, render children normally
    if (!hasError) {
      return children;
    }

    // If a custom fallback render function is provided, use it
    if (typeof fallbackRender === 'function') {
      return fallbackRender({
        error,
        errorInfo,
        resetErrorBoundary: this.handleReset
      });
    }

    // If a custom fallback component is provided, use it
    if (fallback) {
      return React.cloneElement(fallback, {
        error,
        errorInfo,
        resetErrorBoundary: this.handleReset
      });
    }

    // Otherwise, use the default error fallback
    return (
      <ErrorFallback
        error={error}
        errorInfo={errorInfo}
        resetErrorBoundary={this.handleReset}
      />
    );
  }
}

export default ErrorBoundary;
