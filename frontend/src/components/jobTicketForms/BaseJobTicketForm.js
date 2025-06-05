import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLanguage } from '../../context/LanguageContext';
import { useTicket } from '../../context/TicketContext';
import { useAuth } from '../../context/AuthContext';
import { calculateHoursBetween } from '../../utils/validators';

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
  
  // Setup React Hook Form
  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm({
    defaultValues: draftData || formData
  });
  
  // Watch time fields to calculate totals
  const workStartTime = watch('workStartTime');
  const workEndTime = watch('workEndTime');
  const driveStartTime = watch('driveStartTime');
  const driveEndTime = watch('driveEndTime');
  
  // Update total hours when start/end times change
  useEffect(() => {
    if (workStartTime && workEndTime) {
      const hours = calculateHoursBetween(workStartTime, workEndTime);
      if (hours !== null) {
        setValue('workTotalHours', hours);
      }
    }
  }, [workStartTime, workEndTime, setValue]);
  
  useEffect(() => {
    if (driveStartTime && driveEndTime) {
      const hours = calculateHoursBetween(driveStartTime, driveEndTime);
      if (hours !== null) {
        setValue('driveTotalHours', hours);
      }
    }
  }, [driveStartTime, driveEndTime, setValue]);
  
  // Auto-save form data when fields change
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (type === 'change' && name) {
        updateFormData(name, value[name]);
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
  
  // Handle form submission
  const handleFormSubmit = async (data) => {
    try {
      // Save to local storage first
      const savedDraft = saveJobTicketAsDraft(data);
      
      // Then submit to API
      await submitJobTicket(savedDraft);
    } catch (error) {
      console.error('Error submitting job ticket:', error);
    }
  };
  
  // Handle save as draft
  const handleSaveAsDraft = () => {
    const data = watch();
    saveJobTicketAsDraft(data);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit || handleFormSubmit)} className="space-y-8 max-w-3xl mx-auto">
      {/* Common form fields */}
      <div>
        <label htmlFor="jobDate" className="block text-sm font-medium text-gray-300">
          {t('jobTicket.jobDate')}
        </label>
        <div className="mt-1">
          <input
            type="date"
            id="jobDate"
            name="jobDate"
            className="bg-gray-800 block w-full max-w-md rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            readOnly={readOnly}
            {...register('jobDate', { required: true })}
          />
          {errors.jobDate && <p className="mt-1 text-sm text-red-500">{t('validation.required')}</p>}
        </div>
      </div>
      
      {/* Company Name */}
      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-gray-300">
          {t('jobTicket.companyName')}
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="companyName"
            name="companyName"
            className="bg-gray-800 block w-full max-w-md rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            readOnly={readOnly}
            {...register('companyName', { required: true })}
          />
          {errors.companyName && <p className="mt-1 text-sm text-red-500">{t('validation.required')}</p>}
        </div>
      </div>
      
      {/* Customer Name */}
      <div>
        <label htmlFor="customerName" className="block text-sm font-medium text-gray-300">
          {t('jobTicket.customerName')}
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="customerName"
            name="customerName"
            className="bg-gray-800 block w-full max-w-md rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            readOnly={readOnly}
            {...register('customerName')}
          />
        </div>
      </div>
      
      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-300">
          {t('jobTicket.location')}
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="location"
            name="location"
            className="bg-gray-800 block w-full max-w-md rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            readOnly={readOnly}
            {...register('location')}
          />
        </div>
      </div>
      
      {/* Job-specific form fields rendered as children */}
      {children}
      
      {/* Work Hours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="workStartTime" className="block text-sm font-medium text-gray-300">
            {t('jobTicket.workStartTime')}
          </label>
          <div className="mt-1">
            <input
              type="time"
              id="workStartTime"
              name="workStartTime"
              className="bg-gray-800 block w-full rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              readOnly={readOnly}
              {...register('workStartTime')}
            />
          </div>
        </div>
        <div>
          <label htmlFor="workEndTime" className="block text-sm font-medium text-gray-300">
            {t('jobTicket.workEndTime')}
          </label>
          <div className="mt-1">
            <input
              type="time"
              id="workEndTime"
              name="workEndTime"
              className="bg-gray-800 block w-full rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              readOnly={readOnly}
              {...register('workEndTime')}
            />
          </div>
        </div>
      </div>
      
      {/* Total Work Hours (calculated) */}
      <div>
        <label htmlFor="workTotalHours" className="block text-sm font-medium text-gray-300">
          {t('jobTicket.workTotalHours')}
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="workTotalHours"
            name="workTotalHours"
            className="bg-gray-800 block w-full max-w-md rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            readOnly={true}
            {...register('workTotalHours')}
          />
        </div>
      </div>
      
      {/* Drive Hours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="driveStartTime" className="block text-sm font-medium text-gray-300">
            {t('jobTicket.driveStartTime')}
          </label>
          <div className="mt-1">
            <input
              type="time"
              id="driveStartTime"
              name="driveStartTime"
              className="bg-gray-800 block w-full rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              readOnly={readOnly}
              {...register('driveStartTime')}
            />
          </div>
        </div>
        <div>
          <label htmlFor="driveEndTime" className="block text-sm font-medium text-gray-300">
            {t('jobTicket.driveEndTime')}
          </label>
          <div className="mt-1">
            <input
              type="time"
              id="driveEndTime"
              name="driveEndTime"
              className="bg-gray-800 block w-full rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              readOnly={readOnly}
              {...register('driveEndTime')}
            />
          </div>
        </div>
      </div>
      
      {/* Total Drive Hours (calculated) */}
      <div>
        <label htmlFor="driveTotalHours" className="block text-sm font-medium text-gray-300">
          {t('jobTicket.driveTotalHours')}
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="driveTotalHours"
            name="driveTotalHours"
            className="bg-gray-800 block w-full max-w-md rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            readOnly={true}
            {...register('driveTotalHours')}
          />
        </div>
      </div>
      
      {/* Work Description */}
      <div>
        <label htmlFor="workDescription" className="block text-sm font-medium text-gray-300">
          {t('jobTicket.workDescription')}
        </label>
        <div className="mt-1">
          <textarea
            id="workDescription"
            name="workDescription"
            rows={4}
            className="bg-gray-800 block w-full rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            readOnly={readOnly}
            {...register('workDescription')}
          />
        </div>
      </div>
      
      {/* Success and Error Messages */}
      {showSuccessMessage && (
        <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-500 px-4 py-3 rounded">
          {submitSuccess ? t('jobTicket.submitSuccess') : t('jobTicket.draftSaved')}
        </div>
      )}
      
      {showErrorMessage && (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 px-4 py-3 rounded">
          {submitError}
        </div>
      )}
      
      {/* Form Buttons */}
      {!readOnly && (
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center"
          >
            {isSubmitting ? t('common.submitting') : t('jobTicket.submitTicket')}
          </button>
          
          <button
            type="button"
            onClick={handleSaveAsDraft}
            className="w-full sm:w-auto px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-md transition-colors text-center"
          >
            {t('jobTicket.saveForLater')}
          </button>
        </div>
      )}
    </form>
  );
};

export default BaseJobTicketForm;
