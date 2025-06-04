import React, { memo, forwardRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTicket } from '../context/TicketContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FolderIcon, DocumentTextIcon, UserIcon } from '@heroicons/react/24/outline';

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
  const { translations, t } = useLanguage();
  const { 
    viewMode, 
    setViewMode, 
    draftTickets, 
    selectedDraftTicket, 
    setSelectedDraftTicket 
  } = useTicket();
  const { user, isAuthenticated, logout } = useAuth();
  
  // Handle navigation item click
  const handleNavigationClick = (item) => {
    if (item.name === translations.navigation[0].name) {
      setViewMode('landing');
    } else if (item.name === translations.navigation[1].name) {
      setViewMode('draftList');
    }
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
                {/* Job Tickets section */}
                <li>
                  <a
                    href="#"
                    className={classNames(
                      viewMode === 'landing'
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800',
                      'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                    )}
                    onClick={() => handleNavigationClick(translations.navigation[0])}
                  >
                    <FolderIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
                    {translations.navigation[0].name}
                  </a>
                </li>
                
                {/* Draft Job Tickets section */}
                <li>
                  <div 
                    className="text-xs font-semibold leading-6 text-gray-400 px-2 mt-4 mb-2 cursor-pointer hover:text-white"
                    onClick={() => handleNavigationClick(translations.navigation[1])}
                  >
                    {translations.navigation[1].name}
                  </div>
                  {draftTickets.length === 0 ? (
                    <div className="text-xs text-gray-500 px-2">{translations.noDrafts}</div>
                  ) : (
                    <ul role="list" className="-mx-2 space-y-1">
                      {draftTickets.map((draft) => (
                        <li key={draft.id}>
                          <button
                            onClick={() => {
                              setSelectedDraftTicket(draft);
                              setViewMode('draft');
                            }}
                            className={classNames(
                              selectedDraftTicket?.id === draft.id
                                ? 'bg-gray-800 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800',
                              'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold w-full text-left'
                            )}
                          >
                            <DocumentTextIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
                            <span className="truncate">
                              {draft.companyName || draft.workDescription?.substring(0, 20) + '...'}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
                
                {/* Submitted Job Tickets section */}
                <li>
                  <div className="text-xs font-semibold leading-6 text-gray-400 px-2 mt-4 mb-2">
                    {translations.navigation[2].name}
                  </div>
                  <div className="text-xs text-gray-500 px-2">{translations.noSubmitted}</div>
                </li>
                
                {/* Development Tools section - only visible in development mode */}
                {process.env.NODE_ENV === 'development' && (
                  <li>
                    <div className="text-xs font-semibold leading-6 text-gray-400 px-2 mt-6 mb-2">
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
