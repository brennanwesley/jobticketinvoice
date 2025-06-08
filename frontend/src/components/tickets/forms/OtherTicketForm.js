import React, { useState, useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useLanguage } from '../../../context/LanguageContext';
import BaseJobTicketForm from './BaseJobTicketForm';
import { Button, Input, Card } from '../../ui';

/**
 * OtherTicketForm - Generic job ticket form for "Other" job types
 * 
 * Inherits from BaseJobTicketForm:
 * - All common fields (date, company, customer, location, hours, description)
 * - Form submission and draft functionality
 * - Time calculation logic
 * 
 * Unique to this form:
 * - Customizable job type field
 * - Materials/equipment used with add/remove functionality
 * - Additional notes section
 * 
 * Performance optimizations:
 * - Memoized items list
 * - Memoized event handlers
 * - React.memo for preventing unnecessary re-renders
 */
const OtherTicketForm = ({ readOnly = false, draftData = null }) => {
  const { t } = useLanguage();
  const { control, register, watch, setValue } = useForm({
    defaultValues: draftData || {}
  });
  
  // State for selected item in dropdown
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  
  // Handle adding an item - memoized to prevent recreation on each render
  const handleAddItem = useCallback(() => {
    if (!itemName) return;
    
    const currentItems = watch('items') || [];
    setValue('items', [
      ...currentItems, 
      { 
        name: itemName, 
        quantity: itemQuantity || '1'
      }
    ]);
    
    // Reset form fields
    setItemName('');
    setItemQuantity('');
  }, [itemName, itemQuantity, watch, setValue]);
  
  // Handle removing an item - memoized to prevent recreation on each render
  const handleRemoveItem = useCallback((index) => {
    const currentItems = watch('items') || [];
    const updatedItems = [...currentItems];
    updatedItems.splice(index, 1);
    setValue('items', updatedItems);
  }, [watch, setValue]);
  
  // Memoize the items list rendering for better performance
  const itemsListItems = useMemo(() => {
    const items = watch('items') || [];
    
    if (items.length === 0) {
      return (
        <li className="text-gray-500 text-center py-2">
          {t('jobTicket.noItems')}
        </li>
      );
    }
    
    return items.map((item, index) => (
      <li key={index} className="flex items-center justify-between bg-gray-700 rounded px-3 py-2">
        <span>
          {item.name}
          {item.quantity && item.quantity !== '1' && (
            <span className="ml-2 text-sm text-gray-400">
              ({t('jobTicket.quantity')}: {item.quantity})
            </span>
          )}
        </span>
        {!readOnly && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleRemoveItem(index)}
          >
            {t('common.remove')}
          </Button>
        )}
      </li>
    ));
  }, [watch, t, readOnly, handleRemoveItem]);
  
  return (
    <BaseJobTicketForm readOnly={readOnly} draftData={draftData}>
      {/* Custom Job Type */}
      <div>
        <label htmlFor="customJobType" className="block text-sm font-medium text-gray-300">
          {t('jobTicket.customJobType')}
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="customJobType"
            name="customJobType"
            className="bg-gray-800 block w-full max-w-md rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            disabled={readOnly}
            placeholder={t('jobTicket.customJobTypePlaceholder')}
            {...register('customJobType')}
          />
        </div>
      </div>
      
      {/* Work Type */}
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
            <option value="other">{t('workTypes.other')}</option>
          </select>
        </div>
      </div>
      
      {/* Materials/Equipment Used */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('jobTicket.materialsEquipmentUsed')}
        </label>
        
        {!readOnly && (
          <div className="flex items-end space-x-2 mb-3">
            <div className="flex-grow">
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="bg-gray-800 block w-full rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                placeholder={t('jobTicket.itemNamePlaceholder')}
              />
            </div>
            <div className="w-24">
              <input
                type="text"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(e.target.value)}
                className="bg-gray-800 block w-full rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                placeholder={t('jobTicket.qty')}
              />
            </div>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleAddItem}
              disabled={!itemName}
            >
              {t('common.add')}
            </Button>
          </div>
        )}
        
        <Card className="bg-gray-800 p-3 min-h-[100px] max-h-[200px] overflow-y-auto">
          <Controller
            name="items"
            control={control}
            defaultValue={[]}
            render={({ field }) => (
              <ul className="space-y-2">
                {itemsListItems}
              </ul>
            )}
          />
        </Card>
      </div>
      
      {/* Additional Notes */}
      <div>
        <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-300">
          {t('jobTicket.additionalNotes')}
        </label>
        <div className="mt-1">
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            rows={4}
            className="bg-gray-800 block w-full max-w-2xl rounded-md border-gray-700 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            readOnly={readOnly}
            placeholder={t('jobTicket.additionalNotesPlaceholder')}
            {...register('additionalNotes')}
          />
        </div>
      </div>
    </BaseJobTicketForm>
  );
};

// Export memoized component to prevent unnecessary re-renders
export default React.memo(OtherTicketForm);
