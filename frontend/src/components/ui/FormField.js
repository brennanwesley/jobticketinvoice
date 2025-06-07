import React from 'react';
import theme from '../../design/theme';

/**
 * FormField component - A wrapper for form inputs with consistent styling and layout
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Field ID
 * @param {string} props.name - Field name
 * @param {string} props.label - Field label
 * @param {boolean} props.required - Whether field is required
 * @param {React.ReactNode} props.children - Input component
 * @param {string} props.error - Error message
 * @param {string} props.helperText - Helper text
 * @param {boolean} props.touched - Whether field has been touched
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.layout - Field layout (horizontal, vertical)
 * @param {boolean} props.hideLabel - Whether to hide the label visually
 */
const FormField = ({
  id,
  name,
  label,
  required = false,
  children,
  error,
  helperText,
  touched = false,
  className = '',
  layout = 'vertical',
  hideLabel = false,
}) => {
  // Container styles based on layout
  const containerStyles = {
    vertical: {
      marginBottom: theme.spacing[4],
    },
    horizontal: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: theme.spacing[4],
    },
  }[layout];

  // Label styles
  const labelStyles = {
    display: hideLabel ? 'none' : 'block',
    marginBottom: layout === 'vertical' ? theme.spacing[1] : 0,
    marginRight: layout === 'horizontal' ? theme.spacing[4] : 0,
    width: layout === 'horizontal' ? '30%' : 'auto',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.label,
  };

  // Field content styles
  const fieldContentStyles = {
    flex: layout === 'horizontal' ? 1 : 'auto',
  };

  // Helper text styles
  const helperTextStyles = {
    marginTop: theme.spacing[1],
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  };

  // Error text styles
  const errorTextStyles = {
    marginTop: theme.spacing[1],
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.error[500],
  };

  // Clone child with additional props
  const enhancedChild = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        id: id || `field-${name}`,
        name,
        error,
        touched,
        required,
        'aria-describedby': error ? `${name}-error` : helperText ? `${name}-helper` : undefined,
      });
    }
    return child;
  });

  return (
    <div style={containerStyles} className={className}>
      {label && (
        <label htmlFor={id || `field-${name}`} style={labelStyles}>
          {label}
          {required && <span style={{ color: theme.colors.error[500], marginLeft: theme.spacing[1] }}>*</span>}
        </label>
      )}
      <div style={fieldContentStyles}>
        {enhancedChild}
        
        {/* Helper text */}
        {helperText && !error && (
          <p id={`${name}-helper`} style={helperTextStyles}>{helperText}</p>
        )}
        
        {/* Error message */}
        {error && touched && (
          <p id={`${name}-error`} style={errorTextStyles} role="alert">{error}</p>
        )}
      </div>
    </div>
  );
};

export default FormField;
