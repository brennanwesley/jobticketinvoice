import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import theme from '../design/theme';

/**
 * Global error page for displaying critical application errors
 * 
 * @returns {React.ReactElement} Error page component
 */
const ErrorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get error from location state or use a default error
  const error = location.state?.error || { 
    message: 'An unexpected error occurred',
    category: 'unknown'
  };
  
  // Get the return path from location state or default to home
  const returnTo = location.state?.returnTo || '/';
  
  // Container styles
  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: theme.spacing[6],
    backgroundColor: theme.colors.background.default,
    textAlign: 'center',
  };
  
  // Error icon styles
  const iconStyles = {
    fontSize: '64px',
    marginBottom: theme.spacing[4],
  };
  
  // Heading styles
  const headingStyles = {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.error,
    marginBottom: theme.spacing[4],
  };
  
  // Message styles
  const messageStyles = {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[6],
    maxWidth: '600px',
  };
  
  // Button styles
  const buttonStyles = {
    backgroundColor: theme.colors.button.primary,
    color: theme.colors.button.primaryText,
    padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    transition: `background-color ${theme.transitions.duration.fast} ${theme.transitions.timing.ease}`,
  };
  
  // Secondary button styles
  const secondaryButtonStyles = {
    ...buttonStyles,
    backgroundColor: theme.colors.button.secondary,
    color: theme.colors.button.secondaryText,
    marginLeft: theme.spacing[3],
  };
  
  // Error details styles (for development only)
  const detailsStyles = {
    marginTop: theme.spacing[6],
    padding: theme.spacing[4],
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.md,
    boxShadow: theme.shadows.sm,
    maxWidth: '800px',
    width: '100%',
    textAlign: 'left',
  };
  
  // Get appropriate error icon based on error category
  const getErrorIcon = () => {
    switch (error.category) {
      case 'network':
        return '🌐❌';
      case 'auth':
        return '🔒❌';
      case 'server':
        return '🖥️❌';
      case 'not_found':
        return '🔍❌';
      default:
        return '⚠️';
    }
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    window.location.reload();
  };
  
  // Handle return button click
  const handleReturn = () => {
    navigate(returnTo);
  };

  return (
    <div style={containerStyles}>
      <div style={iconStyles} aria-hidden="true">
        {getErrorIcon()}
      </div>
      
      <h1 style={headingStyles}>Something went wrong</h1>
      
      <p style={messageStyles}>
        {error.message || 'An unexpected error occurred. Please try refreshing the page or return to the home page.'}
      </p>
      
      <div>
        <button 
          style={buttonStyles} 
          onClick={handleRefresh}
        >
          Refresh Page
        </button>
        
        <button 
          style={secondaryButtonStyles} 
          onClick={handleReturn}
        >
          Return to Previous Page
        </button>
      </div>
      
      {/* Show error details in development environment */}
      {process.env.NODE_ENV === 'development' && (
        <div style={detailsStyles}>
          <h3>Error Details (Development Only)</h3>
          <pre style={{ overflow: 'auto' }}>
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ErrorPage;
