import React from 'react';
import { ErrorCategory, getUserFriendlyMessage } from '../../utils/errorUtils';
import theme from '../../design/theme';

/**
 * Component for displaying API errors with appropriate styling and messaging
 * 
 * @param {Object} props - Component props
 * @param {Object} props.error - Error object to display
 * @param {boolean} props.inline - Whether to display the error inline (compact) or as a block
 * @param {Function} props.onRetry - Optional callback for retry action
 * @param {Function} props.onDismiss - Optional callback for dismissing the error
 * @param {string} props.className - Additional CSS class names
 * @returns {React.ReactElement} API error display component
 */
const ApiErrorDisplay = ({ 
  error, 
  inline = false, 
  onRetry, 
  onDismiss,
  className = '' 
}) => {
  if (!error) return null;
  
  // Get appropriate message based on error category
  const message = getUserFriendlyMessage(error);
  
  // Determine icon based on error category
  const getErrorIcon = () => {
    const category = error.category || ErrorCategory.UNKNOWN;
    
    switch (category) {
      case ErrorCategory.NETWORK:
        return '🌐❌';
      case ErrorCategory.AUTH:
        return '🔒❌';
      case ErrorCategory.PERMISSION:
        return '🚫';
      case ErrorCategory.VALIDATION:
        return '⚠️';
      case ErrorCategory.SERVER:
        return '🖥️❌';
      case ErrorCategory.NOT_FOUND:
        return '🔍❌';
      default:
        return '❌';
    }
  };

  // Inline (compact) styles
  const inlineStyles = {
    display: 'flex',
    alignItems: 'center',
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    backgroundColor: theme.colors.background.errorLight,
    border: `1px solid ${theme.colors.border.error}`,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.text.error,
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing[3],
  };

  // Block (full) styles
  const blockStyles = {
    padding: theme.spacing[4],
    backgroundColor: theme.colors.background.errorLight,
    border: `1px solid ${theme.colors.border.error}`,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text.error,
    marginBottom: theme.spacing[4],
  };

  // Icon styles
  const iconStyles = {
    marginRight: theme.spacing[2],
    fontSize: inline ? theme.typography.fontSize.md : theme.typography.fontSize.lg,
  };

  // Message styles
  const messageStyles = {
    margin: 0,
    flex: 1,
  };

  // Button styles
  const buttonStyles = {
    backgroundColor: 'transparent',
    border: 'none',
    color: theme.colors.text.error,
    cursor: 'pointer',
    padding: theme.spacing[1],
    marginLeft: theme.spacing[2],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  };

  // Retry button styles
  const retryButtonStyles = {
    ...buttonStyles,
    textDecoration: 'underline',
  };

  return (
    <div 
      style={inline ? inlineStyles : blockStyles} 
      className={className}
      role="alert"
      aria-live="assertive"
    >
      <span style={iconStyles} aria-hidden="true">
        {getErrorIcon()}
      </span>
      
      <p style={messageStyles}>{message}</p>
      
      {onRetry && (
        <button 
          onClick={onRetry} 
          style={retryButtonStyles}
          aria-label="Retry"
        >
          Retry
        </button>
      )}
      
      {onDismiss && (
        <button 
          onClick={onDismiss} 
          style={buttonStyles}
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
      
      {/* Show error details in development environment */}
      {process.env.NODE_ENV === 'development' && error.details && !inline && (
        <pre style={{ 
          marginTop: theme.spacing[3],
          padding: theme.spacing[2],
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          borderRadius: theme.borderRadius.sm,
          fontSize: theme.typography.fontSize.xs,
          overflow: 'auto',
          maxHeight: '200px'
        }}>
          {JSON.stringify(error.details, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default ApiErrorDisplay;
