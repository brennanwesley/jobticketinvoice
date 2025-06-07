import React, { Component } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors in child component tree and displays a fallback UI
 * instead of crashing the whole application
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

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // You could also send to a reporting service here
    // reportErrorToService(error, errorInfo);
  }

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { fallback, children } = this.props;
    
    if (hasError) {
      // You can render any custom fallback UI
      if (fallback) {
        return fallback(error, errorInfo);
      }
      
      return (
        <div className="p-6 bg-red-900 bg-opacity-20 rounded-lg border border-red-700 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-500 mb-2">Something went wrong</h2>
          <p className="text-gray-300 mb-4">
            We&apos;re sorry, but there was an error loading this component.
          </p>
          {process.env.NODE_ENV === 'development' && error && (
            <details className="text-left bg-gray-800 p-4 rounded-md mt-4 overflow-auto max-h-64">
              <summary className="text-orange-500 cursor-pointer mb-2">Error Details</summary>
              <pre className="text-xs text-gray-400 whitespace-pre-wrap">
                {error.toString()}
                {errorInfo && errorInfo.componentStack}
              </pre>
            </details>
          )}
          <button
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
