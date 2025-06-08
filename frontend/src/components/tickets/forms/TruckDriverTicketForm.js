import React, { useState, useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useLanguage } from '../../../context/LanguageContext';
import BaseJobTicketForm from './BaseJobTicketForm';
import { Button, Input, Card } from '../../ui';

/**
 * TruckDriverTicketForm - Job ticket form specialized for Truck Drivers
 * 
 * Inherits from BaseJobTicketForm:
 * - All common fields (date, company, customer, location, hours, description)
 * - Form submission and draft functionality
 * - Time calculation logic
 * 
 * Unique to this form:
 * - Truck-specific work types
 * - Mileage tracking
 * - Load details with add/remove functionality
 * - Vehicle inspection checklist
 * 
 * Performance optimizations:
 * - Memoized loads list
 * - Memoized event handlers
 * - React.memo for preventing unnecessary re-renders
 */
const TruckDriverTicketForm = ({ readOnly = false, draftData = null }) => {
  const { t } = useLanguage();
  const { control, register, watch, setValue } = useForm({
    defaultValues: draftData || {}
  });
  
  // State for load details in form
  const [loadDescription, setLoadDescription] = useState('');
  const [loadWeight, setLoadWeight] = useState('');
  const [loadDestination, setLoadDestination] = useState('');
  
  // Handle adding a load - memoized to prevent recreation on each render
  const handleAddLoad = useCallback(() => {
    if (!loadDescription || !loadDestination) return;
    
    const currentLoads = watch('loads') || [];
    setValue('loads', [
      ...currentLoads, 
      { 
        description: loadDescription, 
        weight: loadWeight,
        destination: loadDestination
      }
    ]);
    
    // Reset form fields
    setLoadDescription('');
    setLoadWeight('');
    setLoadDestination('');
  }, [loadDescription, loadWeight, loadDestination, watch, setValue]);
  
  // Handle removing a load - memoized to prevent recreation on each render
  const handleRemoveLoad = useCallback((index) => {
    const currentLoads = watch('loads') || [];
    const updatedLoads = [...currentLoads];
    updatedLoads.splice(index, 1);
    setValue('loads', updatedLoads);
  }, [watch, setValue]);
  
  // Memoize the loads list rendering for better performance
  const loadsListItems = useMemo(() => {
    const loads = watch('loads') || [];
    
    if (loads.length === 0) {
      return (
        <li className="text-gray-500 text-center py-2">
          {t('jobTicket.noLoads')}
        </li>
      );
    }
    
    return loads.map((load, index) => (
      <li key={index} className="bg-gray-700 rounded px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="font-medium">{load.description}</div>
          {!readOnly && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleRemoveLoad(index)}
            >
              {t('common.remove')}
            </Button>
          )}
        </div>
        <div className="mt-1 grid grid-cols-2 gap-2 text-sm text-gray-300">
          <div>
            <span className="text-gray-400">{t('jobTicket.weight')}: </span>
            {load.weight || 'N/A'}
          </div>
          <div>
            <span className="text-gray-400">{t('jobTicket.destination')}: </span>
            {load.destination}
          </div>
        </div>
      </li>
    ));
  }, [watch, t, readOnly, handleRemoveLoad]);
  
  return (
    <BaseJobTicketForm readOnly={readOnly} draftData={draftData}>
      {/* Truck Driver-specific fields */}
      <div>
        <label htmlFor="workType" className="block text-sm font-medium text-gray-300">
          {t('jobTicket.workType')}
        </label>
        <div className="mt-1">
          <select
            id="workType"
            name="workType"
            className="bg-gray-800 block w-full max-w-md rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            disabled={readOnly}
            {...register('workType')}
          >
            <option value="">{t('common.select')}</option>
            <option value="delivery">{t('workTypes.delivery')}</option>
            <option value="pickup">{t('workTypes.pickup')}</option>
            <option value="transport">{t('workTypes.transport')}</option>
            <option value="equipment">{t('workTypes.equipment')}</option>
            <option value="supplies">{t('workTypes.supplies')}</option>
          </select>
        </div>
      </div>
      
      {/* Vehicle Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('jobTicket.vehicleId')}
          type="text"
          id="vehicleId"
          name="vehicleId"
          register={register}
          placeholder="e.g., TRK-2023-104"
          readOnly={readOnly}
        />
        <Input
          label={t('jobTicket.vehicleType')}
          type="text"
          id="vehicleType"
          name="vehicleType"
          register={register}
          placeholder="e.g., Semi-truck, Pickup, Tanker"
          readOnly={readOnly}
        />
      </div>
      
      {/* Mileage Tracking */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label={t('jobTicket.startingMileage')}
          type="number"
          id="startingMileage"
          name="startingMileage"
          register={register}
          placeholder="e.g., 45780"
          readOnly={readOnly}
        />
        <Input
          label={t('jobTicket.endingMileage')}
          type="number"
          id="endingMileage"
          name="endingMileage"
          register={register}
          placeholder="e.g., 45920"
          readOnly={readOnly}
        />
        <Input
          label={t('jobTicket.totalMileage')}
          type="number"
          id="totalMileage"
          name="totalMileage"
          register={register}
          readOnly={true}
          value={
            watch('endingMileage') && watch('startingMileage')
              ? Math.max(0, Number(watch('endingMileage')) - Number(watch('startingMileage')))
              : ''
          }
        />
      </div>
      
      {/* Load Details */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('jobTicket.loadDetails')}
        </label>
        
        {!readOnly && (
          <div className="space-y-3 mb-3 bg-gray-800 p-4 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label htmlFor="loadDescription" className="block text-xs font-medium text-gray-400">
                  {t('jobTicket.loadDescription')}
                </label>
                <input
                  type="text"
                  id="loadDescription"
                  value={loadDescription}
                  onChange={(e) => setLoadDescription(e.target.value)}
                  className="mt-1 bg-gray-700 block w-full rounded-md border-gray-600 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  placeholder={t('jobTicket.loadDescriptionPlaceholder')}
                />
              </div>
              
              <div>
                <label htmlFor="loadWeight" className="block text-xs font-medium text-gray-400">
                  {t('jobTicket.weight')}
                </label>
                <input
                  type="text"
                  id="loadWeight"
                  value={loadWeight}
                  onChange={(e) => setLoadWeight(e.target.value)}
                  className="mt-1 bg-gray-700 block w-full rounded-md border-gray-600 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  placeholder="e.g., 2500 lbs"
                />
              </div>
              
              <div>
                <label htmlFor="loadDestination" className="block text-xs font-medium text-gray-400">
                  {t('jobTicket.destination')}
                </label>
                <input
                  type="text"
                  id="loadDestination"
                  value={loadDestination}
                  onChange={(e) => setLoadDestination(e.target.value)}
                  className="mt-1 bg-gray-700 block w-full rounded-md border-gray-600 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  placeholder={t('jobTicket.destinationPlaceholder')}
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleAddLoad}
                disabled={!loadDescription || !loadDestination}
              >
                {t('common.add')}
              </Button>
            </div>
          </div>
        )}
        
        <Card className="bg-gray-800 p-3 min-h-[100px] max-h-[300px] overflow-y-auto">
          <Controller
            name="loads"
            control={control}
            defaultValue={[]}
            render={({ field }) => (
              <ul className="space-y-2">
                {loadsListItems}
              </ul>
            )}
          />
        </Card>
      </div>
      
      {/* Vehicle Inspection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('jobTicket.vehicleInspection')}
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center">
            <input
              id="inspectionFuel"
              name="inspectionFuel"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-700 text-orange-600 focus:ring-orange-500"
              {...register('inspectionFuel')}
              disabled={readOnly}
            />
            <label htmlFor="inspectionFuel" className="ml-2 block text-sm text-gray-300">
              {t('jobTicket.fuelChecked')}
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="inspectionTires"
              name="inspectionTires"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-700 text-orange-600 focus:ring-orange-500"
              {...register('inspectionTires')}
              disabled={readOnly}
            />
            <label htmlFor="inspectionTires" className="ml-2 block text-sm text-gray-300">
              {t('jobTicket.tiresChecked')}
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="inspectionOil"
              name="inspectionOil"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-700 text-orange-600 focus:ring-orange-500"
              {...register('inspectionOil')}
              disabled={readOnly}
            />
            <label htmlFor="inspectionOil" className="ml-2 block text-sm text-gray-300">
              {t('jobTicket.oilChecked')}
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="inspectionLights"
              name="inspectionLights"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-700 text-orange-600 focus:ring-orange-500"
              {...register('inspectionLights')}
              disabled={readOnly}
            />
            <label htmlFor="inspectionLights" className="ml-2 block text-sm text-gray-300">
              {t('jobTicket.lightsChecked')}
            </label>
          </div>
        </div>
      </div>
    </BaseJobTicketForm>
  );
};

// Export memoized component to prevent unnecessary re-renders
export default React.memo(TruckDriverTicketForm);
