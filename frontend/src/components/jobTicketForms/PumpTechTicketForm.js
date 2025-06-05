import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useLanguage } from '../../context/LanguageContext';
import BaseJobTicketForm from './BaseJobTicketForm';

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
 */
const PumpTechTicketForm = ({ readOnly = false, draftData = null }) => {
  const { t } = useLanguage();
  const { control, register, watch, setValue } = useForm();
  
  // State for selected part in dropdown
  const [selectedPart, setSelectedPart] = useState('');
  
  // Get parts list based on current language
  const getPartsList = () => {
    return [
      { value: t('parts.lubricant'), label: t('parts.lubricant') },
      { value: t('parts.pumpSeal'), label: t('parts.pumpSeal') },
      { value: t('parts.thrustChamber'), label: t('parts.thrustChamber') },
      { value: t('parts.vfdBreaker'), label: t('parts.vfdBreaker') },
      { value: t('parts.serviceKit'), label: t('parts.serviceKit') },
      { value: t('parts.other'), label: t('parts.other') },
    ];
  };
  
  // Handle adding a part
  const handleAddPart = () => {
    if (!selectedPart) return;
    
    const currentParts = watch('parts') || [];
    setValue('parts', [...currentParts, selectedPart]);
    setSelectedPart('');
  };
  
  // Handle removing a part
  const handleRemovePart = (index) => {
    const currentParts = watch('parts') || [];
    const updatedParts = [...currentParts];
    updatedParts.splice(index, 1);
    setValue('parts', updatedParts);
  };
  
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
            placeholder={t('jobTicket.equipmentPlaceholder')}
            {...register('equipment')}
          />
        </div>
      </div>
      
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
                onChange={(e) => setSelectedPart(e.target.value)}
                className="bg-gray-800 block w-full rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              >
                <option value="">{t('common.select')}</option>
                {getPartsList().map((part) => (
                  <option key={part.value} value={part.value}>
                    {part.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleAddPart}
              className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md"
            >
              {t('common.add')}
            </button>
          </div>
        )}
        
        <div className="bg-gray-800 rounded-md p-3 min-h-[100px] max-h-[200px] overflow-y-auto">
          <Controller
            name="parts"
            control={control}
            defaultValue={[]}
            render={({ field }) => (
              <ul className="space-y-2">
                {(field.value || []).map((part, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-700 rounded px-3 py-2">
                    <span>{part}</span>
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => handleRemovePart(index)}
                        className="text-red-500 hover:text-red-400"
                      >
                        {t('common.remove')}
                      </button>
                    )}
                  </li>
                ))}
                {(!field.value || field.value.length === 0) && (
                  <li className="text-gray-500 text-center py-2">
                    {t('jobTicket.noParts')}
                  </li>
                )}
              </ul>
            )}
          />
        </div>
      </div>
    </BaseJobTicketForm>
  );
};

export default PumpTechTicketForm;
