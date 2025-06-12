import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { useTicket } from '../../../context/TicketContext';
import { useAuth } from '../../../context/AuthContext';
import { calculateHoursBetween } from '../../../utils/validators';
import { Card, Button, Form, LoadingSpinner } from '../../ui';
import EnhancedInput from '../../ui/EnhancedInput';
import EnhancedSelect from '../../ui/EnhancedSelect';
import DateInput from '../../ui/DateInput';
import { useDebounce } from '../../../hooks';

/**
 * BaseJobTicketForm - Core form component that centralizes common job ticket functionality
 * 
 * This component provides the foundation for all job ticket forms with:
 * - Common fields (date, company, customer, location, work hours, drive hours, description)
 * - Form state management via React Hook Form
 * - Time calculation logic for work and drive hours
 * - Draft saving functionality
 * - Form submission handling
 * - Common UI elements and layout
 * - Performance optimizations (memoization, debouncing, etc.)
 * 
 * Job-specific forms should extend this component by:
 * 1. Importing and using it as a base
 * 2. Adding job-specific fields
 * 3. Extending the form data with job-specific values
 * 4. Customizing validation rules if needed
 */

/**
 * Base Job Ticket Form Component
 * Provides common functionality for all job ticket forms
 */
const BaseJobTicketForm = ({ 
  children, 
  onSubmit, 
  readOnly = false, 
  draftData = null 
}) => {
  const { t } = useLanguage();
  const { formData, updateFormData, saveJobTicketAsDraft, submitJobTicket, isSubmitting, submitError, submitSuccess } = useTicket();
  const { user } = useAuth();
  
  // Setup React Hook Form with memoized default values
  const defaultValues = useMemo(() => draftData || formData || {}, [draftData, formData]);
  
  const navigate = useNavigate();

  const { register, handleSubmit, control, setValue, watch, reset, formState: { errors } } = useForm({
    defaultValues,
    mode: 'onChange' // Validate on change for better UX
  });

  const resetForm = useCallback(() => {
    reset();
    updateFormData({});
  }, [reset, updateFormData]);

  // Watch time fields to calculate totals
  const workStartTime = watch('workStartTime');
  const workEndTime = watch('workEndTime');
  const driveStartTime = watch('driveStartTime');
  const driveEndTime = watch('driveEndTime');
  
  // Debounce time calculations to prevent excessive re-renders
  const debouncedWorkStartTime = useDebounce(workStartTime, 300);
  const debouncedWorkEndTime = useDebounce(workEndTime, 300);
  const debouncedDriveStartTime = useDebounce(driveStartTime, 300);
  const debouncedDriveEndTime = useDebounce(driveEndTime, 300);
  
  // Memoized calculation functions
  const calculateWorkHours = useCallback(() => {
    if (debouncedWorkStartTime && debouncedWorkEndTime) {
      return calculateHoursBetween(debouncedWorkStartTime, debouncedWorkEndTime);
    }
    return null;
  }, [debouncedWorkStartTime, debouncedWorkEndTime]);
  
  const calculateDriveHours = useCallback(() => {
    if (debouncedDriveStartTime && debouncedDriveEndTime) {
      return calculateHoursBetween(debouncedDriveStartTime, debouncedDriveEndTime);
    }
    return null;
  }, [debouncedDriveStartTime, debouncedDriveEndTime]);
  
  // Update total hours when start/end times change - with debounced values
  useEffect(() => {
    const hours = calculateWorkHours();
    if (hours !== null) {
      setValue('workTotalHours', hours);
    }
  }, [calculateWorkHours, setValue]);
  
  useEffect(() => {
    const hours = calculateDriveHours();
    if (hours !== null) {
      setValue('driveTotalHours', hours);
    }
  }, [calculateDriveHours, setValue]);
  
  // Auto-save form data when fields change - with debouncing
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (type === 'change' && name) {
        // Use a timeout to debounce updates to form data
        const timeoutId = setTimeout(() => {
          updateFormData(name, value[name]);
        }, 500);
        
        return () => clearTimeout(timeoutId);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [watch, updateFormData]);
  
  // Form state - use local state for UI feedback since context state might be shared
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

  useEffect(() => {
    if (submitSuccess) {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [submitSuccess]);
  
  useEffect(() => {
    if (submitError) {
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 5000);
    }
  }, [submitError]);
  
  // Handle form submission - memoized to prevent recreation
  const handleFormSubmit = async (data) => {
    setIsSubmittingLocal(true);
    setShowSuccessMessage(false);
    setShowErrorMessage(false);
    setErrorMessage('');
    
    try {
      // Submit to API first - only save as draft if successful
      const result = await submitJobTicket(data, setSubmissionProgress);
      
      if (result.success) {
        // Save as submitted ticket
        const draftData = {
          ...data,
          status: 'submitted',
          id: result.id || data.id || `ticket-${Date.now()}`
        };
        saveJobTicketAsDraft(draftData);
        
        setShowSuccessMessage(true);
        resetForm();
        
        // Navigate to success page after delay
        setTimeout(() => {
          navigate('/ticket-submitted', { 
            state: { 
              ticketNumber: result.ticketNumber,
              message: result.message
            } 
          });
        }, 1500);
      } else {
        // Show specific error message from API
        setShowErrorMessage(true);
        setErrorMessage(result.message || 'Failed to submit job ticket');
        console.error('Submission failed:', result.error);
      }
    } catch (error) {
      setShowErrorMessage(true);
      setErrorMessage(error.message || 'An unexpected error occurred');
      console.error('Error in form submission:', error);
    } finally {
      setIsSubmittingLocal(false);
      setSubmissionProgress(0);
    }
  };
  
  // Pre-fill submittedBy field with user's name if available
  useEffect(() => {
    if (user?.name && !watch('submittedBy')) {
      setValue('submittedBy', user.name);
    }
  }, [user, setValue, watch]);
  
  // Performance monitoring
  const renderStart = useMemo(() => performance.now(), []);
  
  useEffect(() => {
    const renderTime = performance.now() - renderStart;
    console.log(`BaseJobTicketForm rendered in ${renderTime.toFixed(2)}ms`);
    
    return () => {
      performance.clearMarks('base-job-ticket-form-render');
    };
  }, [renderStart]);
  
  return (
    <Form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8 max-w-3xl mx-auto" autoComplete="off" hideSubmitButton={true}>
      {/* Job Date */}
      <DateInput
        label={t('jobTicket.date')}
        id="jobDate"
        name="jobDate"
        register={register}
        setValue={setValue}
        rules={{ required: true }}
        error={errors.jobDate ? t('validation.required') : undefined}
        readOnly={readOnly}
      />
      
      {/* Company Name */}
      <EnhancedInput
        label={t('jobTicket.companyName')}
        type="text"
        id="companyName"
        name="companyName"
        register={register}
        required={true}
        error={errors.companyName && t('jobTicket.validation.companyRequired')}
        readOnly={readOnly}
      />
      
      {/* Customer Name */}
      <EnhancedInput
        label={t('jobTicket.customerName')}
        type="text"
        id="customerName"
        name="customerName"
        register={register}
        error={errors.customerName}
        readOnly={readOnly}
      />
      
      {/* Location */}
      <EnhancedInput
        label={t('jobTicket.location')}
        type="text"
        id="location"
        name="location"
        register={register}
        required={true}
        error={errors.location && t('jobTicket.validation.locationRequired')}
        readOnly={readOnly}
      />
      
      {/* Work Type field removed to eliminate duplication */}
      
      {/* Equipment */}
      <EnhancedInput
        label={t('jobTicket.equipment')}
        type="text"
        id="equipment"
        name="equipment"
        register={register}
        error={errors.equipment}
        readOnly={readOnly}
      />
      
      {/* Description of Work */}
      <div className="mb-4">
        <label htmlFor="workDescription" className="block text-sm font-medium text-white mb-1">
          {t('jobTicket.workDescription')}
          {<span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="mt-1">
          <textarea
            id="workDescription"
            name="workDescription"
            rows={4}
            className="bg-gray-800 block w-full max-w-2xl rounded-md border-2 border-orange-400 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            placeholder="Enter your work description here..."
            readOnly={readOnly}
            {...register('workDescription', { required: true })}
          />
        </div>
        {errors.workDescription && (
          <p className="mt-1 text-xs text-red-500">{t('jobTicket.validation.workDescriptionRequired')}</p>
        )}
      </div>
      
      {/* Work Hours */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <EnhancedInput
          label={t('jobTicket.workStartTime')}
          type="time"
          id="workStartTime"
          name="workStartTime"
          register={register}
          error={errors.workStartTime && t('jobTicket.validation.timeFormatInvalid')}
          readOnly={readOnly}
        />
        <EnhancedInput
          label={t('jobTicket.workEndTime')}
          type="time"
          id="workEndTime"
          name="workEndTime"
          register={register}
          error={errors.workEndTime && t('jobTicket.validation.timeFormatInvalid')}
          readOnly={readOnly}
        />
        <EnhancedInput
          label={t('jobTicket.workTotalTime')}
          type="text"
          id="workTotalHours"
          name="workTotalHours"
          register={register}
          readOnly={true}
        />
      </div>
      
      {/* Drive Hours */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <EnhancedInput
          label={t('jobTicket.travelStartTime')}
          type="time"
          id="driveStartTime"
          name="driveStartTime"
          register={register}
          error={errors.driveStartTime && t('jobTicket.validation.timeFormatInvalid')}
          readOnly={readOnly}
        />
        <EnhancedInput
          label={t('jobTicket.travelEndTime')}
          type="time"
          id="driveEndTime"
          name="driveEndTime"
          register={register}
          error={errors.driveEndTime && t('jobTicket.validation.timeFormatInvalid')}
          readOnly={readOnly}
        />
        <EnhancedInput
          label={t('jobTicket.travelTotalTime')}
          type="text"
          id="driveTotalHours"
          name="driveTotalHours"
          register={register}
          readOnly={true}
        />
      </div>
      

      
      {/* Submitted By field moved to bottom of form */}
      
      {/* Render children (job-specific fields) */}
      {children}
      
      {/* Customer Signature (using original submittedBy field name for data consistency) */}
      <div className="mt-6 mb-4">
        <EnhancedInput
          label="Customer Signature"
          type="text"
          id="submittedBy"
          name="submittedBy"
          register={register}
          error={errors.submittedBy}
          readOnly={readOnly}
        />
      </div>
      
      {/* Status Messages */}
      {showSuccessMessage && (
        <Card className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">{t('common.success')}!</strong>
          <span className="block sm:inline"> {t('jobTicket.submitted')}</span>
        </Card>
      )}
      
      {showErrorMessage && (
        <Card className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">{t('common.error')}!</strong>
          <span className="block sm:inline"> {errorMessage || t('jobTicket.submitError')}</span>
        </Card>
      )}
      
      {/* Submit Button */}
      {!readOnly && (
        <div className="pt-5">
          <div className="flex justify-center sm:justify-end">
            <Button
              type="submit"
              disabled={isSubmittingLocal}
              variant={isSubmittingLocal ? "disabled" : "success"}
              size="lg"
            >
              {isSubmittingLocal ? (
                <div className="flex items-center">
                  {t('jobTicket.submitting')}
                  <LoadingSpinner size="sm" className="ml-2" />
                </div>
              ) : "Submit Job Ticket!"}
            </Button>
          </div>
        </div>
      )}
    </Form>
  );
};

// Export memoized component to prevent unnecessary re-renders
export default React.memo(BaseJobTicketForm);
