import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modal component - A reusable modal dialog
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {React.ReactNode} props.footer - Modal footer content
 * @param {string} props.size - Modal size: 'sm', 'md', 'lg', 'xl'
 * @param {boolean} props.closeOnEsc - Whether to close on Escape key
 * @param {boolean} props.closeOnOutsideClick - Whether to close on outside click
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnEsc = true,
  closeOnOutsideClick = true,
}) => {
  const modalRef = useRef(null);
  
  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (closeOnEsc && event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [closeOnEsc, isOpen, onClose]);
  
  // Handle outside click
  const handleOutsideClick = (event) => {
    if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    'full': 'max-w-full',
  };
  
  // Don't render if not open
  if (!isOpen) return null;
  
  // Create portal to render modal at the end of the document body
  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
        onClick={handleOutsideClick}
      >
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" aria-hidden="true"></div>
        
        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        {/* Modal panel */}
        <div 
          ref={modalRef}
          className={`inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} w-full`}
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="modal-title"
        >
          {/* Modal header */}
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium leading-6 text-white" id="modal-title">
                {title}
              </h3>
              <button
                type="button"
                className="bg-gray-800 rounded-md text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Modal content */}
          <div className="px-4 pt-0 pb-4 sm:p-6 sm:pt-0">
            {children}
          </div>
          
          {/* Modal footer */}
          {footer && (
            <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse bg-gray-850 border-t border-gray-700">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
