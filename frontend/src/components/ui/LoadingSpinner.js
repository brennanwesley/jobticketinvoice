import React from 'react';

/**
 * LoadingSpinner component
 * 
 * A customizable loading spinner with different sizes and variants
 * 
 * @param {Object} props - Component props
 * @param {string} props.size - Size of the spinner (sm, md, lg)
 * @param {string} props.variant - Color variant (primary, secondary, white)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.label - Accessibility label
 */
const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'primary',
  className = '',
  label = 'Loading...'
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3'
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'border-orange-500 border-t-transparent',
    secondary: 'border-blue-500 border-t-transparent',
    white: 'border-white border-t-transparent'
  };
  
  return (
    <div className="flex flex-col items-center justify-center" role="status">
      <div 
        className={`
          animate-spin rounded-full 
          ${sizeClasses[size] || sizeClasses.md} 
          ${variantClasses[variant] || variantClasses.primary}
          ${className}
        `}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default React.memo(LoadingSpinner);
