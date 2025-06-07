import React from 'react';
import { getUserFriendlyMessage } from '../../utils/errorUtils';
import theme from '../../design/theme';
import { ApiErrorDisplayProps, ErrorCategory } from '../../types/errors';
import { Theme } from '../../types/theme';

// Type assertion to ensure theme has the expected structure
const typedTheme = theme as unknown as Theme;

/**
 * Component for displaying API errors with appropriate styling and messaging
 * 
 * @param props - Component props
 * @returns API error display component
 */
const ApiErrorDisplay: React.FC<ApiErrorDisplayProps> = ({ 
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
  const getErrorIcon = (): string => {
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
  const inlineStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: `${typedTheme.spacing[2]} ${typedTheme.spacing[3]}`,
    backgroundColor: 'rgba(255, 200, 200, 0.2)', // Light error background
    border: `1px solid ${typedTheme.colors.border.error}`,
    borderRadius: typedTheme.borderRadius.sm,
    color: typedTheme.colors.text.error,
    fontSize: typedTheme.typography.fontSize.sm,
    marginBottom: typedTheme.spacing[3],
  };

  // Block (full) styles
  const blockStyles: React.CSSProperties = {
    padding: typedTheme.spacing[4],
    backgroundColor: 'rgba(255, 200, 200, 0.2)', // Light error background
    border: `1px solid ${typedTheme.colors.border.error}`,
    borderRadius: typedTheme.borderRadius.md,
    color: typedTheme.colors.text.error,
    marginBottom: typedTheme.spacing[4],
  };

  // Icon styles
  const iconStyles: React.CSSProperties = {
    marginRight: typedTheme.spacing[2],
    fontSize: inline ? typedTheme.typography.fontSize.md : typedTheme.typography.fontSize.lg,
  };

  // Message styles
  const messageStyles: React.CSSProperties = {
    margin: 0,
    flex: 1,
  };

  // Button styles
  const buttonStyles: React.CSSProperties = {
    backgroundColor: 'transparent',
    border: 'none',
    color: typedTheme.colors.text.error,
    cursor: 'pointer',
    padding: typedTheme.spacing[1],
    marginLeft: typedTheme.spacing[2],
    fontSize: typedTheme.typography.fontSize.sm,
    fontWeight: typedTheme.typography.fontWeight.medium,
  };

  // Retry button styles
  const retryButtonStyles: React.CSSProperties = {
    ...buttonStyles,
    textDecoration: 'underline',
  };

  // Details styles
  const detailsStyles: React.CSSProperties = {
    marginTop: typedTheme.spacing[3],
    padding: typedTheme.spacing[2],
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: typedTheme.borderRadius.sm,
    fontSize: typedTheme.typography.fontSize.xs,
    overflow: 'auto',
    maxHeight: '200px',
    whiteSpace: 'pre-wrap',
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
        <pre style={detailsStyles}>
          {JSON.stringify(error.details, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default ApiErrorDisplay;
