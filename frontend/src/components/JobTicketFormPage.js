import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTicket } from '../context/TicketContext';
import { LoadingSpinner } from './ui';
import Sidebar from './layout/Sidebar';
import LanguageToggle from './LanguageToggle';

// Import all form components from the forms directory
import JobTicketForm from './tickets/JobTicketForm';
import {
  PumpTechTicketForm,
  DriverTicketForm,
  RoustaboutTicketForm,
  ElectricianTicketForm,
  PipelineOperatorTicketForm,
  TruckDriverTicketForm,
  OtherTicketForm
} from './tickets/forms';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleButtonRef = useRef();
  const sidebarRef = useRef();
  
  // Get the user's job type
  const jobType = user?.jobType || 'manual';
  
  // Map job types to their respective form components
  const jobTypeForms = {
    'pump_tech': PumpTechTicketForm,
    'driver': DriverTicketForm,
    'roustabout': RoustaboutTicketForm,
    'electrician': ElectricianTicketForm,
    'pipeline_operator': PipelineOperatorTicketForm,
    'truck_driver': TruckDriverTicketForm,
    'other': OtherTicketForm,
    'manual': JobTicketForm, // Fallback for manual selection or admin users
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
  
  // Handle clicks outside the sidebar to close it on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only run this on mobile (when sidebar can be toggled)
      if (window.innerWidth >= 768) return; // md breakpoint
      
      // If sidebar is open and click is outside sidebar and not on the toggle button
      if (
        sidebarOpen && 
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target) &&
        toggleButtonRef.current && 
        !toggleButtonRef.current.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    };
    
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [sidebarOpen]);
  
  // Handle back button click
  const handleBackClick = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="bg-slate-900 min-h-screen">
      {/* Header area for language toggle */}
      <div className="h-14 relative">
        <LanguageToggle />
      </div>
      
      <div className="flex">
        {/* Mobile sidebar toggle */}
        <button
          ref={toggleButtonRef}
          className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>
        
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} ref={sidebarRef} />
        
        {/* Main content */}
        <main className="flex-1 bg-slate-900 p-6 overflow-y-auto text-white">
          <div className="mt-2 md:mt-0 pl-14 md:pl-0 md:ml-64">
            <div className="max-w-4xl mx-auto">
              {/* Header with back button */}
              <div className="mb-6 flex items-center">
                <button 
                  onClick={handleBackClick}
                  className="mr-4 p-2 rounded-full hover:bg-gray-700 transition-colors"
                  aria-label={t('common.back')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-white">{t('jobTicket.createNew')}</h1>
              </div>
              
              {/* Form container */}
              <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (
                  <FormComponent draftData={draftData} />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default JobTicketFormPage;
