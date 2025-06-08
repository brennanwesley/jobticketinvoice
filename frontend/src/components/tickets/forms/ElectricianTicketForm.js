import React, { useState, useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useLanguage } from '../../../context/LanguageContext';
import BaseJobTicketForm from './BaseJobTicketForm';
import { Button, Input, Card } from '../../ui';

/**
 * ElectricianTicketForm - Job ticket form specialized for Electricians
 * 
 * Inherits from BaseJobTicketForm:
 * - All common fields (date, company, customer, location, hours, description)
 * - Form submission and draft functionality
 * - Time calculation logic
 * 
 * Unique to this form:
 * - Work type selection specific to electricians
 * - Voltage/amperage fields
 * - Components used management with add/remove functionality
 * 
 * Performance optimizations:
 * - Memoized components list
 * - Memoized event handlers
 * - React.memo for preventing unnecessary re-renders
 */
const ElectricianTicketForm = ({ readOnly = false, draftData = null }) => {
  const { t } = useLanguage();
  const { control, register, watch, setValue } = useForm({
    defaultValues: draftData || {}
  });
  
  // State for selected component in dropdown
  const [selectedComponent, setSelectedComponent] = useState('');
  
  // Get components list based on current language - memoized to prevent recreation on each render
  const componentsList = useMemo(() => [
    { value: t('components.wiring'), label: t('components.wiring') },
    { value: t('components.breakers'), label: t('components.breakers') },
    { value: t('components.switches'), label: t('components.switches') },
    { value: t('components.panels'), label: t('components.panels') },
    { value: t('components.motors'), label: t('components.motors') },
    { value: t('components.other'), label: t('components.other') },
  ], [t]);
  
  // Handle adding a component - memoized to prevent recreation on each render
  const handleAddComponent = useCallback(() => {
    if (!selectedComponent) return;
    
    const currentComponents = watch('components') || [];
    setValue('components', [...currentComponents, selectedComponent]);
    setSelectedComponent('');
  }, [selectedComponent, watch, setValue]);
  
  // Handle removing a component - memoized to prevent recreation on each render
  const handleRemoveComponent = useCallback((index) => {
    const currentComponents = watch('components') || [];
    const updatedComponents = [...currentComponents];
    updatedComponents.splice(index, 1);
    setValue('components', updatedComponents);
  }, [watch, setValue]);
  
  // Handle component selection change - memoized to prevent recreation on each render
  const handleComponentChange = useCallback((e) => {
    setSelectedComponent(e.target.value);
  }, []);
  
  // Memoize the components list rendering for better performance
  const componentsListItems = useMemo(() => {
    const components = watch('components') || [];
    
    if (components.length === 0) {
      return (
        <li className="text-gray-500 text-center py-2">
          {t('jobTicket.noComponents')}
        </li>
      );
    }
    
    return components.map((component, index) => (
      <li key={index} className="flex items-center justify-between bg-gray-700 rounded px-3 py-2">
        <span>{component}</span>
        {!readOnly && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleRemoveComponent(index)}
          >
            {t('common.remove')}
          </Button>
        )}
      </li>
    ));
  }, [watch, t, readOnly, handleRemoveComponent]);
  
  return (
    <BaseJobTicketForm readOnly={readOnly} draftData={draftData}>
      {/* Electrician-specific fields */}
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
            <option value="installation">{t('workTypes.installation')}</option>
            <option value="repair">{t('workTypes.repair')}</option>
            <option value="maintenance">{t('workTypes.maintenance')}</option>
            <option value="inspection">{t('workTypes.inspection')}</option>
            <option value="troubleshooting">{t('workTypes.troubleshooting')}</option>
          </select>
        </div>
      </div>
      
      {/* Voltage/Amperage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('jobTicket.voltage')}
          type="text"
          id="voltage"
          name="voltage"
          register={register}
          placeholder="e.g., 120V, 240V, 480V"
          readOnly={readOnly}
        />
        <Input
          label={t('jobTicket.amperage')}
          type="text"
          id="amperage"
          name="amperage"
          register={register}
          placeholder="e.g., 15A, 20A, 30A"
          readOnly={readOnly}
        />
      </div>
      
      {/* Components Used */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('jobTicket.componentsUsed')}
        </label>
        
        {!readOnly && (
          <div className="flex items-end space-x-2 mb-3">
            <div className="flex-grow">
              <select
                value={selectedComponent}
                onChange={handleComponentChange}
                className="bg-gray-800 block w-full rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              >
                <option value="">{t('common.select')}</option>
                {componentsList.map((component) => (
                  <option key={component.value} value={component.value}>
                    {component.label}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleAddComponent}
              disabled={!selectedComponent}
            >
              {t('common.add')}
            </Button>
          </div>
        )}
        
        <Card className="bg-gray-800 p-3 min-h-[100px] max-h-[200px] overflow-y-auto">
          <Controller
            name="components"
            control={control}
            defaultValue={[]}
            render={({ field }) => (
              <ul className="space-y-2">
                {componentsListItems}
              </ul>
            )}
          />
        </Card>
      </div>
      
      {/* Safety Measures */}
      <div>
        <label htmlFor="safetyMeasures" className="block text-sm font-medium text-gray-300">
          {t('jobTicket.safetyMeasures')}
        </label>
        <div className="mt-1">
          <textarea
            id="safetyMeasures"
            name="safetyMeasures"
            rows={3}
            className="bg-gray-800 block w-full max-w-2xl rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            readOnly={readOnly}
            placeholder={t('jobTicket.safetyMeasuresPlaceholder')}
            {...register('safetyMeasures')}
          />
        </div>
      </div>
    </BaseJobTicketForm>
  );
};

// Export memoized component to prevent unnecessary re-renders
export default React.memo(ElectricianTicketForm);
