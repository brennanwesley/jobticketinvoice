import React, { useState, useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useLanguage } from '../../../context/LanguageContext';
import BaseJobTicketForm from './BaseJobTicketForm';
import { Button, Input, Card } from '../../ui';

/**
 * RoustaboutTicketForm - Job ticket form specialized for Roustabout workers
 * 
 * Inherits from BaseJobTicketForm:
 * - All common fields (date, company, customer, location, hours, description)
 * - Form submission and draft functionality
 * - Time calculation logic
 * 
 * Unique to this form:
 * - Work type selection specific to roustabouts
 * - Equipment used field
 * - Materials used management with add/remove functionality
 * 
 * Performance optimizations:
 * - Memoized materials list
 * - Memoized event handlers
 * - React.memo for preventing unnecessary re-renders
 */
const RoustaboutTicketForm = ({ readOnly = false, draftData = null }) => {
  const { t } = useLanguage();
  const { control, register, watch, setValue } = useForm({
    defaultValues: draftData || {}
  });
  
  // State for selected material in dropdown
  const [selectedMaterial, setSelectedMaterial] = useState('');
  
  // Get materials list based on current language - memoized to prevent recreation on each render
  const materialsList = useMemo(() => [
    { value: t('materials.pipe'), label: t('materials.pipe') },
    { value: t('materials.fittings'), label: t('materials.fittings') },
    { value: t('materials.valves'), label: t('materials.valves') },
    { value: t('materials.tools'), label: t('materials.tools') },
    { value: t('materials.safety'), label: t('materials.safety') },
    { value: t('materials.other'), label: t('materials.other') },
  ], [t]);
  
  // Handle adding a material - memoized to prevent recreation on each render
  const handleAddMaterial = useCallback(() => {
    if (!selectedMaterial) return;
    
    const currentMaterials = watch('materials') || [];
    setValue('materials', [...currentMaterials, selectedMaterial]);
    setSelectedMaterial('');
  }, [selectedMaterial, watch, setValue]);
  
  // Handle removing a material - memoized to prevent recreation on each render
  const handleRemoveMaterial = useCallback((index) => {
    const currentMaterials = watch('materials') || [];
    const updatedMaterials = [...currentMaterials];
    updatedMaterials.splice(index, 1);
    setValue('materials', updatedMaterials);
  }, [watch, setValue]);
  
  // Handle material selection change - memoized to prevent recreation on each render
  const handleMaterialChange = useCallback((e) => {
    setSelectedMaterial(e.target.value);
  }, []);
  
  // Memoize the materials list rendering for better performance
  const materialsListItems = useMemo(() => {
    const materials = watch('materials') || [];
    
    if (materials.length === 0) {
      return (
        <li className="text-gray-500 text-center py-2">
          {t('jobTicket.noMaterials')}
        </li>
      );
    }
    
    return materials.map((material, index) => (
      <li key={index} className="flex items-center justify-between bg-gray-700 rounded px-3 py-2">
        <span>{material}</span>
        {!readOnly && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleRemoveMaterial(index)}
          >
            {t('common.remove')}
          </Button>
        )}
      </li>
    ));
  }, [watch, t, readOnly, handleRemoveMaterial]);
  
  return (
    <BaseJobTicketForm readOnly={readOnly} draftData={draftData}>
      {/* Roustabout-specific fields */}
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
            <option value="construction">{t('workTypes.construction')}</option>
            <option value="maintenance">{t('workTypes.maintenance')}</option>
            <option value="pipeline">{t('workTypes.pipeline')}</option>
            <option value="wellService">{t('workTypes.wellService')}</option>
          </select>
        </div>
      </div>
      
      {/* Equipment Used */}
      <Input
        label={t('jobTicket.equipmentUsed')}
        type="text"
        id="equipmentUsed"
        name="equipmentUsed"
        register={register}
        placeholder={t('jobTicket.equipmentUsedPlaceholder')}
        readOnly={readOnly}
      />
      
      {/* Materials Used */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('jobTicket.materialsUsed')}
        </label>
        
        {!readOnly && (
          <div className="flex items-end space-x-2 mb-3">
            <div className="flex-grow">
              <select
                value={selectedMaterial}
                onChange={handleMaterialChange}
                className="bg-gray-800 block w-full rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              >
                <option value="">{t('common.select')}</option>
                {materialsList.map((material) => (
                  <option key={material.value} value={material.value}>
                    {material.label}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleAddMaterial}
              disabled={!selectedMaterial}
            >
              {t('common.add')}
            </Button>
          </div>
        )}
        
        <Card className="bg-gray-800 p-3 min-h-[100px] max-h-[200px] overflow-y-auto">
          <Controller
            name="materials"
            control={control}
            defaultValue={[]}
            render={({ field }) => (
              <ul className="space-y-2">
                {materialsListItems}
              </ul>
            )}
          />
        </Card>
      </div>
      
      {/* Site Conditions */}
      <div>
        <label htmlFor="siteConditions" className="block text-sm font-medium text-gray-300">
          {t('jobTicket.siteConditions')}
        </label>
        <div className="mt-1">
          <textarea
            id="siteConditions"
            name="siteConditions"
            rows={3}
            className="bg-gray-800 block w-full max-w-2xl rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            readOnly={readOnly}
            placeholder={t('jobTicket.siteConditionsPlaceholder')}
            {...register('siteConditions')}
          />
        </div>
      </div>
    </BaseJobTicketForm>
  );
};

// Export memoized component to prevent unnecessary re-renders
export default React.memo(RoustaboutTicketForm);
