import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useManager } from '../../context/ManagerContext';
import { useLanguage } from '../../context/LanguageContext';
import { authenticatedFetch } from '../../utils/auth';
import { toast } from 'react-toastify';
import Modal from '../ui/Modal';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * CreateJobTicketModal - Modal for managers to create job tickets manually
 * Uses GenericJobTicketForm structure but optimized for manager workflow
 */
const CreateJobTicketModal = ({ isOpen, onClose, onJobTicketCreated }) => {
  const { user } = useAuth();
  const { companyProfile } = useManager();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      job_type: 'generic',
      company_name: '',
      customer_name: '',
      location: '',
      description: '',
      work_start_time: '08:00',
      work_end_time: '17:00',
      drive_start_time: '07:00',
      drive_end_time: '18:00',
      total_work_hours: 0,
      total_travel_hours: 0,
      parts: []
    }
  });

  // Watch time fields for automatic calculation
  const workStartTime = watch('work_start_time');
  const workEndTime = watch('work_end_time');
  const driveStartTime = watch('drive_start_time');
  const driveEndTime = watch('drive_end_time');

  // Calculate hours automatically
  useEffect(() => {
    if (workStartTime && workEndTime) {
      const start = new Date(`1970-01-01T${workStartTime}`);
      const end = new Date(`1970-01-01T${workEndTime}`);
      if (end > start) {
        const hours = (end - start) / (1000 * 60 * 60);
        setValue('total_work_hours', Math.round(hours * 100) / 100);
      }
    }
  }, [workStartTime, workEndTime, setValue]);

  useEffect(() => {
    if (driveStartTime && driveEndTime) {
      const start = new Date(`1970-01-01T${driveStartTime}`);
      const end = new Date(`1970-01-01T${driveEndTime}`);
      if (end > start) {
        const hours = (end - start) / (1000 * 60 * 60);
        setValue('total_travel_hours', Math.round(hours * 100) / 100);
      }
    }
  }, [driveStartTime, driveEndTime, setValue]);

  // Handle form submission
  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    
    // COMPREHENSIVE FRONTEND LOGGING
    const timestamp = new Date().toISOString();
    console.log('\n' + '='.repeat(80));
    console.log(`🚀 FRONTEND JOB TICKET CREATION - TIMESTAMP: ${timestamp}`);
    console.log('='.repeat(80));
    
    console.log('📝 RAW FORM DATA:');
    Object.entries(formData).forEach(([key, value]) => {
      console.log(`   - ${key}: ${JSON.stringify(value)} (type: ${typeof value})`);
    });
    
    console.log('\n👤 USER CONTEXT:');
    console.log(`   - Email: ${user?.email}`);
    console.log(`   - Name: ${user?.name}`);
    console.log(`   - First Name: ${user?.first_name}`);
    console.log(`   - Last Name: ${user?.last_name}`);
    console.log(`   - Company Profile: ${JSON.stringify(companyProfile)}`);
    
    try {
      // Generate job ticket number
      const currentYear = new Date().getFullYear().toString().slice(-2);
      const randomNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      const jobTicketNumber = `${currentYear}${randomNumber}`;
      console.log(`\n🎫 Generated job ticket number: ${jobTicketNumber}`);

      // Prepare payload with all required fields matching backend schema
      const payload = {
        // Backend expects job_number, not job_ticket_number
        job_number: jobTicketNumber,
        company_name: formData.company_name?.trim(),
        customer_name: formData.customer_name?.trim() || '',
        location: formData.location?.trim() || '',
        work_description: formData.description?.trim() || '', 
        work_start_time: formData.work_start_time,
        work_end_time: formData.work_end_time,
        work_total_hours: parseFloat(formData.total_work_hours) || 0,
        drive_start_time: formData.drive_start_time,
        drive_end_time: formData.drive_end_time,
        drive_total_hours: parseFloat(formData.total_travel_hours) || 0,
        submitted_by: user.name || `${user.first_name} ${user.last_name}` || 'Manager',
        status: 'submitted', // Backend only accepts: draft, submitted, complete
        // Optional fields
        work_type: 'generic',
        equipment: '',
        travel_type: 'roundTrip',
        parts_used: JSON.stringify([]),
        additional_notes: formData.additional_notes?.trim() || ''
      };
      
      console.log('\n📦 PREPARED PAYLOAD FOR BACKEND:');
      Object.entries(payload).forEach(([key, value]) => {
        console.log(`   - ${key}: ${JSON.stringify(value)} (type: ${typeof value})`);
      });
      
      // Validate required fields before sending
      const requiredFields = ['company_name', 'submitted_by'];
      const missingFields = requiredFields.filter(field => !payload[field]);
      
      console.log('\n🔍 PAYLOAD VALIDATION:');
      requiredFields.forEach(field => {
        const isPresent = payload[field] && payload[field].toString().trim();
        console.log(`   ${isPresent ? '✅' : '❌'} ${field}: ${JSON.stringify(payload[field])}`);
      });
      
      if (missingFields.length > 0) {
        console.error(`❌ Missing required fields: ${missingFields}`);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      console.log('✅ All required fields present');

      // Submit to backend
      console.log('\n🌐 MAKING API CALL:');
      console.log(`   - URL: /job-tickets/`);
      console.log(`   - Method: POST`);
      console.log(`   - Headers: Content-Type: application/json`);
      console.log(`   - Body: ${JSON.stringify(payload, null, 2)}`);
      
      const response = await authenticatedFetch('/job-tickets/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      console.log('\n📡 API RESPONSE:');
      console.log(`   - Status: ${response.status}`);
      console.log(`   - Status Text: ${response.statusText}`);
      console.log(`   - OK: ${response.ok}`);
      
      if (response.headers) {
        console.log('   - Headers:');
        try {
          for (const [key, value] of response.headers.entries()) {
            console.log(`     ${key}: ${value}`);
          }
        } catch (e) {
          console.log('     Headers not available (CORS error)');
        }
      }
      
      console.log('📡 Raw response received:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers ? Object.fromEntries(response.headers.entries()) : 'Headers not available (CORS error)'
      });

      if (!response.ok) {
        console.log('❌ Response not OK, parsing error...');
        console.log('📊 Response status:', response.status);
        console.log('📋 Response status text:', response.statusText);
        
        let errorData;
        let responseText = '';
        
        try {
          // Clone the response to read it multiple times
          const responseClone = response.clone();
          responseText = await responseClone.text();
          console.log('📄 Raw response text:', responseText);
          
          // Try to parse as JSON
          errorData = JSON.parse(responseText);
          console.log('📋 Parsed error data:', errorData);
          
          // For 422 errors, show detailed validation errors
          if (response.status === 422) {
            console.log('🚫 VALIDATION ERROR (422) - Backend rejected payload:');
            console.log('Validation details:', errorData);
            if (errorData.detail) {
              console.log('Field validation errors:', errorData.detail);
            }
          }
          
        } catch (parseError) {
          console.log('⚠️ Failed to parse response as JSON:', parseError);
          errorData = { 
            message: responseText || `HTTP ${response.status}: ${response.statusText}`,
            status: response.status,
            statusText: response.statusText
          };
        }
        
        console.log('💥 Throwing error with message:', errorData.message);
        
        // Create more specific error message for 422
        let errorMessage = errorData.message || 'Failed to create job ticket';
        if (response.status === 422) {
          errorMessage = 'Validation error: Please check all required fields are filled correctly';
          if (errorData.detail && Array.isArray(errorData.detail)) {
            const fieldErrors = errorData.detail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join(', ');
            errorMessage = `Validation errors: ${fieldErrors}`;
          }
        }
        
        throw new Error(errorMessage);
      }

      const newJobTicket = await response.json();
      console.log('✅ Successfully created job ticket:', newJobTicket);

      // Success feedback
      toast.success(t('manager.jobTickets.messages.createSuccess'));
      console.log('🎉 Success toast shown');
      
      // Notify parent component
      if (onJobTicketCreated) {
        console.log('📞 Calling onJobTicketCreated callback');
        onJobTicketCreated(newJobTicket);
      } else {
        console.log('⚠️ No onJobTicketCreated callback provided');
      }

      // Reset form and close modal
      console.log('🔄 Resetting form and closing modal');
      reset();
      onClose();
      console.log('✨ Job ticket creation completed successfully');

    } catch (error) {
      console.error('💀 COMPREHENSIVE ERROR DEBUG:');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Error name:', error.name);
      console.error('Error cause:', error.cause);
      
      // Show error message to user
      const errorMessage = error.message || t('manager.jobTickets.messages.createError');
      console.error('🚨 Showing error toast:', errorMessage);
      toast.error(errorMessage);
      
    } finally {
      console.log('🏁 Setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('manager.jobTickets.createModal.title')}
      size="xl"
      closeOnEsc={!isSubmitting}
      closeOnOutsideClick={!isSubmitting}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Company Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="company_name" className="block text-sm font-medium text-gray-300 mb-2">
              {t('manager.jobTickets.createModal.fields.companyName')}
            </label>
            <input
              id="company_name"
              type="text"
              {...register('company_name', { required: 'Company name is required' })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter customer company name"
            />
            {errors.company_name && (
              <p className="mt-1 text-sm text-red-400">{errors.company_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="customer_name" className="block text-sm font-medium text-gray-300 mb-2">
              {t('manager.jobTickets.createModal.fields.customerName')}
            </label>
            <input
              id="customer_name"
              type="text"
              {...register('customer_name', { required: 'Customer name is required' })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter customer name"
            />
            {errors.customer_name && (
              <p className="mt-1 text-sm text-red-400">{errors.customer_name.message}</p>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
            {t('manager.jobTickets.createModal.fields.location')}
          </label>
          <input
            id="location"
            type="text"
            {...register('location', { required: 'Location is required' })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter job location"
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-400">{errors.location.message}</p>
          )}
        </div>

        {/* Work Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
            {t('manager.jobTickets.createModal.fields.workDescription')}
          </label>
          <textarea
            id="description"
            {...register('description', { required: 'Work description is required' })}
            rows={3}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe the work performed"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
          )}
        </div>

        {/* Time Tracking */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Work Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Work Hours</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="work_start_time" className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                <input
                  id="work_start_time"
                  type="time"
                  {...register('work_start_time')}
                  className="w-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="work_end_time" className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                <input
                  id="work_end_time"
                  type="time"
                  {...register('work_end_time')}
                  className="w-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label htmlFor="total_work_hours" className="block text-sm font-medium text-gray-300 mb-2">Total Work Hours</label>
              <input
                id="total_work_hours"
                type="number"
                step="0.25"
                {...register('total_work_hours', { min: 0 })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.0"
              />
            </div>
          </div>

          {/* Travel Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Travel Hours</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="drive_start_time" className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                <input
                  id="drive_start_time"
                  type="time"
                  {...register('drive_start_time')}
                  className="w-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="drive_end_time" className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                <input
                  id="drive_end_time"
                  type="time"
                  {...register('drive_end_time')}
                  className="w-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label htmlFor="total_travel_hours" className="block text-sm font-medium text-gray-300 mb-2">Total Travel Hours</label>
              <input
                id="total_travel_hours"
                type="number"
                step="0.25"
                {...register('total_travel_hours', { min: 0 })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.0"
              />
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label htmlFor="additional_notes" className="block text-sm font-medium text-gray-300 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            id="additional_notes"
            {...register('additional_notes')}
            rows={2}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any additional notes or comments"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200 disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t('common.creating')}
              </div>
            ) : (
              t('manager.jobTickets.createModal.submit')
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateJobTicketModal;
