import React from 'react';
import theme from '../../design/theme';
import { FallbackProps } from '../../types/errors';
import { Theme } from '../../types/theme';

// Type assertion to ensure theme has the expected structure
const typedTheme = theme as unknown as Theme;

/**
 * Default fallback component for displaying errors
 * 
 * @param props - Component props
 * @returns Error fallback UI
 */
const ErrorFallback: React.FC<FallbackProps> = ({ error, errorInfo, resetErrorBoundary }) => {
  const containerStyles: React.CSSProperties = {
    padding: typedTheme.spacing[4],
    backgroundColor: typedTheme.colors.background.error,
    border: `1px solid ${typedTheme.colors.border.error}`,
    borderRadius: typedTheme.borderRadius.md,
    color: typedTheme.colors.text.onError,
    maxWidth: '800px',
    margin: '0 auto',
    marginTop: typedTheme.spacing[8],
    boxShadow: typedTheme.shadows.md,
  };

  const headingStyles: React.CSSProperties = {
    color: typedTheme.colors.text.error,
    marginBottom: typedTheme.spacing[4],
    fontSize: typedTheme.typography.fontSize.xl,
    fontWeight: typedTheme.typography.fontWeight.bold,
  };

  const messageStyles: React.CSSProperties = {
    fontSize: typedTheme.typography.fontSize.md,
    marginBottom: typedTheme.spacing[4],
  };

  const buttonStyles: React.CSSProperties = {
    backgroundColor: typedTheme.colors.button.primary.background,
    color: typedTheme.colors.button.primary.text,
    padding: `${typedTheme.spacing[2]} ${typedTheme.spacing[4]}`,
    border: 'none',
    borderRadius: typedTheme.borderRadius.md,
    fontSize: typedTheme.typography.fontSize.md,
    fontWeight: typedTheme.typography.fontWeight.medium,
    cursor: 'pointer',
    transition: `background-color ${typedTheme.transitions.duration.fast} ${typedTheme.transitions.timing.ease}`,
  };

  const detailsStyles: React.CSSProperties = {
    marginTop: typedTheme.spacing[4],
    padding: typedTheme.spacing[3],
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: typedTheme.borderRadius.sm,
    overflow: 'auto',
    maxHeight: '200px',
    fontSize: typedTheme.typography.fontSize.sm,
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
