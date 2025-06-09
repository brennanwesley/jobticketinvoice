import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Toast notification component
 * 
 * @param {Object} props
 * @param {string} props.type - Type of toast: 'success', 'error', 'info', 'warning'
 * @param {string} props.message - Message to display
 * @param {number} props.duration - Duration in milliseconds before auto-dismissing
 * @param {boolean} props.show - Whether to show the toast
 * @param {function} props.onClose - Function to call when toast is closed
 */
export const Toast = ({ 
  type = 'info', 
  message, 
  duration = 5000, 
  show = true, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(show);
  
  // Auto-dismiss after duration
  useEffect(() => {
    setIsVisible(show);
    
    if (show && duration) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);
  
  // Handle manual close
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };
  
  if (!isVisible) return null;
  
  // Determine styles based on type
  const styles = {
    success: 'bg-green-500 bg-opacity-20 border border-green-500 text-green-500',
    error: 'bg-red-500 bg-opacity-20 border border-red-500 text-red-500',
    warning: 'bg-yellow-500 bg-opacity-20 border border-yellow-500 text-yellow-500',
    info: 'bg-blue-500 bg-opacity-20 border border-blue-500 text-blue-500',
  };
  
  return (
    <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-md shadow-lg flex items-center justify-between ${styles[type] || styles.info}`}>
      <div className="mr-3">{message}</div>
      <button 
        onClick={handleClose}
        className="text-current hover:text-opacity-70"
        aria-label="Close"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Toast;
