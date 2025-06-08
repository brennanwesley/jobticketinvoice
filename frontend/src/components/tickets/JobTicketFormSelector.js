import React, { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTicket } from '../../context/TicketContext';
import { Card, LoadingSpinner } from '../ui';

// Import job type specific forms
import { GenericJobTicketForm, PumpTechTicketForm, DriverTicketForm } from './forms';

/**
 * Job Ticket Form Selector Component
 * Dynamically loads the appropriate job ticket form based on user's job type
 */
const JobTicketFormSelector = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { selectedDraftTicket, ticketMode } = useTicket();
  
  // Map of job types to their respective form components - defined outside render to avoid recreation
  const jobTypeForms = useMemo(() => ({
    'pump_tech': PumpTechTicketForm,
    'driver': DriverTicketForm,
    'manual': GenericJobTicketForm,
    // Add more job types here as they are implemented
  }), []);
  
  // Memoize the job type key to prevent recalculation on every render
  const jobTypeKey = useMemo(() => {
    // If manual mode is explicitly set, use the manual form
    if (ticketMode === 'manual') return 'manual';
    
    if (!user || !user.job_type) return 'pump_tech';
    
    // Normalize job type string (remove spaces, hyphens, underscores, lowercase)
    const normalizedJobType = user.job_type.toLowerCase().replace(/[\s_-]/g, '_');
    
    // Map common variations to standard keys
    const jobTypeMap = {
      'pump_technician': 'pump_tech',
      'pumptechnician': 'pump_tech',
      'pumptech': 'pump_tech',
      'pump_service_technician': 'pump_tech',
      'pump_service_tech': 'pump_tech',
    };
    
    return jobTypeMap[normalizedJobType] || normalizedJobType;
  }, [user, ticketMode]);
  
  // Memoize the form component to prevent unnecessary re-renders
  const FormComponent = useMemo(() => {
    return jobTypeForms[jobTypeKey] || PumpTechTicketForm;
  }, [jobTypeForms, jobTypeKey]);
  
  // Memoize the draft data to prevent unnecessary re-renders
  const draftData = useMemo(() => selectedDraftTicket || {}, [selectedDraftTicket]);
  
  // Performance monitoring for form rendering
  const renderStart = useMemo(() => performance.now(), []);
  
  // Log form rendering performance
  React.useEffect(() => {
    const renderTime = performance.now() - renderStart;
    console.log(`JobTicketForm (${jobTypeKey}) rendered in ${renderTime.toFixed(2)}ms`);
    
    return () => {
      // Cleanup performance marks
      performance.clearMarks(`form-render-${jobTypeKey}`);
    };
  }, [renderStart, jobTypeKey]);
  
  return (
    <div className="py-6 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {t('jobTicket.createNew')}
      </h1>
      
      {selectedDraftTicket && (
        <Card className="bg-blue-500 bg-opacity-20 border border-blue-500 text-blue-500 px-4 py-3 mb-6">
          <p>{t('jobTicket.editingDraft')}</p>
          <p className="text-sm mt-1">{t('jobTicket.draftId')}: {selectedDraftTicket.id.substring(0, 8)}</p>
        </Card>
      )}
      
      <React.Suspense fallback={<div className="flex justify-center py-8"><LoadingSpinner size="lg" /></div>}>
        <FormComponent draftData={draftData} />
      </React.Suspense>
    </div>
  );
};

// Export memoized component to prevent unnecessary re-renders
export default React.memo(JobTicketFormSelector);
