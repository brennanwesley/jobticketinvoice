import React from 'react';
import { useForm } from 'react-hook-form';
import { useLanguage } from '../../context/LanguageContext';
import BaseJobTicketForm from './BaseJobTicketForm';

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
 * Note: This is currently a placeholder implementation with minimal driver-specific fields
 */
const DriverTicketForm = ({ readOnly = false, draftData = null }) => {
  const { t } = useLanguage();
  const { register } = useForm();
  
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
            {...register('vehicleType')}
          >
            <option value="">{t('common.select')}</option>
            <option value="truck">{t('vehicleTypes.truck') || 'Truck'}</option>
            <option value="van">{t('vehicleTypes.van') || 'Van'}</option>
            <option value="car">{t('vehicleTypes.car') || 'Car'}</option>
          </select>
        </div>
      </div>
      
      {/* Mileage */}
      <div>
        <label htmlFor="mileage" className="block text-sm font-medium text-gray-300">
          {t('jobTicket.mileage') || 'Mileage'}
        </label>
        <div className="mt-1">
          <input
            type="number"
            id="mileage"
            name="mileage"
            className="bg-gray-800 block w-full max-w-md rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            readOnly={readOnly}
            placeholder={t('jobTicket.mileagePlaceholder') || 'Enter total miles driven'}
            {...register('mileage')}
          />
        </div>
      </div>
    </BaseJobTicketForm>
  );
};

export default DriverTicketForm;
