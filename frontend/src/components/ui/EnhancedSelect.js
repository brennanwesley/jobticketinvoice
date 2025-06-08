import React from 'react';

/**
 * EnhancedSelect - A simplified select component with improved visibility
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Select ID
 * @param {string} props.name - Select name
 * @param {string} props.label - Select label
 * @param {boolean} props.required - Whether select is required
 * @param {boolean} props.disabled - Whether select is disabled
 * @param {boolean} props.readOnly - Whether select is read-only
 * @param {string} props.error - Error message
 * @param {Object} props.register - React Hook Form register function
 * @param {React.ReactNode} props.children - Select options
 */
const EnhancedSelect = ({
  id,
  name,
  label,
  required = false,
  disabled = false,
  readOnly = false,
  error,
  register,
  children,
  className = '',
  ...rest
}) => {
  return (
    <div className="mb-4">
      {/* Label with improved visibility */}
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-white mb-1" // Changed from text-gray-300 to text-white for better visibility
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Select field */}
      <div className="relative">
        <select
          id={id}
          name={name}
          className={`
            bg-gray-800 
            block 
            w-full 
            rounded-md 
            border-2 
            border-orange-400 
            text-white 
            shadow-sm 
            focus:border-orange-500 
            focus:ring-orange-500 
            sm:text-sm
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          disabled={disabled}
          {...(register && register(name))}
          {...rest}
        >
          {children}
        </select>
      </div>
      
      {/* Error message */}
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};

export default EnhancedSelect;
