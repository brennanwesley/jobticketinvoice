import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useLanguage } from '../../../context/LanguageContext';
import BaseJobTicketForm from './BaseJobTicketForm';
import { Input } from '../../ui';

/**
 * DriverTicketForm - Job ticket form specialized for Truck Drivers
 * 
 * Inherits from BaseJobTicketForm:
 * - All common fields (date, company, customer, location, hours, description)
 * - Form submission and draft functionality
 * - Time calculation logic
 * 
 * Unique to this form:
 * - Vehicle type selection
 * - Mileage tracking
 * - Trip type (local/long haul)
 * 
 * Performance optimizations:
 * - Memoized vehicle types
 * - React.memo for preventing unnecessary re-renders
 */
const DriverTicketForm = ({ readOnly = false, draftData = null }) => {
  const { t } = useLanguage();
  const { register, formState: { errors } } = useForm({
    defaultValues: draftData || {}
  });
  
  // Memoize vehicle types to prevent recreation on each render
  const vehicleTypes = useMemo(() => [
    { value: '', label: t('common.select') },
    { value: 'truck', label: t('vehicleTypes.truck') || 'Truck' },
    { value: 'van', label: t('vehicleTypes.van') || 'Van' },
    { value: 'car', label: t('vehicleTypes.car') || 'Car' }
  ], [t]);
  
  // Performance monitoring
  const renderStart = useMemo(() => performance.now(), []);
  
  React.useEffect(() => {
    const renderTime = performance.now() - renderStart;
    console.log(`DriverTicketForm rendered in ${renderTime.toFixed(2)}ms`);
    
    return () => {
      performance.clearMarks('driver-ticket-form-render');
    };
  }, [renderStart]);
  
  return (
    <BaseJobTicketForm readOnly={readOnly} draftData={draftData}>
      {/* Driver-specific fields */}
      <div>
        <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-300">
          {t('jobTicket.vehicleType') || 'Vehicle Type'}
        </label>
        <div className="mt-1">
          <select
            id="vehicleType"
            name="vehicleType"
            className="bg-gray-800 block w-full max-w-md rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            disabled={readOnly}
            {...register('vehicleType', { required: true })}
          >
            {vehicleTypes.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.vehicleType && (
            <p className="mt-1 text-sm text-red-500">
              {t('validation.required')}
            </p>
          )}
        </div>
      </div>
      
      {/* Mileage */}
      <Input
        label={t('jobTicket.mileage') || 'Mileage'}
        type="number"
        id="mileage"
        name="mileage"
        register={register}
        rules={{ required: true, min: 0 }}
        error={errors.mileage}
        placeholder={t('jobTicket.mileagePlaceholder') || 'Enter total miles driven'}
        readOnly={readOnly}
      />
      
      {/* Trip Type */}
      <div>
        <label htmlFor="tripType" className="block text-sm font-medium text-gray-300">
          {t('jobTicket.tripType') || 'Trip Type'}
        </label>
        <div className="mt-1">
          <select
            id="tripType"
            name="tripType"
            className="bg-gray-800 block w-full max-w-md rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            disabled={readOnly}
            {...register('tripType')}
          >
            <option value="">{t('common.select')}</option>
            <option value="local">{t('tripTypes.local') || 'Local'}</option>
            <option value="longHaul">{t('tripTypes.longHaul') || 'Long Haul'}</option>
          </select>
        </div>
      </div>
    </BaseJobTicketForm>
  );
};

// Export memoized component to prevent unnecessary re-renders
export default React.memo(DriverTicketForm);
