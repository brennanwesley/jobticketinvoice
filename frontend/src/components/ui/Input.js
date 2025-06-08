import React, { forwardRef, useState, useEffect } from 'react';
import theme from '../../design/theme';
import { focusRing } from '../../design/utils';

/**
 * Input component - A reusable form input component with inline validation
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Input ID
 * @param {string} props.name - Input name
 * @param {string} props.type - Input type (text, email, password, etc.)
 * @param {string} props.label - Input label
 * @param {string} props.placeholder - Input placeholder
 * @param {boolean} props.required - Whether input is required
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {boolean} props.readOnly - Whether input is read-only
 * @param {string} props.error - Error message
 * @param {string} props.helperText - Helper text
 * @param {Function} props.onChange - Change handler function
 * @param {Function} props.onBlur - Blur handler function
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.register - React Hook Form register function
 * @param {string} props.value - Input value
 * @param {boolean} props.touched - Whether the field has been touched
 * @param {Function} props.validate - Validation function
 * @param {string} props.validationMessage - Success validation message
 * @param {string} props.size - Input size (sm, md, lg)
 * @param {string} props.variant - Input variant (default, filled, outlined)
 * @param {boolean} props.showValidationIcon - Whether to show validation icon
 * @param {string} props.prefix - Text or icon to show before input
 * @param {string} props.suffix - Text or icon to show after input
 * @param {boolean} props.autoValidate - Whether to validate on change
 */
