import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../context/LanguageContext';
import { authenticatedFetch } from '../../utils/auth';
import { toast } from 'react-toastify';

const EditJobTicketModal = ({ isOpen, onClose, jobTicket, onJobTicketUpdated }) => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue
  } = useForm();

  // Pre-populate form when jobTicket changes
  useEffect(() => {
    if (jobTicket && isOpen) {
      console.log('📝 Pre-populating edit form with job ticket:', jobTicket);
      
      // Set all form values from the job ticket
      setValue('companyName', jobTicket.company_name || '');
      setValue('customerName', jobTicket.customer_name || '');
      setValue('location', jobTicket.location || '');
      setValue('workDescription', jobTicket.work_description || '');
      setValue('workStartTime', jobTicket.work_start_time || '');
      setValue('workEndTime', jobTicket.work_end_time || '');
      setValue('driveStartTime', jobTicket.drive_start_time || '');
      setValue('driveEndTime', jobTicket.drive_end_time || '');
      setValue('totalWorkHours', jobTicket.work_total_hours || '');
      setValue('totalTravelHours', jobTicket.drive_total_hours || '');
      setValue('additionalNotes', jobTicket.additional_notes || '');
      setValue('equipment', jobTicket.equipment || '');
      setValue('workType', jobTicket.work_type || '');
    }
  }, [jobTicket, isOpen, setValue]);

  const onSubmit = async (formData) => {
    if (!jobTicket) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('📤 Updating job ticket:', jobTicket.id);
      console.log('📋 Form data:', formData);

      // Prepare the payload for the backend
      const payload = {
        company_name: formData.companyName,
        customer_name: formData.customerName,
        location: formData.location,
        work_description: formData.workDescription,
        work_start_time: formData.workStartTime,
        work_end_time: formData.workEndTime,
        drive_start_time: formData.driveStartTime,
        drive_end_time: formData.driveEndTime,
        work_total_hours: parseFloat(formData.totalWorkHours) || 0,
        drive_total_hours: parseFloat(formData.totalTravelHours) || 0,
        equipment: formData.equipment,
        work_type: formData.workType,
        additional_notes: formData.additionalNotes
      };

      console.log('📦 Prepared payload:', payload);

      const response = await authenticatedFetch(`/job-tickets/${jobTicket.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedJobTicket = await response.json();
        console.log('✅ Job ticket updated successfully:', updatedJobTicket);
        
        toast.success(t('manager.jobTickets.messages.editSuccess'));
        
        // Call the callback to refresh the job tickets list
        if (onJobTicketUpdated) {
          onJobTicketUpdated(updatedJobTicket);
        }
        
        // Reset form and close modal
        reset();
        onClose();
      } else {
        const errorData = await response.json();
        console.error('❌ Error updating job ticket:', errorData);
        throw new Error(errorData.detail || 'Failed to update job ticket');
      }
    } catch (error) {
      console.error('❌ Error updating job ticket:', error);
      toast.error(t('manager.jobTickets.messages.editError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen || !jobTicket) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {t('manager.jobTickets.editModal.title')}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {t('manager.jobTickets.editModal.subtitle')} {jobTicket.ticket_number}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Company Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-2">
                {t('manager.jobTickets.createModal.fields.companyName')} *
              </label>
              <input
                id="companyName"
                type="text"
                {...register('companyName', { required: 'Company name is required' })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter company name"
              />
              {errors.companyName && (
                <p className="mt-1 text-sm text-red-400">{errors.companyName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-300 mb-2">
                {t('manager.jobTickets.createModal.fields.customerName')}
              </label>
              <input
                id="customerName"
                type="text"
                {...register('customerName')}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter customer name"
              />
            </div>
          </div>

          {/* Location and Work Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                {t('manager.jobTickets.createModal.fields.location')} *
              </label>
              <input
                id="location"
                type="text"
                {...register('location', { required: 'Location is required' })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter location"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-400">{errors.location.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="workType" className="block text-sm font-medium text-gray-300 mb-2">
                Work Type
              </label>
              <input
                id="workType"
                type="text"
                {...register('workType')}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter work type"
              />
            </div>
          </div>

          {/* Equipment */}
          <div>
            <label htmlFor="equipment" className="block text-sm font-medium text-gray-300 mb-2">
              Equipment
            </label>
            <input
              id="equipment"
              type="text"
              {...register('equipment')}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter equipment details"
            />
          </div>

          {/* Work Description */}
          <div>
            <label htmlFor="workDescription" className="block text-sm font-medium text-gray-300 mb-2">
              {t('manager.jobTickets.createModal.fields.workDescription')} *
            </label>
            <textarea
              id="workDescription"
              {...register('workDescription', { required: 'Work description is required' })}
              rows={4}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the work performed"
            />
            {errors.workDescription && (
              <p className="mt-1 text-sm text-red-400">{errors.workDescription.message}</p>
            )}
          </div>

          {/* Time Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Work Time</h3>
              
              <div>
                <label htmlFor="workStartTime" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('manager.jobTickets.createModal.fields.workStartTime')}
                </label>
                <input
                  id="workStartTime"
                  type="time"
                  {...register('workStartTime')}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="workEndTime" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('manager.jobTickets.createModal.fields.workEndTime')}
                </label>
                <input
                  id="workEndTime"
                  type="time"
                  {...register('workEndTime')}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="totalWorkHours" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('manager.jobTickets.createModal.fields.totalWorkHours')}
                </label>
                <input
                  id="totalWorkHours"
                  type="number"
                  step="0.5"
                  min="0"
                  {...register('totalWorkHours')}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.0"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Travel Time</h3>
              
              <div>
                <label htmlFor="driveStartTime" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('manager.jobTickets.createModal.fields.driveStartTime')}
                </label>
                <input
                  id="driveStartTime"
                  type="time"
                  {...register('driveStartTime')}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="driveEndTime" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('manager.jobTickets.createModal.fields.driveEndTime')}
                </label>
                <input
                  id="driveEndTime"
                  type="time"
                  {...register('driveEndTime')}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="totalTravelHours" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('manager.jobTickets.createModal.fields.totalTravelHours')}
                </label>
                <input
                  id="totalTravelHours"
                  type="number"
                  step="0.5"
                  min="0"
                  {...register('totalTravelHours')}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.0"
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-300 mb-2">
              {t('manager.jobTickets.createModal.fields.additionalNotes')}
            </label>
            <textarea
              id="additionalNotes"
              {...register('additionalNotes')}
              rows={3}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter any additional notes"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJobTicketModal;
