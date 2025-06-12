import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useManager } from '../../context/ManagerContext';
import { useManagerAccess } from '../../hooks/useManagerAccess';
import { useAuth } from '../../context/AuthContext';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { 
  HomeIcon, 
  UsersIcon, 
  BuildingOfficeIcon, 
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import LanguageToggle from '../LanguageToggle';
import TechnicianManagement from './TechnicianManagement';
import CompanyProfile from './CompanyProfile';
import AuditLogs from './AuditLogs';

/**
 * Main Manager Dashboard Component
 * Provides navigation and content area for manager-specific features
 */
const ManagerDashboard = () => {
  const { t } = useLanguage();
  const { hasManagerAccess, getTechnicianStats } = useManager();
  const { validateAccess } = useManagerAccess();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [accessValidated, setAccessValidated] = useState(false);
  const [accessError, setAccessError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleButtonRef = useRef();
  const sidebarRef = useRef();

  // Validate access on component mount
  useEffect(() => {
    const checkAccess = async () => {
      const { hasAccess, reason } = await validateAccess('manager_features');
      if (hasAccess) {
        setAccessValidated(true);
      } else {
        setAccessError(reason);
      }
    };
    
    checkAccess();
  }, [validateAccess]);

  // Handle clicks outside the sidebar to close it on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth >= 768) return;
      
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
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [sidebarOpen]);

  // Navigation items
  const navigationItems = [
    {
      id: 'overview',
      label: t('manager.overview'),
      icon: HomeIcon,
      component: <OverviewTab stats={getTechnicianStats()} />
    },
    {
      id: 'technicians',
      label: t('manager.technicians'),
      icon: UsersIcon,
      component: <TechnicianManagement />
    },
    {
      id: 'company',
      label: t('manager.company'),
      icon: BuildingOfficeIcon,
      component: <CompanyProfile />
    },
    {
      id: 'audit',
      label: t('audit.title'),
      icon: ClipboardDocumentListIcon,
      component: <AuditLogs />
    }
  ];

  // Handle access errors
  if (accessError) {
    return (
      <div className="bg-slate-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">{t('common.accessDenied')}</h2>
          <p className="text-gray-400 mb-4">{accessError}</p>
          <p className="text-gray-500">{t('common.contactAdmin')}</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (!accessValidated) {
    return (
      <div className="bg-slate-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

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
        <div
          ref={sidebarRef}
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:static inset-y-0 left-0 z-40 w-64 bg-gray-800 border-r border-gray-700`}
        >
          <div className="flex h-full flex-col gap-y-5 overflow-y-auto px-6 py-4">
            {/* Company/Manager Header */}
            <div className="flex h-16 shrink-0 items-center">
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {user?.company_name || t('manager.dashboard')}
                  </h2>
                  <p className="text-sm text-gray-400">{t('manager.portal')}</p>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex flex-1 flex-col">
              <ul className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul className="-mx-2 space-y-1">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.id}>
                          <button
                            onClick={() => {
                              setActiveTab(item.id);
                              setSidebarOpen(false); // Close mobile sidebar
                            }}
                            className={`${
                              activeTab === item.id
                                ? 'bg-gray-700 text-white'
                                : 'text-gray-300 hover:text-white hover:bg-gray-700'
                            } group flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors duration-200`}
                          >
                            <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                            {item.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
                
                {/* User section at bottom */}
                <li className="mt-auto">
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex items-center gap-x-3 mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                        <span className="text-sm font-medium text-white">
                          {user?.name?.charAt(0)?.toUpperCase() || 'M'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {user?.name || t('common.manager')}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={logout}
                      className="group flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
                    >
                      <ArrowRightOnRectangleIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
                      {t('auth.logout')}
                    </button>
                  </div>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        
        {/* Main content */}
        <main className="flex-1 bg-slate-900 p-6 overflow-y-auto text-white">
          <div className="mt-2 md:mt-0 pl-14 md:pl-0 md:ml-64">
            <div className="max-w-7xl mx-auto">
              {/* Page Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">
                  {navigationItems.find(item => item.id === activeTab)?.label}
                </h1>
                <p className="text-gray-400 mt-2">
                  {activeTab === 'overview' && t('manager.dashboardSubtitle')}
                  {activeTab === 'technicians' && t('manager.manageTechnicians')}
                  {activeTab === 'company' && t('manager.manageCompany')}
                  {activeTab === 'audit' && t('audit.viewLogs')}
                </p>
              </div>
              
              {/* Tab Content */}
              <div className="bg-gray-800 rounded-lg shadow-xl">
                {navigationItems.find(item => item.id === activeTab)?.component}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ stats }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const overviewCards = [
    {
      title: t('manager.totalTechnicians'),
      value: stats?.totalTechnicians || 0,
      icon: UsersIcon,
      color: 'blue',
      description: t('manager.activeTechnicians')
    },
    {
      title: t('manager.pendingInvitations'),
      value: stats?.pendingInvitations || 0,
      icon: Cog6ToothIcon,
      color: 'yellow',
      description: t('manager.awaitingResponse')
    },
    {
      title: t('manager.completedJobs'),
      value: stats?.completedJobs || 0,
      icon: ClipboardDocumentListIcon,
      color: 'green',
      description: t('manager.thisMonth')
    }
  ];

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          {t('common.welcome')}, {user?.name}!
        </h2>
        <p className="text-gray-400">
          {t('manager.overviewDescription')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {overviewCards.map((card, index) => {
          const Icon = card.icon;
          const colorClasses = {
            blue: 'bg-blue-600 text-blue-100',
            yellow: 'bg-yellow-600 text-yellow-100',
            green: 'bg-green-600 text-green-100'
          };
          
          return (
            <div key={index} className="bg-gray-700 rounded-lg p-6 border border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{card.title}</p>
                  <p className="text-3xl font-bold text-white mt-2">{card.value}</p>
                  <p className="text-gray-500 text-sm mt-1">{card.description}</p>
                </div>
                <div className={`p-3 rounded-full ${colorClasses[card.color]}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
        <h3 className="text-lg font-semibold text-white mb-4">{t('manager.quickActions')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="flex items-center p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200">
            <UsersIcon className="h-5 w-5 text-white mr-3" />
            <span className="text-white font-medium">{t('manager.inviteTechnician')}</span>
          </button>
          <button className="flex items-center p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200">
            <BuildingOfficeIcon className="h-5 w-5 text-white mr-3" />
            <span className="text-white font-medium">{t('manager.updateCompany')}</span>
          </button>
          <button className="flex items-center p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200">
            <ClipboardDocumentListIcon className="h-5 w-5 text-white mr-3" />
            <span className="text-white font-medium">{t('audit.viewReports')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
