import React from 'react';

/**
 * Card component - A reusable card container with various styles
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {React.ReactNode} props.header - Card header content
 * @param {React.ReactNode} props.footer - Card footer content
 * @param {boolean} props.hoverable - Whether card has hover effect
 * @param {boolean} props.bordered - Whether card has border
 * @param {string} props.className - Additional CSS classes
 */
const Card = ({ 
  children, 
  header, 
  footer, 
  hoverable = false, 
  bordered = true, 
  className = '',
  ...rest 
}) => {
  // Base classes
  const baseClasses = 'bg-gray-800 rounded-lg overflow-hidden';
  
  // Border classes
  const borderClasses = bordered ? 'border border-gray-700' : '';
  
  // Hover classes
  const hoverClasses = hoverable ? 'transition-shadow duration-300 hover:shadow-lg' : '';
  
  // Combine all classes
  const cardClasses = `${baseClasses} ${borderClasses} ${hoverClasses} ${className}`;
  
  return (
    <div className={cardClasses} {...rest}>
      {header && (
        <div className="px-4 py-3 border-b border-gray-700">
          {header}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
      {footer && (
        <div className="px-4 py-3 border-t border-gray-700 bg-gray-850">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
