import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  const { control, register, watch, setValue, formState } = useForm({
    defaultValues: draftData || {parts: []}
  });
  
  // State for selected part in dropdown
  const [selectedPart, setSelectedPart] = useState('');
  // Local state to track parts (for immediate UI updates)
  const [partsArray, setPartsArray] = useState([]);
  
  // Get parts list based on current language - memoized to prevent recreation on each render
  const partsList = useMemo(() => [
    { value: 'partLubricant', label: t('parts.lubricant') },
    { value: 'partPumpSeal', label: t('parts.pumpSeal') },
    { value: 'partThrustChamber', label: t('parts.thrustChamber') },
    { value: 'partVFDBreaker', label: t('parts.vfdBreaker') },
    { value: 'partServiceKit', label: t('parts.serviceKit') },
    { value: 'partOther', label: t('parts.other') },
  ], [t]);
  
  // Initialize parts array from draft data if available
  useEffect(() => {
    if (draftData && draftData.parts) {
      setPartsArray(draftData.parts);
    }
  }, [draftData]);

  // Handle adding a part - memoized to prevent recreation on each render
  const handleAddPart = useCallback(() => {
    if (!selectedPart) return;
    
    // Find the selected part's label
    const selectedPartObj = partsList.find(part => part.value === selectedPart);
    if (!selectedPartObj) return;
    
    // Create new part object
    const newPart = {
      value: selectedPart,
      label: selectedPartObj.label
    };
    
    // Update local state for immediate UI update
    setPartsArray(prevParts => [...prevParts, newPart]);
    
    // Update form state
    const currentParts = watch('parts') || [];
    setValue('parts', [...currentParts, newPart]);
    
    // Reset selected part
    setSelectedPart('');
    
    console.log('Part added:', newPart);
    console.log('Current parts array:', [...currentParts, newPart]);
  }, [selectedPart, partsList, watch, setValue]);
  
  // Handle removing a part - memoized to prevent recreation on each render
  const handleRemovePart = useCallback((index) => {
    // Update local state for immediate UI update
    setPartsArray(prevParts => {
      const updatedParts = [...prevParts];
      updatedParts.splice(index, 1);
      return updatedParts;
    });
    
    // Update form state
    const currentParts = watch('parts') || [];
    const updatedFormParts = [...currentParts];
    updatedFormParts.splice(index, 1);
    setValue('parts', updatedFormParts);
    
    console.log('Part removed at index:', index);
  }, [watch, setValue]);
  
  // Handle part selection change - memoized to prevent recreation on each render
  const handlePartChange = useCallback((e) => {
    // Store both the value and label when selecting a part
    const selectedValue = e.target.value;
    const selectedOption = partsList.find(part => part.value === selectedValue);
    setSelectedPart(selectedOption ? selectedValue : '');
  }, [partsList]);
  
  // Memoize the parts list rendering for better performance
  const partsListItems = useMemo(() => {
    console.log('Rendering parts list with:', partsArray); // Debug log to see what parts are available
    
    if (!partsArray || partsArray.length === 0) {
      return (
        <li className="text-gray-500 text-center py-2">
          {t('jobTicket.parts.noParts')}
        </li>
      );
    }
    
    return partsArray.map((part, index) => {
      // Get the label from the part object
      // Handle both new format (object with value and label) and old format (string)
      let partLabel;
      if (typeof part === 'object' && part.label) {
        partLabel = part.label;
      } else if (typeof part === 'string') {
        // Handle old format where part is just a string
        const partName = part.replace(/^part/, '').charAt(0).toLowerCase() + part.replace(/^part/, '').slice(1);
        partLabel = t(`jobTicket.parts.${partName}`);
      } else {
        // Fallback
        partLabel = String(part);
      }
      
      return (
        <li key={index} className="flex items-center justify-between bg-gray-700 rounded px-3 py-2">
          <span className="text-white">{partLabel}</span>
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
      );
    });
  }, [partsArray, t, readOnly, handleRemovePart]);
  
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
            className="bg-gray-800 block w-full max-w-md rounded-md border-2 border-orange-400 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
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
        <label className="block text-base font-medium text-gray-300 mb-2 text-lg">
          {t('jobTicket.partsUsed')}
        </label>
        
        {!readOnly && (
          <div className="flex items-end space-x-2 mb-3">
            <div className="flex-grow">
              <select
                value={selectedPart}
                onChange={handlePartChange}
                className="bg-gray-800 block w-full rounded-md border-2 border-orange-400 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
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
              variant="custom"
              size="md"
              onClick={handleAddPart}
              disabled={!selectedPart}
              className="bg-orange-600 hover:bg-orange-700 text-black font-medium"
            >
              {t('jobTicket.addPart')}
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
