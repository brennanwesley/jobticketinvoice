import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useLanguage } from '../../context/LanguageContext';
import { useTicket } from '../../context/TicketContext';
import { calculateHoursBetween } from '../../utils/validators';
import { Input, Button, Form, Card } from '../ui';
import { useDebounce, useMemoizedCallback } from '../../hooks';

/**
 * Job Ticket Form Component
 * Uses React Hook Form for form management with performance optimizations
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.readOnly - Whether the form is in read-only mode
 * @param {Object} props.draftData - Draft data to pre-populate the form
 */
const JobTicketForm = ({ readOnly = false, draftData = null }) => {
  const { t } = useLanguage();
  const { formData, updateFormData, saveJobTicketAsDraft } = useTicket();
  
  // State for selected part in dropdown
  const [selectedPart, setSelectedPart] = useState('');
  
  // Setup React Hook Form
  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm({
    defaultValues: draftData || formData,
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
  
  // Update total hours when start/end times change - with debounced values
  useEffect(() => {
    if (debouncedWorkStartTime && debouncedWorkEndTime) {
      const hours = calculateHoursBetween(debouncedWorkStartTime, debouncedWorkEndTime);
      if (hours !== null) {
        setValue('workTotalHours', hours);
      }
    }
  }, [debouncedWorkStartTime, debouncedWorkEndTime, setValue]);
  
  useEffect(() => {
    if (debouncedDriveStartTime && debouncedDriveEndTime) {
      const hours = calculateHoursBetween(debouncedDriveStartTime, debouncedDriveEndTime);
      if (hours !== null) {
        setValue('driveTotalHours', hours);
      }
    }
  }, [debouncedDriveStartTime, debouncedDriveEndTime, setValue]);
  
  // Auto-save form data when fields change - optimized with useCallback
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (type === 'change' && name) {
        updateFormData(name, value[name]);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [watch, updateFormData]);
  
  // Get parts list based on current language - memoized to prevent re-creation
  const partsList = useMemo(() => [
    { value: t('partLubricant'), label: t('partLubricant') },
    { value: t('partPumpSeal'), label: t('partPumpSeal') },
    { value: t('partThrustChamber'), label: t('partThrustChamber') },
    { value: t('partVFDBreaker'), label: t('partVFDBreaker') },
    { value: t('partServiceKit'), label: t('partServiceKit') },
    { value: t('partOther'), label: t('partOther') },
  ], [t]);
  
  // Handle adding a part - memoized to prevent re-creation
  const handleAddPart = useCallback(() => {
    if (!selectedPart) return;
    
    const currentParts = watch('parts') || [];
    setValue('parts', [...currentParts, selectedPart]);
    setSelectedPart('');
  }, [selectedPart, watch, setValue]);
  
  // Handle removing a part - memoized to prevent re-creation
  const handleRemovePart = useCallback((index) => {
    const currentParts = watch('parts') || [];
    const updatedParts = [...currentParts];
    updatedParts.splice(index, 1);
    setValue('parts', updatedParts);
  }, [watch, setValue]);
  
  // Handle form submission
  const { submitJobTicket, isSubmitting, submitError, submitSuccess } = useTicket();
  
  // Use effects to handle success and error messages
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  
  // Show success message when submitSuccess changes to true
  useEffect(() => {
    if (submitSuccess) {
      setShowSuccessMessage(true);
      const timer = setTimeout(() => setShowSuccessMessage(false), 5000); // Hide after 5 seconds
      return () => clearTimeout(timer); // Clean up timer
    }
  }, [submitSuccess]);
  
  // Show error message when submitError is set
  useEffect(() => {
    if (submitError) {
      setShowErrorMessage(true);
      const timer = setTimeout(() => setShowErrorMessage(false), 5000); // Hide after 5 seconds
      return () => clearTimeout(timer); // Clean up timer
    }
  }, [submitError]);
  
  // Handle form submission - memoized to prevent re-creation
  const onSubmit = useMemoizedCallback(async (data) => {
    try {
      // Save to local storage first
      const savedDraft = saveJobTicketAsDraft(data);
      
      // Then submit to API
      await submitJobTicket(savedDraft);
    } catch (error) {
      console.error('Error submitting job ticket:', error);
      // Error is already handled by the submitError state in TicketContext
    }
  });
  
  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl mx-auto">
      <Card className="p-6">
        {/* Success message */}
        {showSuccessMessage && (
          <div className="mb-4 p-4 bg-green-900 bg-opacity-20 border border-green-700 rounded-md">
            <p className="text-green-400">{t('jobTicket.submitSuccess')}</p>
          </div>
        )}
        
        {/* Error message */}
        {showErrorMessage && (
          <div className="mb-4 p-4 bg-red-900 bg-opacity-20 border border-red-700 rounded-md">
            <p className="text-red-400">{submitError}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Job Date */}
          <Input
            type="date"
            id="jobDate"
            name="jobDate"
            label={t('jobDate')}
            register={register}
            rules={{ required: true }}
            error={errors.jobDate}
            errorText={t('errors.required')}
            readOnly={readOnly}
          />
          
          {/* Company Name */}
          <Input
            type="text"
            id="companyName"
            name="companyName"
            label={t('companyName')}
            register={register}
            rules={{ required: true }}
            error={errors.companyName}
            errorText={t('errors.required')}
            readOnly={readOnly}
          />
          
          {/* Customer Name */}
          <Input
            type="text"
            id="customerName"
            name="customerName"
            label={t('customerName')}
            register={register}
            readOnly={readOnly}
          />
          
          {/* Location */}
          <Input
            type="text"
            id="location"
            name="location"
            label={t('location')}
            register={register}
            readOnly={readOnly}
          />
          
          {/* Work Type */}
          <Input
            type="text"
            id="workType"
            name="workType"
            label={t('workType')}
            register={register}
            readOnly={readOnly}
          />
          
          {/* Equipment */}
          <Input
            type="text"
            id="equipment"
            name="equipment"
            label={t('equipment')}
            register={register}
            readOnly={readOnly}
          />
        </div>
        
        {/* Work Hours Section */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-200 mb-4">{t('workTotalHours')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="time"
              id="workStartTime"
              name="workStartTime"
              label={t('workStartTime')}
              register={register}
              readOnly={readOnly}
            />
            
            <Input
              type="time"
              id="workEndTime"
              name="workEndTime"
              label={t('workEndTime')}
              register={register}
              readOnly={readOnly}
            />
            
            <Input
              type="number"
              id="workTotalHours"
              name="workTotalHours"
              label={t('workTotalHours')}
              register={register}
              readOnly={true}
              step="0.01"
            />
          </div>
        </div>
        
        {/* Drive Hours Section */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-200 mb-4">{t('driveTotalHours')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="time"
              id="driveStartTime"
              name="driveStartTime"
              label={t('driveStartTime')}
              register={register}
              readOnly={readOnly}
            />
            
            <Input
              type="time"
              id="driveEndTime"
              name="driveEndTime"
              label={t('driveEndTime')}
              register={register}
              readOnly={readOnly}
            />
            
            <Input
              type="number"
              id="driveTotalHours"
              name="driveTotalHours"
              label={t('driveTotalHours')}
              register={register}
              readOnly={true}
              step="0.01"
            />
          </div>
        </div>
        
        {/* Parts Section */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-200 mb-4">{t('partsUsed')}</h3>
          
          {!readOnly && (
            <div className="flex space-x-2 mb-4">
              <select
                className="bg-gray-800 block w-full rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                value={selectedPart}
                onChange={(e) => setSelectedPart(e.target.value)}
              >
                <option value="">{t('selectPartsPlaceholder')}</option>
                {partsList.map((part) => (
                  <option key={part.value} value={part.value}>
                    {part.label}
                  </option>
                ))}
              </select>
              <Button 
                type="button" 
                onClick={handleAddPart}
                disabled={!selectedPart}
                variant="secondary"
              >
                {t('addPart')}
              </Button>
            </div>
          )}
          
          <div className="bg-gray-800 rounded-md border border-gray-700 p-4">
            {watch('parts')?.length > 0 ? (
              <ul className="divide-y divide-gray-700">
                {watch('parts')?.map((part, index) => (
                  <li key={index} className="py-2 flex justify-between items-center">
                    <span>{part}</span>
                    {!readOnly && (
                      <Button
                        type="button"
                        onClick={() => handleRemovePart(index)}
                        variant="danger"
                        size="sm"
                      >
                        {t('removePart')}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">{t('noParts', 'No parts added')}</p>
            )}
          </div>
        </div>
        
        {/* Description */}
        <div className="mt-8">
          <label htmlFor="description" className="block text-sm font-medium text-gray-300">
            {t('descriptionOfWork')}
          </label>
          <div className="mt-1">
            <textarea
              id="description"
              name="description"
              rows={4}
              className="bg-gray-800 block w-full rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              readOnly={readOnly}
              {...register('description')}
            />
          </div>
        </div>
        
        {/* Submit Button */}
        {!readOnly && (
          <div className="mt-8 flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto"
            >
              {isSubmitting ? t('submitting') : t('submit')}
            </Button>
          </div>
        )}
      </Card>
    </Form>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(JobTicketForm);
