import React from 'react';
import theme from '../../design/theme';

/**
 * Default fallback component for displaying errors
 * 
 * @param {Object} props - Component props
 * @param {Error} props.error - The error that was caught
 * @param {Object} props.errorInfo - React component stack information
 * @param {Function} props.resetErrorBoundary - Function to reset the error boundary
 * @returns {React.ReactElement} Error fallback UI
 */
const ErrorFallback = ({ error, errorInfo, resetErrorBoundary }) => {
  const containerStyles = {
    padding: theme.spacing[4],
    margin: theme.spacing[4],
    backgroundColor: theme.colors.background.error,
    border: `1px solid ${theme.colors.border.error}`,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text.onError,
    maxWidth: '800px',
    margin: '0 auto',
    marginTop: theme.spacing[8],
    boxShadow: theme.shadows.md,
  };

  const headingStyles = {
    color: theme.colors.text.error,
    marginBottom: theme.spacing[4],
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
  };

  const messageStyles = {
    fontSize: theme.typography.fontSize.md,
    marginBottom: theme.spacing[4],
  };

  const buttonStyles = {
    backgroundColor: theme.colors.button.primary,
    color: theme.colors.button.primaryText,
    padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: 'pointer',
    transition: `background-color ${theme.transitions.duration.fast} ${theme.transitions.timing.ease}`,
  };

  const detailsStyles = {
    marginTop: theme.spacing[4],
    padding: theme.spacing[3],
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: theme.borderRadius.sm,
    overflow: 'auto',
    maxHeight: '200px',
    fontSize: theme.typography.fontSize.sm,
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
  };

  return (
    <div style={containerStyles} role="alert">
      <h2 style={headingStyles}>Something went wrong</h2>
      <p style={messageStyles}>
        {error?.message || 'An unexpected error occurred'}
      </p>
      <button 
        onClick={resetErrorBoundary} 
        style={buttonStyles}
      >
        Try again
      </button>
      
      {/* Show error details in development environment */}
      {process.env.NODE_ENV === 'development' && errorInfo && (
        <div style={detailsStyles}>
          <p>Component Stack Error:</p>
          <pre>{errorInfo.componentStack}</pre>
        </div>
      )}
    </div>
  );
};

export default ErrorFallback;
