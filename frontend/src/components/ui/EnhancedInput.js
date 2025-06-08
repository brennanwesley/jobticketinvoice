import React from 'react';

/**
 * EnhancedInput - A simplified input component with improved visibility
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
 * @param {Object} props.register - React Hook Form register function
 */
const EnhancedInput = ({
  id,
  name,
  type = 'text',
  label,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  error,
  register,
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
      
      {/* Input field */}
      <div className="relative">
        <input
          id={id}
          name={name}
          type={type}
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
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          autoComplete="off"
          {...(register && register(name))}
          {...rest}
        />
      </div>
      
      {/* Error message */}
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};

export default EnhancedInput;
