import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { TicketProvider } from '../context/TicketContext';
import { VoiceProvider } from '../context/VoiceContext';
import Sidebar from './Sidebar';
import LanguageToggle from './LanguageToggle';
import LandingPage from './LandingPage';
import VoiceRecorder from './VoiceRecorder';
import JobTicketFormSelector from './JobTicketFormSelector';
import DraftTicketList from './DraftTicketList';
import DraftTicketView from './DraftTicketView';
import SubmittedTicketList from './SubmittedTicketList';

/**
 * AppDashboard component
 * Contains the main application with sidebar and content
 */
const AppDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleButtonRef = useRef();
  const sidebarRef = useRef();
  
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
  
  return (
    <TicketProvider>
      <VoiceProvider>
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
                  <Routes>
                    <Route path="/" element={<AppContent />} />
                  </Routes>
                </div>
              </div>
            </main>
          </div>
        </div>
      </VoiceProvider>
    </TicketProvider>
  );
};

/**
 * App Content component
 * Renders the appropriate content based on the current view mode and ticket mode
 */
const AppContent = () => {
  const { viewMode, ticketMode } = React.useContext(require('../context/TicketContext').default);
  
  // Render content based on view mode and ticket mode
  return (
    <>
      {/* Draft Job Tickets List View */}
      {viewMode === 'draftList' && <DraftTicketList />}
      
      {/* Submitted Job Tickets List View */}
      {viewMode === 'submittedList' && <SubmittedTicketList />}
      
      {/* Landing Page */}
      {viewMode === 'landing' && ticketMode === null && <LandingPage />}
      
      {/* Voice Job Ticket Flow */}
      {viewMode === 'form' && ticketMode === 'voice' && <VoiceRecorder />}
      
      {/* Job Ticket Form - uses dynamic form selector based on job type */}
      {viewMode === 'form' && ticketMode === 'manual' && <JobTicketFormSelector />}
      
      {/* Draft Ticket View */}
      {viewMode === 'draft' && <DraftTicketView />}
    </>
  );
};

export default AppDashboard;
