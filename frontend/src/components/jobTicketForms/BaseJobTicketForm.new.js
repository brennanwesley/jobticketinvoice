import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLanguage } from '../../context/LanguageContext';
import { useTicket } from '../../context/TicketContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { calculateHoursBetween } from '../../utils/validators';
import { Toast } from '../ui/Toast';
import { Modal } from '../ui/Modal';

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
  const navigate = useNavigate();
  const { formData, updateFormData, saveJobTicketAsDraft, submitJobTicket, isSubmitting, submitError, submitSuccess, lastSubmittedTicket } = useTicket();
  const { user } = useAuth();
  
  // Toast state
  const [toast, setToast] = useState({ show: false, type: 'info', message: '' });
  
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });
  
  // Setup React Hook Form with validation
  const { register, handleSubmit, control, setValue, watch, formState: { errors }, reset, trigger } = useForm({
    defaultValues: draftData || formData,
    mode: 'onChange' // Validate on change for immediate feedback
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
  
  // Handle success and redirect after submission
  useEffect(() => {
    if (submitSuccess && lastSubmittedTicket) {
      // Show success toast
      setToast({
        show: true,
        type: 'success',
        message: t('jobTicket.submitSuccess', { ticketNumber: lastSubmittedTicket.ticket_number })
      });
      
      // Redirect to landing page after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  }, [submitSuccess, lastSubmittedTicket, t, navigate]);
  
  // Handle submission errors
  useEffect(() => {
    if (submitError) {
      setToast({
        show: true,
        type: 'error',
        message: submitError || t('jobTicket.submitError')
      });
    }
  }, [submitError, t]);
  
  // Handle form submission with validation
  const handleFormSubmit = async (data) => {
    try {
      // Add submitter information
      data.submittedBy = user?.username || data.submittedBy || 'Unknown';
      data.status = 'submitted';
      
      // Save to local storage first
      const savedDraft = saveJobTicketAsDraft(data);
      
      // Then submit to API
      await submitJobTicket(savedDraft);
    } catch (error) {
      console.error('Error submitting job ticket:', error);
      setToast({
        show: true,
        type: 'error',
        message: error.message || t('jobTicket.submitError')
      });
    }
  };
  
  // Handle save as draft
  const handleSaveAsDraft = () => {
    const data = watch();
    data.status = 'draft';
    saveJobTicketAsDraft(data);
    
    setToast({
      show: true,
      type: 'success',
      message: t('jobTicket.draftSaved')
    });
  };
  
  // Validate form before submission
  const validateAndSubmit = async () => {
    const isValid = await trigger();
    
    if (!isValid) {
      setToast({
        show: true,
        type: 'error',
        message: t('validation.fixErrors')
      });
      return;
    }
    
    // Show confirmation modal
    setConfirmModal({
      show: true,
      title: t('jobTicket.confirmSubmit'),
      message: t('jobTicket.confirmSubmitMessage'),
      onConfirm: handleSubmit(handleFormSubmit)
    });
  };
  
  // Close toast
  const closeToast = () => setToast({ ...toast, show: false });
  
  // Close modal
  const closeModal = () => setConfirmModal({ ...confirmModal, show: false });
  
  // Confirm modal action
  const confirmModalAction = () => {
    if (confirmModal.onConfirm) {
      confirmModal.onConfirm();
    }
    closeModal();
  };
  
  // Reset form
  const handleResetForm = () => {
    reset(formData);
  };
  
  return (
    <div className="space-y-6">
      {/* Form fields */}
      <form className="space-y-4">
        {/* Date */}
        <div className="form-group">
          <label htmlFor="date" className="block text-sm font-medium text-gray-300">
            {t('jobTicket.date')} <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input 
              type="date" 
              id="date" 
              className={`bg-gray-800 block w-full rounded-md ${errors.date ? 'border-red-500' : 'border-gray-700'} text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
              {...register('date', { 
                required: t('validation.required') 
              })} 
              disabled={readOnly}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>
        </div>
        
        {/* Company */}
        <div className="form-group">
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-300">
            {t('jobTicket.companyName')} <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input 
              type="text" 
              id="companyName" 
              className={`bg-gray-800 block w-full rounded-md ${errors.companyName ? 'border-red-500' : 'border-gray-700'} text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
              {...register('companyName', { 
                required: t('validation.required') 
              })} 
              disabled={readOnly}
            />
            {errors.companyName && (
              <p className="mt-1 text-sm text-red-500">{errors.companyName.message}</p>
            )}
          </div>
        </div>
        
        {/* Customer */}
        <div className="form-group">
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-300">
            {t('jobTicket.customerName')}
          </label>
          <div className="mt-1">
            <input 
              type="text" 
              id="customerName" 
              className={`bg-gray-800 block w-full rounded-md ${errors.customerName ? 'border-red-500' : 'border-gray-700'} text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
              {...register('customerName')} 
              disabled={readOnly}
            />
            {errors.customerName && (
              <p className="mt-1 text-sm text-red-500">{errors.customerName.message}</p>
            )}
          </div>
        </div>
        
        {/* Location */}
        <div className="form-group">
          <label htmlFor="location" className="block text-sm font-medium text-gray-300">
            {t('jobTicket.location')} <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input 
              type="text" 
              id="location" 
              className={`bg-gray-800 block w-full rounded-md ${errors.location ? 'border-red-500' : 'border-gray-700'} text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
              {...register('location', { 
                required: t('validation.required') 
              })} 
              disabled={readOnly}
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-500">{errors.location.message}</p>
            )}
          </div>
        </div>
        
        {/* Work Hours */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-group">
            <label htmlFor="workStartTime" className="block text-sm font-medium text-gray-300">
              {t('jobTicket.workStartTime')} <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <input 
                type="time" 
                id="workStartTime" 
                className={`bg-gray-800 block w-full rounded-md ${errors.workStartTime ? 'border-red-500' : 'border-gray-700'} text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
                {...register('workStartTime', { 
                  required: t('validation.required') 
                })} 
                disabled={readOnly}
              />
              {errors.workStartTime && (
                <p className="mt-1 text-sm text-red-500">{errors.workStartTime.message}</p>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="workEndTime" className="block text-sm font-medium text-gray-300">
              {t('jobTicket.workEndTime')} <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <input 
                type="time" 
                id="workEndTime" 
                className={`bg-gray-800 block w-full rounded-md ${errors.workEndTime ? 'border-red-500' : 'border-gray-700'} text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
                {...register('workEndTime', { 
                  required: t('validation.required') 
                })} 
                disabled={readOnly}
              />
              {errors.workEndTime && (
                <p className="mt-1 text-sm text-red-500">{errors.workEndTime.message}</p>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="workTotalHours" className="block text-sm font-medium text-gray-300">
              {t('jobTicket.workTotalHours')}
            </label>
            <div className="mt-1">
              <input 
                type="number" 
                id="workTotalHours" 
                className="bg-gray-800 block w-full rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                step="0.25"
                {...register('workTotalHours')} 
                disabled={true} // Always calculated
              />
            </div>
          </div>
        </div>
        
        {/* Drive Hours */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-group">
            <label htmlFor="driveStartTime" className="block text-sm font-medium text-gray-300">
              {t('jobTicket.driveStartTime')}
            </label>
            <div className="mt-1">
              <input 
                type="time" 
                id="driveStartTime" 
                className={`bg-gray-800 block w-full rounded-md ${errors.driveStartTime ? 'border-red-500' : 'border-gray-700'} text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
                {...register('driveStartTime')} 
                disabled={readOnly}
              />
              {errors.driveStartTime && (
                <p className="mt-1 text-sm text-red-500">{errors.driveStartTime.message}</p>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="driveEndTime" className="block text-sm font-medium text-gray-300">
              {t('jobTicket.driveEndTime')}
            </label>
            <div className="mt-1">
              <input 
                type="time" 
                id="driveEndTime" 
                className={`bg-gray-800 block w-full rounded-md ${errors.driveEndTime ? 'border-red-500' : 'border-gray-700'} text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
                {...register('driveEndTime')} 
                disabled={readOnly}
              />
              {errors.driveEndTime && (
                <p className="mt-1 text-sm text-red-500">{errors.driveEndTime.message}</p>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="driveTotalHours" className="block text-sm font-medium text-gray-300">
              {t('jobTicket.driveTotalHours')}
            </label>
            <div className="mt-1">
              <input 
                type="number" 
                id="driveTotalHours" 
                className="bg-gray-800 block w-full rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                step="0.25"
                {...register('driveTotalHours')} 
                disabled={true} // Always calculated
              />
            </div>
          </div>
        </div>
        
        {/* Work Description */}
        <div className="form-group">
          <label htmlFor="workDescription" className="block text-sm font-medium text-gray-300">
            {t('jobTicket.workDescription')} <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <textarea 
              id="workDescription" 
              rows={4}
              className={`bg-gray-800 block w-full rounded-md ${errors.workDescription ? 'border-red-500' : 'border-gray-700'} text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
              {...register('workDescription', { 
                required: t('validation.required') 
              })} 
              disabled={readOnly}
            />
            {errors.workDescription && (
              <p className="mt-1 text-sm text-red-500">{errors.workDescription.message}</p>
            )}
          </div>
        </div>
        
        {/* Child form fields */}
        {children}
        
        {/* Form actions */}
        {!readOnly && (
          <div className="flex justify-between mt-6">
            <button 
              type="button" 
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-md transition-colors"
              onClick={handleSaveAsDraft}
            >
              {t('jobTicket.saveForLater')}
            </button>
            
            <div className="space-x-2">
              <button
                type="button"
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-md transition-colors"
                onClick={handleResetForm}
              >
                {t('common.reset')}
              </button>
              
              <button 
                type="button" 
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
                onClick={validateAndSubmit}
              >
                {isSubmitting ? t('common.submitting') : t('jobTicket.submitJobTicket')}
              </button>
            </div>
          </div>
        )}
      </form>
      
      {/* Toast notification */}
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          show={toast.show}
          onClose={closeToast}
        />
      )}
      
      {/* Confirmation modal */}
      <Modal
        isOpen={confirmModal.show}
        onClose={closeModal}
        title={confirmModal.title}
        size="md"
        footer={
          <div className="flex justify-end space-x-2">
            <button
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-md transition-colors"
              onClick={closeModal}
            >
              {t('common.cancel')}
            </button>
            <button
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md transition-colors"
              onClick={confirmModalAction}
            >
              {t('common.confirm')}
            </button>
          </div>
        }
      >
        <p>{confirmModal.message}</p>
      </Modal>
    </div>
  );
};

export default BaseJobTicketForm;
