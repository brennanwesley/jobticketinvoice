import React, { useState, useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useLanguage } from '../../../context/LanguageContext';
import BaseJobTicketForm from './BaseJobTicketForm';
import { Button, Input, Card } from '../../ui';

/**
 * PumpTechTicketForm - Job ticket form specialized for Pump Service Technicians
 * 
 * Inherits from BaseJobTicketForm:
 * - All common fields (date, company, customer, location, hours, description)
 * - Form submission and draft functionality
 * - Time calculation logic
 * 
 * Unique to this form:
 * - Work type selection specific to pump technicians
 * - Equipment serviced field
 * - Parts used management with add/remove functionality
 * 
 * Performance optimizations:
 * - Memoized parts list
 * - Memoized event handlers
 * - React.memo for preventing unnecessary re-renders
 */
const PumpTechTicketForm = ({ readOnly = false, draftData = null }) => {
  const { t } = useLanguage();
  const { control, register, watch, setValue } = useForm({
    defaultValues: draftData || {}
  });
  
  // State for selected part in dropdown
  const [selectedPart, setSelectedPart] = useState('');
  
  // Get parts list based on current language - memoized to prevent recreation on each render
  const partsList = useMemo(() => [
    { value: t('parts.lubricant'), label: t('parts.lubricant') },
    { value: t('parts.pumpSeal'), label: t('parts.pumpSeal') },
    { value: t('parts.thrustChamber'), label: t('parts.thrustChamber') },
    { value: t('parts.vfdBreaker'), label: t('parts.vfdBreaker') },
    { value: t('parts.serviceKit'), label: t('parts.serviceKit') },
    { value: t('parts.other'), label: t('parts.other') },
  ], [t]);
  
  // Handle adding a part - memoized to prevent recreation on each render
  const handleAddPart = useCallback(() => {
    if (!selectedPart) return;
    
    const currentParts = watch('parts') || [];
    setValue('parts', [...currentParts, selectedPart]);
    setSelectedPart('');
  }, [selectedPart, watch, setValue]);
  
  // Handle removing a part - memoized to prevent recreation on each render
  const handleRemovePart = useCallback((index) => {
    const currentParts = watch('parts') || [];
    const updatedParts = [...currentParts];
    updatedParts.splice(index, 1);
    setValue('parts', updatedParts);
  }, [watch, setValue]);
  
  // Handle part selection change - memoized to prevent recreation on each render
  const handlePartChange = useCallback((e) => {
    setSelectedPart(e.target.value);
  }, []);
  
  // Memoize the parts list rendering for better performance
  const partsListItems = useMemo(() => {
    const parts = watch('parts') || [];
    
    if (parts.length === 0) {
      return (
        <li className="text-gray-500 text-center py-2">
          {t('jobTicket.noParts')}
        </li>
      );
    }
    
    return parts.map((part, index) => (
      <li key={index} className="flex items-center justify-between bg-gray-700 rounded px-3 py-2">
        <span>{part}</span>
        {!readOnly && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleRemovePart(index)}
          >
            {t('common.remove')}
          </Button>
        )}
      </li>
    ));
  }, [watch, t, readOnly, handleRemovePart]);
  
  return (
    <BaseJobTicketForm readOnly={readOnly} draftData={draftData}>
      {/* Pump-specific fields */}
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
            <option value="maintenance">{t('workTypes.maintenance')}</option>
            <option value="repair">{t('workTypes.repair')}</option>
            <option value="installation">{t('workTypes.installation')}</option>
            <option value="inspection">{t('workTypes.inspection')}</option>
          </select>
        </div>
      </div>
      
      {/* Equipment */}
      <Input
        label={t('jobTicket.equipment')}
        type="text"
        id="equipment"
        name="equipment"
        register={register}
        placeholder={t('jobTicket.equipmentPlaceholder')}
        readOnly={readOnly}
      />
      
      {/* Parts Used */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('jobTicket.partsUsed')}
        </label>
        
        {!readOnly && (
          <div className="flex items-end space-x-2 mb-3">
            <div className="flex-grow">
              <select
                value={selectedPart}
                onChange={handlePartChange}
                className="bg-gray-800 block w-full rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              >
                <option value="">{t('common.select')}</option>
                {partsList.map((part) => (
                  <option key={part.value} value={part.value}>
                    {part.label}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleAddPart}
              disabled={!selectedPart}
            >
              {t('common.add')}
            </Button>
          </div>
        )}
        
        <Card className="bg-gray-800 p-3 min-h-[100px] max-h-[200px] overflow-y-auto">
          <Controller
            name="parts"
            control={control}
            defaultValue={[]}
            render={({ field }) => (
              <ul className="space-y-2">
                {partsListItems}
              </ul>
            )}
          />
        </Card>
      </div>
    </BaseJobTicketForm>
  );
};

// Export memoized component to prevent unnecessary re-renders
export default React.memo(PumpTechTicketForm);
