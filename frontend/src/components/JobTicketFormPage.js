import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTicket } from '../context/TicketContext';
import { LoadingSpinner } from './ui';

// Lazy load the job ticket form components
const JobTicketForm = lazy(() => import('./tickets/JobTicketForm'));
const PumpTechTicketForm = lazy(() => import('./tickets/PumpTechTicketForm'));
const DriverTicketForm = lazy(() => import('./tickets/DriverTicketForm'));

/**
 * JobTicketFormPage component
 * Dedicated page for manual job ticket creation
 */
const JobTicketFormPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { draftData } = useTicket();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // Get the user's job type
  const jobType = user?.jobType || 'manual';
  
  // Map job types to their respective form components
  const jobTypeForms = {
    'pump_tech': PumpTechTicketForm,
    'driver': DriverTicketForm,
    'manual': JobTicketForm,
  };
  
  // Select the appropriate form component based on job type
  const FormComponent = jobTypeForms[jobType] || JobTicketForm;
  
  // Simulate loading to ensure all components are ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle back button click
  const handleBackClick = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with back button */}
      <div className="mb-6 flex items-center">
        <button 
          onClick={handleBackClick}
          className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={t('common.back')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">{t('jobTicket.createNew')}</h1>
      </div>
      
      {/* Form container with error boundary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <Suspense fallback={<LoadingSpinner />}>
            <FormComponent draftData={draftData} />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default JobTicketFormPage;
