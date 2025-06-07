import React, { useState, useEffect, memo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useLanguage } from '../context/LanguageContext';
import { useTicket } from '../context/TicketContext';
import { calculateHoursBetween } from '../utils/validators';

/**
 * Job Ticket Form Component
 * Uses React Hook Form for form management
 */
const JobTicketForm = ({ readOnly = false, draftData = null }) => {
  const { t } = useLanguage();
  const { formData, updateFormData, saveJobTicketAsDraft } = useTicket();
  
  // State for selected part in dropdown
  const [selectedPart, setSelectedPart] = useState('');
  
  // Setup React Hook Form
  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm({
    defaultValues: draftData || formData
  });
  
  // Watch time fields to calculate totals
  const workStartTime = watch('workStartTime');
  const workEndTime = watch('workEndTime');
  const travelStartTime = watch('travelStartTime');
  const travelEndTime = watch('travelEndTime');
  
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
    if (travelStartTime && travelEndTime) {
      const hours = calculateHoursBetween(travelStartTime, travelEndTime);
      if (hours !== null) {
        setValue('driveTotalHours', hours);
      }
    }
  }, [travelStartTime, travelEndTime, setValue]);
  
  // Auto-save form data when fields change
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (type === 'change' && name) {
        updateFormData(name, value[name]);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [watch, updateFormData]);
  
  // Get parts list based on current language
  const getPartsList = () => {
    return [
      { value: t('jobTicket.parts.lubricant'), label: t('jobTicket.parts.lubricant') },
      { value: t('jobTicket.parts.pumpSeal'), label: t('jobTicket.parts.pumpSeal') },
      { value: t('jobTicket.parts.thrustChamber'), label: t('jobTicket.parts.thrustChamber') },
      { value: t('jobTicket.parts.vfdBreakerSwitch'), label: t('jobTicket.parts.vfdBreakerSwitch') },
      { value: t('jobTicket.parts.serviceKit'), label: t('jobTicket.parts.serviceKit') },
      { value: t('jobTicket.parts.other'), label: t('jobTicket.parts.other') },
    ];
  };
  
  // Handle adding a part
  const handleAddPart = () => {
    if (!selectedPart) return;
    
    const currentParts = watch('partsUsed') || [];
    setValue('partsUsed', [...currentParts, selectedPart]);
    setSelectedPart('');
  };
  
  // Handle removing a part
  const handleRemovePart = (index) => {
    const currentParts = watch('partsUsed') || [];
    const updatedParts = [...currentParts];
    updatedParts.splice(index, 1);
    setValue('partsUsed', updatedParts);
  };
  
  // Handle form submission
  const { submitJobTicket, isSubmitting, submitError, submitSuccess } = useTicket();
  
  // Use effects to handle success and error messages
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  
  // Show success message when submitSuccess changes to true
  useEffect(() => {
    if (submitSuccess) {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000); // Hide after 5 seconds
    }
  }, [submitSuccess]);
  
  // Show error message when submitError is set
  useEffect(() => {
    if (submitError) {
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 5000); // Hide after 5 seconds
    }
  }, [submitError]);
  
  // Handle form submission
  const onSubmit = async (data) => {
    try {
      // Save to local storage first
      const savedDraft = saveJobTicketAsDraft(data);
      
      // Then submit to API
      await submitJobTicket(savedDraft);
    } catch (error) {
      console.error('Error submitting job ticket:', error);
      // Error is already handled by the submitError state in TicketContext
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto">
      {/* Job Date */}
      <div>
        <label htmlFor="jobDate" className="block text-sm font-medium text-gray-300">
          {t('jobTicket.date')}
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
        </div>
      </div>
      
      {/* Customer Name */}
      <div>
        <label htmlFor="customerName" className="block text-sm font-medium text-gray-300">
          {t('jobTicket.customerName') || 'Customer Name'}
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
      
      {/* Work Type */}
      <div>
        <label htmlFor="workType" className="block text-sm font-medium text-gray-300">
          {t('jobTicket.workType')}
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="workType"
            name="workType"
            className="bg-gray-800 block w-full max-w-md rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            readOnly={readOnly}
            {...register('workType')}
          />
        </div>
      </div>
      
      {/* Equipment */}
      <div>
        <label htmlFor="equipment" className="block text-sm font-medium text-gray-300">
          {t('jobTicket.equipment')}
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="equipment"
            name="equipment"
            className="bg-gray-800 block w-full max-w-md rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            readOnly={readOnly}
            {...register('equipment')}
          />
        </div>
      </div>

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
          {t('jobTicket.workTotalTime')}
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
      
      {/* Travel Hours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="driveStartTime" className="block text-sm font-medium text-gray-300">
            {t('jobTicket.travelStartTime')}
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
            {t('jobTicket.travelEndTime')}
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
      
      {/* Total Travel Hours (calculated) */}
      <div>
        <label htmlFor="driveTotalHours" className="block text-sm font-medium text-gray-300">
          {t('jobTicket.travelTotalTime')}
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
      
      {/* Travel Type */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('jobTicket.travelType')}
        </label>
        <div className="flex space-x-4">
          <Controller
            name="travelType"
            control={control}
            render={({ field }) => (
              <>
                <label className={`
                  flex items-center justify-center px-3 py-2 rounded-md cursor-pointer
                  ${field.value === 'oneWay' 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                  ${readOnly ? 'pointer-events-none' : ''}
                `}>
                  <input
                    type="radio"
                    value="oneWay"
                    className="sr-only"
                    disabled={readOnly}
                    onChange={() => field.onChange('oneWay')}
                    checked={field.value === 'oneWay'}
                  />
                  <span>{t('jobTicket.oneWay')}</span>
                </label>
                
                <label className={`
                  flex items-center justify-center px-3 py-2 rounded-md cursor-pointer
                  ${field.value === 'roundTrip' 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                  ${readOnly ? 'pointer-events-none' : ''}
                `}>
                  <input
                    type="radio"
                    value="roundTrip"
                    className="sr-only"
                    disabled={readOnly}
                    onChange={() => field.onChange('roundTrip')}
                    checked={field.value === 'roundTrip'}
                  />
                  <span>{t('jobTicket.roundTrip')}</span>
                </label>
              </>
            )}
          />
        </div>
      </div>
      
      {/* Parts Used Section */}
      <div className="max-w-3xl">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('jobTicket.parts.title')}
        </label>
        
        {!readOnly && (
          <div className="flex space-x-2 mb-2">
            <select
              value={selectedPart}
              onChange={(e) => setSelectedPart(e.target.value)}
              className="bg-gray-800 block w-full max-w-md rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            >
              <option value="">{t('jobTicket.parts.placeholder')}</option>
              {getPartsList().map((part) => (
                <option key={part.value} value={part.value}>
                  {part.label}
                </option>
              ))}
            </select>
            
            <button
              type="button"
              onClick={handleAddPart}
              disabled={!selectedPart}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              {t('jobTicket.addPart')}
            </button>
          </div>
        )}
        
        <div className="mt-2 space-y-2">
          {watch('partsUsed')?.map((part, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-700 px-3 py-2 rounded-md">
              <span>{part}</span>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleRemovePart(index)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Description of Work */}
      <div>
        <label htmlFor="workDescription" className="block text-sm font-medium text-gray-300">
          {t('jobTicket.workDescription')}
        </label>
        <div className="mt-1">
          <textarea
            id="workDescription"
            name="workDescription"
            rows={4}
            className="bg-gray-800 block w-full max-w-2xl rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            readOnly={readOnly}
            {...register('workDescription')}
          />
        </div>
      </div>
      
      {/* Submitted By */}
      <div>
        <label htmlFor="submittedBy" className="block text-sm font-medium text-gray-300">
          {t('jobTicket.submittedBy')}
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="submittedBy"
            name="submittedBy"
            className="bg-gray-800 block w-full max-w-md rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            readOnly={readOnly}
            {...register('submittedBy')}
          />
        </div>
      </div>
      
      {/* Status Messages */}
      {showSuccessMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">{t('common.success')}!</strong>
          <span className="block sm:inline"> {t('jobTicket.submitted')}</span>
        </div>
      )}
      
      {showErrorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">{t('common.error')}!</strong>
          <span className="block sm:inline"> {t('jobTicket.submitError')}</span>
        </div>
      )}
      
      {/* Submit Button */}
      {!readOnly && (
        <div className="pt-5">
          <div className="flex justify-center sm:justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${isSubmitting ? 'bg-gray-500' : 'bg-orange-600 hover:bg-orange-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200`}
            >
              {isSubmitting ? t('common.submitting') : t('jobTicket.submit')}
              {isSubmitting && (
                <svg className="animate-spin ml-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </form>
  );
};

export default memo(JobTicketForm);
