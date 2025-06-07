import React, { useState, useEffect } from 'react';
import Button from './Button';
import theme from '../../design/theme';
import { flexContainer } from '../../design/utils';

/**
 * Form component - A reusable form container with standard layout and submission handling
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onSubmit - Form submission handler
 * @param {React.ReactNode} props.children - Form content (inputs, etc.)
 * @param {string} props.submitText - Text for the submit button
 * @param {boolean} props.loading - Whether form is in loading state
 * @param {string|Object} props.error - Error message to display (string or object with field keys)
 * @param {string} props.successMessage - Success message to display
 * @param {boolean} props.hideSubmitButton - Whether to hide the submit button
 * @param {React.ReactNode} props.actions - Additional action buttons
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.useProgressiveDisclosure - Whether to use progressive disclosure for form sections
 * @param {Array} props.sections - Form sections for progressive disclosure
 * @param {boolean} props.validateOnChange - Whether to validate on field change
 * @param {boolean} props.validateOnBlur - Whether to validate on field blur
 * @param {Function} props.validate - Form validation function
 * @param {Object} props.initialValues - Initial form values
 */
const Form = ({
  onSubmit,
  children,
  submitText = 'Submit',
  loading = false,
  error = '',
  successMessage = '',
  hideSubmitButton = false,
  actions,
  className = '',
  useProgressiveDisclosure = false,
  sections = [],
  validateOnChange = false,
  validateOnBlur = true,
  validate = () => ({}),
  initialValues = {},
  ...rest
}) => {
  // State for form values, errors, touched fields, and current section
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Convert string error to object format if needed
  useEffect(() => {
    if (typeof error === 'string' && error) {
      setFormError(error);
    } else if (typeof error === 'object' && error !== null) {
      setErrors(prev => ({ ...prev, ...error }));
    }
  }, [error]);
  
  // Handle field change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => ({
      ...prev,
      [name]: fieldValue
    }));
    
    // Validate on change if enabled
    if (validateOnChange) {
      const fieldErrors = validate({ ...values, [name]: fieldValue });
      setErrors(prev => ({ ...prev, ...fieldErrors }));
    }
  };
  
  // Handle field blur
  const handleBlur = (e) => {
    const { name } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate on blur if enabled
    if (validateOnBlur) {
      const fieldErrors = validate(values);
      setErrors(prev => ({ ...prev, ...fieldErrors }));
    }
  };
  
  // Move to next section
  const nextSection = () => {
    // Validate current section fields before proceeding
    const currentSectionFields = sections[currentSection]?.fields || [];
    const sectionValues = {};
    currentSectionFields.forEach(field => {
      sectionValues[field] = values[field];
    });
    
    const sectionErrors = validate(sectionValues);
    setErrors(prev => ({ ...prev, ...sectionErrors }));
    
    // Check if there are errors in the current section
    const hasErrors = currentSectionFields.some(field => sectionErrors[field]);
    
    if (!hasErrors && currentSection < sections.length - 1) {
      setCurrentSection(prev => prev + 1);
      // Mark fields in the next section as untouched
      const nextSectionFields = sections[currentSection + 1]?.fields || [];
      const newTouched = { ...touched };
      nextSectionFields.forEach(field => {
        newTouched[field] = false;
      });
      setTouched(newTouched);
    }
  };
  
  // Move to previous section
  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const formErrors = validate(values);
    setErrors(formErrors);
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(values).forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);
    
    // Check if there are any errors
    const hasErrors = Object.keys(formErrors).length > 0;
    
    if (!hasErrors) {
      setIsSubmitting(true);
      setFormError('');
      
      try {
        // Call the onSubmit handler with form values
        await onSubmit(values);
      } catch (err) {
        setFormError(err.message || 'An error occurred during submission');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // If using progressive disclosure, navigate to the section with errors
      if (useProgressiveDisclosure && sections.length > 0) {
        // Find the first section with errors
        const sectionWithError = sections.findIndex(section => 
          section.fields.some(field => formErrors[field])
        );
        
        if (sectionWithError !== -1) {
          setCurrentSection(sectionWithError);
        }
      }
    }
  };

  // Create form context value for child components
  const formContext = {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    isSubmitting: loading || isSubmitting,
  };
  
  // Determine which content to render based on progressive disclosure
  const renderContent = () => {
    if (useProgressiveDisclosure && sections.length > 0) {
      // Get current section
      const section = sections[currentSection];
      if (!section) return null;
      
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
          {section.description && (
            <p className="text-sm text-gray-500">{section.description}</p>
          )}
          <div className="space-y-4">
            {/* Only render children for the current section */}
            {React.Children.map(children, child => {
              // Check if the child is a form field that belongs to the current section
              if (React.isValidElement(child) && section.fields.includes(child.props.name)) {
                return React.cloneElement(child, {
                  value: values[child.props.name] || '',
                  error: errors[child.props.name],
                  touched: touched[child.props.name],
                  onChange: handleChange,
                  onBlur: handleBlur,
                });
              }
              return null;
            })}
          </div>
          
          {/* Section progress indicator */}
          <div className="mt-4 mb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Step {currentSection + 1} of {sections.length}
              </span>
              <span className="text-xs text-gray-500">
                {Math.round(((currentSection + 1) / sections.length) * 100)}% Complete
              </span>
            </div>
            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out" 
                style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      );
    }
    
    // If not using progressive disclosure, render all children
    return (
      <div className="space-y-4">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              value: values[child.props.name] || '',
              error: errors[child.props.name],
              touched: touched[child.props.name],
              onChange: handleChange,
              onBlur: handleBlur,
            });
          }
          return child;
        })}
      </div>
    );
  };
  
  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`} {...rest}>
      {/* Form content */}
      {renderContent()}
      
      {/* Error message */}
      {formError && (
        <div className="p-3 rounded-md bg-red-50 border border-red-300 text-red-700">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{formError}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Success message */}
      {successMessage && (
        <div className="p-3 rounded-md bg-green-50 border border-green-300 text-green-700">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Form actions */}
      {(!hideSubmitButton || actions || useProgressiveDisclosure) && (
        <div className="flex items-center justify-between space-x-3 pt-4 border-t border-gray-200">
          {/* Back button for progressive disclosure */}
          {useProgressiveDisclosure && currentSection > 0 ? (
            <Button 
              type="button" 
              variant="outline" 
              onClick={prevSection}
              disabled={loading || isSubmitting}
            >
              Back
            </Button>
          ) : <div></div>}
          
          <div className="flex items-center space-x-3">
            {actions}
            
            {/* Next button for progressive disclosure */}
            {useProgressiveDisclosure && currentSection < sections.length - 1 ? (
              <Button 
                type="button" 
                variant="primary" 
                onClick={nextSection}
                disabled={loading || isSubmitting}
              >
                Next
              </Button>
            ) : null}
            
            {/* Submit button */}
            {(!useProgressiveDisclosure || currentSection === sections.length - 1) && !hideSubmitButton && (
              <Button 
                type="submit" 
                variant="primary" 
                disabled={loading || isSubmitting}
              >
                {(loading || isSubmitting) ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  submitText
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </form>
  );
};

export default Form;
