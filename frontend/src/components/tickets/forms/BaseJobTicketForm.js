import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useLanguage } from '../../../context/LanguageContext';
import { useTicket } from '../../../context/TicketContext';
import { useAuth } from '../../../context/AuthContext';
import { calculateHoursBetween } from '../../../utils/validators';
import { Card, Button, Input, Form, LoadingSpinner } from '../../ui';
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
  
  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm({
    defaultValues,
    mode: 'onChange' // Validate on change for better UX
  });
  
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
  
  // Handle success and error messages
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  
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
  const handleFormSubmit = useCallback(async (data) => {
    try {
      // Save to local storage first
      const savedDraft = saveJobTicketAsDraft(data);
      
      // If custom onSubmit is provided, use it
      if (onSubmit) {
        await onSubmit(savedDraft);
        return;
      }
      
      // Otherwise use default submit behavior
      await submitJobTicket(savedDraft);
    } catch (error) {
      console.error('Error submitting job ticket:', error);
    }
  }, [onSubmit, saveJobTicketAsDraft, submitJobTicket]);
  
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
    <Form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8 max-w-3xl mx-auto">
      {/* Job Date */}
      <Input
        label={t('jobTicket.date')}
        type="date"
        id="jobDate"
        name="jobDate"
        register={register}
        rules={{ required: true }}
        error={errors.jobDate}
        readOnly={readOnly}
      />
      
      {/* Company Name */}
      <Input
        label={t('jobTicket.companyName')}
        type="text"
        id="companyName"
        name="companyName"
        register={register}
        rules={{ required: true }}
        error={errors.companyName}
        readOnly={readOnly}
      />
      
      {/* Customer Name */}
      <Input
        label={t('jobTicket.customerName')}
        type="text"
        id="customerName"
        name="customerName"
        register={register}
        error={errors.customerName}
        readOnly={readOnly}
      />
      
      {/* Location */}
      <Input
        label={t('jobTicket.location')}
        type="text"
        id="location"
        name="location"
        register={register}
        error={errors.location}
        readOnly={readOnly}
      />
      
      {/* Work Type */}
      <Input
        label={t('jobTicket.workType')}
        type="text"
        id="workType"
        name="workType"
        register={register}
        error={errors.workType}
        readOnly={readOnly}
      />
      
      {/* Equipment */}
      <Input
        label={t('jobTicket.equipment')}
        type="text"
        id="equipment"
        name="equipment"
        register={register}
        error={errors.equipment}
        readOnly={readOnly}
      />
      
      {/* Work Hours */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label={t('jobTicket.workStartTime')}
          type="time"
          id="workStartTime"
          name="workStartTime"
          register={register}
          error={errors.workStartTime}
          readOnly={readOnly}
        />
        <Input
          label={t('jobTicket.workEndTime')}
          type="time"
          id="workEndTime"
          name="workEndTime"
          register={register}
          error={errors.workEndTime}
          readOnly={readOnly}
        />
        
        {/* Description of Work */}
        <div className="md:col-span-3">
          <label htmlFor="workDescription" className="block text-sm font-medium text-gray-300">
            {t('jobTicket.workDescription')}
          </label>
          <div className="mt-1">
            <textarea
              id="workDescription"
              name="workDescription"
              rows={4}
              className="bg-gray-800 block w-full max-w-2xl rounded-md border border-gray-500 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              placeholder="Enter your work description here..."
              readOnly={readOnly}
              {...register('workDescription')}
            />
          </div>
        </div>
        
        <Input
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
        <Input
          label={t('jobTicket.travelStartTime')}
          type="time"
          id="driveStartTime"
          name="driveStartTime"
          register={register}
          error={errors.driveStartTime}
          readOnly={readOnly}
        />
        <Input
          label={t('jobTicket.travelEndTime')}
          type="time"
          id="driveEndTime"
          name="driveEndTime"
          register={register}
          error={errors.driveEndTime}
          readOnly={readOnly}
        />
        <Input
          label={t('jobTicket.travelTotalTime')}
          type="text"
          id="driveTotalHours"
          name="driveTotalHours"
          register={register}
          readOnly={true}
        />
      </div>
      

      
      {/* Submitted By */}
      <Input
        label={t('jobTicket.submittedBy')}
        type="text"
        id="submittedBy"
        name="submittedBy"
        register={register}
        error={errors.submittedBy}
        readOnly={readOnly}
      />
      
      {/* Render children (job-specific fields) */}
      {children}
      
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
          <span className="block sm:inline"> {t('jobTicket.submitError')}</span>
        </Card>
      )}
      
      {/* Submit Button */}
      {!readOnly && (
        <div className="pt-5">
          <div className="flex justify-center sm:justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              variant={isSubmitting ? "disabled" : "success"}
              size="lg"
            >
              {isSubmitting ? (
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
