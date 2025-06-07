import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Theme } from '../types/theme';
import { AppError } from '../types/errors';
import theme from '../design/theme';

// Type assertion to ensure theme has the expected structure
const typedTheme = theme as unknown as Theme;

/**
 * Interface for location state containing error information
 */
interface ErrorLocationState {
  error?: AppError;
  returnPath?: string;
}

/**
 * Global error page component for displaying critical application errors
 * 
 * @returns Error page component
 */
const ErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract error and return path from location state
  const state = location.state as ErrorLocationState | null;
  const error = state?.error;
  const returnPath = state?.returnPath || '/';
  
  // Handle refresh button click
  const handleRefresh = () => {
    window.location.reload();
  };
  
  // Handle return button click
  const handleReturn = () => {
    navigate(returnPath);
  };
  
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: typedTheme.spacing[4],
    backgroundColor: typedTheme.colors.background.default,
    color: typedTheme.colors.text.primary,
  };
  
  const cardStyles: React.CSSProperties = {
    backgroundColor: typedTheme.colors.background.paper,
    borderRadius: typedTheme.borderRadius.lg,
    boxShadow: typedTheme.shadows.lg,
    padding: typedTheme.spacing[6],
    maxWidth: '600px',
    width: '100%',
    textAlign: 'center',
  };
  
  const iconStyles: React.CSSProperties = {
    fontSize: '4rem',
    marginBottom: typedTheme.spacing[4],
    color: typedTheme.colors.text.error,
  };
  
  const headingStyles: React.CSSProperties = {
    fontSize: typedTheme.typography.fontSize.xl,
    fontWeight: typedTheme.typography.fontWeight.bold,
    marginBottom: typedTheme.spacing[3],
    color: typedTheme.colors.text.primary,
  };
  
  const messageStyles: React.CSSProperties = {
    fontSize: typedTheme.typography.fontSize.md,
    marginBottom: typedTheme.spacing[5],
    color: typedTheme.colors.text.secondary,
  };
  
  const buttonContainerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: typedTheme.spacing[3],
    marginTop: typedTheme.spacing[4],
  };
  
  const primaryButtonStyles: React.CSSProperties = {
    backgroundColor: typedTheme.colors.button.primary.background,
    color: typedTheme.colors.button.primary.text,
    border: 'none',
    borderRadius: typedTheme.borderRadius.md,
    padding: `${typedTheme.spacing[2]} ${typedTheme.spacing[4]}`,
    fontSize: typedTheme.typography.fontSize.md,
    fontWeight: typedTheme.typography.fontWeight.medium,
    cursor: 'pointer',
    transition: `background-color ${typedTheme.transitions.duration.fast} ${typedTheme.transitions.timing.ease}`,
  };
  
  const secondaryButtonStyles: React.CSSProperties = {
    backgroundColor: typedTheme.colors.button.secondary.background,
    color: typedTheme.colors.button.secondary.text,
    border: `1px solid ${typedTheme.colors.button.secondary.border}`,
    borderRadius: typedTheme.borderRadius.md,
    padding: `${typedTheme.spacing[2]} ${typedTheme.spacing[4]}`,
    fontSize: typedTheme.typography.fontSize.md,
    fontWeight: typedTheme.typography.fontWeight.medium,
    cursor: 'pointer',
    transition: `background-color ${typedTheme.transitions.duration.fast} ${typedTheme.transitions.timing.ease}`,
  };
  
  const errorDetailsStyles: React.CSSProperties = {
    marginTop: typedTheme.spacing[5],
    padding: typedTheme.spacing[3],
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: typedTheme.borderRadius.sm,
    textAlign: 'left',
    fontSize: typedTheme.typography.fontSize.sm,
    overflow: 'auto',
    maxHeight: '200px',
  };

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        <div style={iconStyles} aria-hidden="true">
          ⚠️
        </div>
        
        <h1 style={headingStyles}>
          {error?.message || 'Something went wrong'}
        </h1>
        
        <p style={messageStyles}>
          We're sorry, but we encountered an unexpected error.
          You can try refreshing the page or returning to the previous page.
        </p>
        
        <div style={buttonContainerStyles}>
          <button 
            onClick={handleReturn}
            style={secondaryButtonStyles}
          >
            Return to Previous Page
          </button>
          
          <button 
            onClick={handleRefresh}
            style={primaryButtonStyles}
          >
            Refresh Page
          </button>
        </div>
        
        {/* Show error details in development environment */}
        {process.env.NODE_ENV === 'development' && error && (
          <div style={errorDetailsStyles}>
            <p><strong>Error Details (Development Only):</strong></p>
            <pre>
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorPage;