const Input = forwardRef(({
  id,
  name,
  type = 'text',
  label,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  error,
  helperText,
  onChange,
  onBlur,
  className = '',
  register,
  value,
  touched = false,
  validate,
  validationMessage,
  size = 'md',
  variant = 'default',
  showValidationIcon = true,
  prefix,
  suffix,
  autoValidate = false,
  ...rest
}, ref) => {
  // Local state for validation
  const [localValue, setLocalValue] = useState(value || '');
  const [isValid, setIsValid] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const [localError, setLocalError] = useState('');
  
  // Update local value when prop changes
  useEffect(() => {
    if (value !== undefined) {
      setLocalValue(value);
    }
  }, [value]);
  
  // Update local error when prop changes
  useEffect(() => {
    if (error) {
      setLocalError(error);
      setIsValid(false);
    } else {
      setLocalError('');
    }
  }, [error]);
  
  // Handle validation
  const validateInput = (val) => {
    if (!validate) return true;
    
    try {
      const result = validate(val);
      if (typeof result === 'boolean') {
        return result;
      } else if (typeof result === 'string') {
        setLocalError(result);
        return result === '';
      }
      return true;
    } catch (err) {
      console.error('Validation error:', err);
      return false;
    }
  };
  
  // Handle change
  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    // Auto validate if enabled
    if (autoValidate) {
      const valid = validateInput(newValue);
      setIsValid(valid === true);
      
      if (valid !== true && typeof valid === 'string') {
        setLocalError(valid);
      } else {
        setLocalError('');
      }
    }
    
    if (onChange) {
      onChange(e);
    }
  };
  
  // Handle blur
  const handleBlur = (e) => {
    setIsFocused(false);
    
    // Validate on blur
    const valid = validateInput(e.target.value);
    setIsValid(valid === true);
    
    if (valid !== true && typeof valid === 'string') {
      setLocalError(valid);
    } else {
      setLocalError('');
    }
    
    if (onBlur) {
      onBlur(e);
    }
  };
  
  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
  };
  // Get size-specific styles
  const sizeStyles = {
    sm: {
      padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
      fontSize: '0.75rem', // xs size
      height: '2rem',
    },
    md: {
      padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
      fontSize: '0.875rem', // sm size
      height: '2.5rem',
    },
    lg: {
      padding: `${theme.spacing[2.5]} ${theme.spacing[4]}`,
      fontSize: '1rem', // base size
      height: '3rem',
    },
  }[size];
  
  // Get variant-specific styles
  const variantStyles = {
    default: {
      backgroundColor: theme.colors.background.input,
      borderColor: theme.colors.border.input,
      color: '#ffffff', // Explicitly set to white for better visibility
    },
    filled: {
      backgroundColor: theme.colors.background.inputFilled,
      borderColor: 'transparent',
      color: '#ffffff', // Explicitly set to white for better visibility
    },
    outlined: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.border.input,
      color: '#ffffff', // Explicitly set to white for better visibility
    },
  }[variant];
  
  // Determine validation state styles
  let validationStyles = {};
  if (touched && localError) {
    validationStyles = {
      borderColor: theme.colors.error[500],
      backgroundColor: theme.colors.error[50],
    };
  } else if (touched && isValid && !localError) {
    validationStyles = {
      borderColor: theme.colors.success[500],
      backgroundColor: variant === 'filled' ? theme.colors.success[50] : variantStyles.backgroundColor,
    };
  }
  
  // Disabled styles
  const disabledStyles = disabled ? {
    opacity: 0.5,
    cursor: 'not-allowed',
    backgroundColor: theme.colors.background.disabled,
  } : {};
  
  // Focus styles
  const focusStyles = isFocused ? focusRing() : {};
  
  // Combine all styles
  const inputStyles = {
    display: 'block',
    width: '100%',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: theme.borderRadius.md,
    transition: `all ${theme.transitions.duration.normal} ${theme.transitions.timing.easeInOut}`,
    ...sizeStyles,
    ...variantStyles,
    ...validationStyles,
    ...disabledStyles,
    ...focusStyles,
  };
  
  // For backward compatibility, also generate classes
  const baseInputClasses = 'block w-full rounded-md shadow-sm sm:text-sm';
  const themeClasses = 'bg-gray-800 border-gray-700 text-white';
  const errorClasses = localError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const inputClasses = `${baseInputClasses} ${themeClasses} ${errorClasses} ${disabledClasses} ${className}`;
  
  // Validation icon based on state
  const renderValidationIcon = () => {
    if (!showValidationIcon || !touched) return null;
    
    if (localError) {
      return (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
      );
    } else if (isValid) {
      return (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
    
    return null;
  };
  
  // Label styles
  const labelStyles = {
    display: 'block',
    marginBottom: theme.spacing[1],
    fontSize: '0.875rem', // sm size
    fontWeight: 500, // medium weight
    color: theme.colors.text.secondary,
  };
  
  // Helper text styles
  const helperTextStyles = {
    marginTop: theme.spacing[1],
    fontSize: '0.75rem', // xs size
    color: theme.colors.text.secondary,
  };
  
  // Error text styles
  const errorTextStyles = {
    marginTop: theme.spacing[1],
    fontSize: '0.75rem', // xs size
    color: theme.colors?.error?.[500] || '#f44336', // Fallback to standard red
  };
  
  // Success text styles
  const successTextStyles = {
    marginTop: theme.spacing[1],
    fontSize: '0.75rem', // xs size
    color: theme.colors?.success?.[500] || '#4caf50', // Fallback to standard green
  };
  
  return (
    <div>
      {label && (
        <label htmlFor={id} style={labelStyles}>
          {label}
          {required && <span style={{ color: theme.colors?.error?.[500] || '#f44336', marginLeft: theme.spacing[1] }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative', marginTop: theme.spacing[1] }}>
        {/* Prefix */}
        {prefix && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {typeof prefix === 'string' ? (
              <span style={{ color: theme.colors.text.secondary, fontSize: '0.875rem' }}>
                {prefix}
              </span>
            ) : prefix}
          </div>
        )}
        
        <input
          id={id}
          name={name}
          type={type}
          ref={ref}
          style={{
            ...inputStyles,
            paddingLeft: prefix ? sizeStyles.height : inputStyles.padding,
            paddingRight: (suffix || showValidationIcon) ? sizeStyles.height : inputStyles.padding,
          }}
          className={inputClasses} // For backward compatibility
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          {...(register && register(name))}
          {...rest}
        />
        
        {/* Validation icon */}
        {renderValidationIcon()}
        
        {/* Suffix */}
        {suffix && !renderValidationIcon() && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {typeof suffix === 'string' ? (
              <span style={{ color: theme.colors.text.secondary, fontSize: '0.875rem' }}>
                {suffix}
              </span>
            ) : suffix}
          </div>
        )}
      </div>
      
      {/* Helper text */}
      {helperText && !localError && !validationMessage && (
        <p style={helperTextStyles}>{helperText}</p>
      )}
      
      {/* Error message */}
      {localError && touched && (
        <p style={errorTextStyles}>{localError}</p>
      )}
      
      {/* Success validation message */}
      {!localError && isValid && touched && validationMessage && (
        <p style={successTextStyles}>{validationMessage}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
