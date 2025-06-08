import React, { useState, useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useLanguage } from '../../../context/LanguageContext';
import BaseJobTicketForm from './BaseJobTicketForm';
import { Button, Input, Card } from '../../ui';

/**
 * PipelineOperatorTicketForm - Job ticket form specialized for Pipeline Operators
 * 
 * Inherits from BaseJobTicketForm:
 * - All common fields (date, company, customer, location, hours, description)
 * - Form submission and draft functionality
 * - Time calculation logic
 * 
 * Unique to this form:
 * - Pipeline-specific work types
 * - Pressure and flow readings
 * - Inspection points with add/remove functionality
 * 
 * Performance optimizations:
 * - Memoized inspection points list
 * - Memoized event handlers
 * - React.memo for preventing unnecessary re-renders
 */
const PipelineOperatorTicketForm = ({ readOnly = false, draftData = null }) => {
  const { t } = useLanguage();
  const { control, register, watch, setValue } = useForm({
    defaultValues: draftData || {}
  });
  
  // State for inspection point in form
  const [inspectionPoint, setInspectionPoint] = useState('');
  const [inspectionStatus, setInspectionStatus] = useState('pass');
  const [inspectionNotes, setInspectionNotes] = useState('');
  
  // Handle adding an inspection point - memoized to prevent recreation on each render
  const handleAddInspectionPoint = useCallback(() => {
    if (!inspectionPoint) return;
    
    const currentInspections = watch('inspections') || [];
    setValue('inspections', [
      ...currentInspections, 
      { 
        point: inspectionPoint, 
        status: inspectionStatus,
        notes: inspectionNotes
      }
    ]);
    
    // Reset form fields
    setInspectionPoint('');
    setInspectionStatus('pass');
    setInspectionNotes('');
  }, [inspectionPoint, inspectionStatus, inspectionNotes, watch, setValue]);
  
  // Handle removing an inspection point - memoized to prevent recreation on each render
  const handleRemoveInspectionPoint = useCallback((index) => {
    const currentInspections = watch('inspections') || [];
    const updatedInspections = [...currentInspections];
    updatedInspections.splice(index, 1);
    setValue('inspections', updatedInspections);
  }, [watch, setValue]);
  
  // Memoize the inspections list rendering for better performance
  const inspectionListItems = useMemo(() => {
    const inspections = watch('inspections') || [];
    
    if (inspections.length === 0) {
      return (
        <li className="text-gray-500 text-center py-2">
          {t('jobTicket.noInspections')}
        </li>
      );
    }
    
    return inspections.map((inspection, index) => (
      <li key={index} className="bg-gray-700 rounded px-3 py-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">{inspection.point}</span>
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              inspection.status === 'pass' 
                ? 'bg-green-200 text-green-800' 
                : 'bg-red-200 text-red-800'
            }`}>
              {inspection.status === 'pass' ? t('jobTicket.pass') : t('jobTicket.fail')}
            </span>
          </div>
          {!readOnly && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleRemoveInspectionPoint(index)}
            >
              {t('common.remove')}
            </Button>
          )}
        </div>
        {inspection.notes && (
          <div className="mt-1 text-sm text-gray-300">
            {inspection.notes}
          </div>
        )}
      </li>
    ));
  }, [watch, t, readOnly, handleRemoveInspectionPoint]);
  
  return (
    <BaseJobTicketForm readOnly={readOnly} draftData={draftData}>
      {/* Pipeline-specific fields */}
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
            <option value="monitoring">{t('workTypes.monitoring')}</option>
            <option value="maintenance">{t('workTypes.maintenance')}</option>
            <option value="inspection">{t('workTypes.inspection')}</option>
            <option value="repair">{t('workTypes.repair')}</option>
            <option value="emergency">{t('workTypes.emergency')}</option>
          </select>
        </div>
      </div>
      
      {/* Pressure and Flow Readings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('jobTicket.pressureReading')}
          type="text"
          id="pressureReading"
          name="pressureReading"
          register={register}
          placeholder="e.g., 65 PSI"
          readOnly={readOnly}
        />
        <Input
          label={t('jobTicket.flowReading')}
          type="text"
          id="flowReading"
          name="flowReading"
          register={register}
          placeholder="e.g., 250 GPM"
          readOnly={readOnly}
        />
      </div>
      
      {/* Pipeline Section */}
      <Input
        label={t('jobTicket.pipelineSection')}
        type="text"
        id="pipelineSection"
        name="pipelineSection"
        register={register}
        placeholder={t('jobTicket.pipelineSectionPlaceholder')}
        readOnly={readOnly}
      />
      
      {/* Inspection Points */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('jobTicket.inspectionPoints')}
        </label>
        
        {!readOnly && (
          <div className="space-y-3 mb-3 bg-gray-800 p-4 rounded-md">
            <div>
              <label htmlFor="inspectionPoint" className="block text-xs font-medium text-gray-400">
                {t('jobTicket.inspectionPoint')}
              </label>
              <input
                type="text"
                id="inspectionPoint"
                value={inspectionPoint}
                onChange={(e) => setInspectionPoint(e.target.value)}
                className="mt-1 bg-gray-700 block w-full rounded-md border-gray-600 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                placeholder={t('jobTicket.inspectionPointPlaceholder')}
              />
            </div>
            
            <div>
              <label htmlFor="inspectionStatus" className="block text-xs font-medium text-gray-400">
                {t('jobTicket.status')}
              </label>
              <select
                id="inspectionStatus"
                value={inspectionStatus}
                onChange={(e) => setInspectionStatus(e.target.value)}
                className="mt-1 bg-gray-700 block w-full rounded-md border-gray-600 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              >
                <option value="pass">{t('jobTicket.pass')}</option>
                <option value="fail">{t('jobTicket.fail')}</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="inspectionNotes" className="block text-xs font-medium text-gray-400">
                {t('jobTicket.notes')}
              </label>
              <textarea
                id="inspectionNotes"
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
                rows={2}
                className="mt-1 bg-gray-700 block w-full rounded-md border-gray-600 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                placeholder={t('jobTicket.notesPlaceholder')}
              />
            </div>
            
            <div className="flex justify-end">
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleAddInspectionPoint}
                disabled={!inspectionPoint}
              >
                {t('common.add')}
              </Button>
            </div>
          </div>
        )}
        
        <Card className="bg-gray-800 p-3 min-h-[100px] max-h-[300px] overflow-y-auto">
          <Controller
            name="inspections"
            control={control}
            defaultValue={[]}
            render={({ field }) => (
              <ul className="space-y-2">
                {inspectionListItems}
              </ul>
            )}
          />
        </Card>
      </div>
    </BaseJobTicketForm>
  );
};

// Export memoized component to prevent unnecessary re-renders
export default React.memo(PipelineOperatorTicketForm);
