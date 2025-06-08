import React, { memo, forwardRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTicket } from '../context/TicketContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { PlusCircleIcon, DocumentTextIcon, UserIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';

/**
 * Utility function to conditionally join class names
 */
const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Sidebar component for navigation
 */
const Sidebar = forwardRef(({ sidebarOpen, setSidebarOpen }, ref) => {
  // Add fallbacks to prevent null reference errors
  const { translations, t = key => key } = useLanguage() || {};
  const { 
    viewMode = 'landing', 
    setViewMode = () => {}, 
    draftTickets = [], 
    selectedDraftTicket = null, 
    setSelectedDraftTicket = () => {} 
  } = useTicket() || {};
  const { user = null, isAuthenticated = false, logout = () => {} } = useAuth() || {};
  
  // Handle navigation item click
  const handleCreateTicketClick = () => {
    setViewMode('landing');
  };
  
  const handleSubmittedTicketsClick = () => {
    setViewMode('submittedList');
  };
  
  const handleDraftTicketsClick = () => {
    setViewMode('draftList');
  };

  return (
    <div
      ref={ref}
      className={classNames(
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'fixed top-0 left-0 z-40 h-full w-64 bg-gray-900 transition-transform duration-300 ease-in-out md:translate-x-0'
      )}
    >
      <div className="flex h-full flex-col gap-y-5 overflow-y-auto px-6 py-4">
        <div className="flex h-16 shrink-0 items-center">
          <h2 className="text-2xl font-bold text-white">Job Ticket</h2>
        </div>
        
        {/* Logo */}
        <div className="flex flex-shrink-0 items-center px-4">
          <img
            className="h-8 w-auto"
            src="/logo.png"
            alt="JobTicketInvoice"
          />
        </div>
        
        {/* User profile section */}
        {isAuthenticated && user && (
          <div className="mt-5 flex flex-col items-center px-4 pb-5 border-b border-gray-800">
            <div className="relative">
              <div className="h-12 w-12 rounded-full bg-slate-700 flex items-center justify-center">
                {user.logo_url ? (
                  <img 
                    src={user.logo_url} 
                    alt="User" 
                    className="h-10 w-10 rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '';
                      e.target.classList.add('hidden');
                    }}
                  />
                ) : (
                  <UserIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                )}
              </div>
            </div>
            <div className="mt-3 text-center">
              <p className="text-sm font-medium text-gray-400">{t('common.loggedInAs')}</p>
              <p className="text-base font-semibold text-white truncate max-w-[200px]">{user.name || user.email}</p>
              <div className="mt-2 flex flex-col space-y-1">
                <Link to="/profile" className="text-xs text-orange-500 hover:text-orange-400">
                  {t('nav.profile')}
                </Link>
                <button 
                  onClick={logout}
                  className="text-xs text-gray-400 hover:text-gray-300"
                >
                  {t('nav.logout')}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {/* Create Job Ticket Button */}
                <li className="mb-6">
                  <button
                    onClick={handleCreateTicketClick}
                    className="w-full bg-green-600 hover:bg-green-700 text-white rounded-md py-2 px-4 flex items-center justify-center gap-x-2 transition-colors"
                  >
                    <PlusCircleIcon className="h-5 w-5" aria-hidden="true" />
                    <span>{t('jobTicket.createNew')}</span>
                  </button>
                </li>
                
                {/* Job Tickets Header */}
                <li>
                  <div className="text-sm font-semibold leading-6 text-white px-2 mb-3">
                    {t('nav.jobTickets')}
                  </div>
                </li>
                
                {/* Submitted Job Tickets section */}
                <li>
                  <button
                    onClick={handleSubmittedTicketsClick}
                    className={classNames(
                      viewMode === 'submittedList'
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800',
                      'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold w-full text-left'
                    )}
                  >
                    <DocumentCheckIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
                    {t('nav.submitted')}
                  </button>
                </li>
                
                {/* Draft Job Tickets section */}
                <li>
                  <button
                    onClick={handleDraftTicketsClick}
                    className={classNames(
                      viewMode === 'draftList'
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800',
                      'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold w-full text-left'
                    )}
                  >
                    <DocumentTextIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
                    {t('nav.drafts')}
                  </button>
                </li>
                
                {/* Development Tools section - only visible in development mode */}
                {process.env.NODE_ENV === 'development' && (
                  <li className="mt-8">
                    <div className="text-xs font-semibold leading-6 text-gray-400 px-2 mb-2">
                      Development Tools
                    </div>
                    <ul role="list" className="-mx-2 space-y-1">
                      <li>
                        <Link
                          to="/auth-test"
                          className="text-gray-400 hover:text-white hover:bg-gray-800 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          {t('nav.authTest')}
                        </Link>
                      </li>
                    </ul>
                  </li>
                )}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
});

export default memo(Sidebar);
