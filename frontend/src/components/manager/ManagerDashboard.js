import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useManager } from '../../context/ManagerContext';
import { useManagerAccess } from '../../hooks/useManagerAccess';
import { useAuth } from '../../context/AuthContext';
import TechnicianManagement from './TechnicianManagement';
import CompanyProfile from './CompanyProfile';
import Invoices from './Invoices'; // Update import statement
import JobTickets from './JobTickets';
import AuditLogs from './AuditLogs';
import InviteTechnician from './InviteTechnician';
import CreateInvoiceModal from './CreateInvoiceModal';
import { 
  HomeIcon, 
  UsersIcon, 
  BuildingOfficeIcon, 
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import LanguageToggle from '../LanguageToggle';

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
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [triggerInvoiceModal, setTriggerInvoiceModal] = useState(false);
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
      component: <OverviewTab stats={getTechnicianStats()} setActiveTab={setActiveTab} setShowInviteModal={setShowInviteModal} setTriggerInvoiceModal={setTriggerInvoiceModal} />
    },
    {
      id: 'invoicing',
      label: t('manager.invoicing.title'),
      icon: DocumentTextIcon,
      component: <Invoices triggerInvoiceModal={triggerInvoiceModal} setTriggerInvoiceModal={setTriggerInvoiceModal} />
    },
    {
      id: 'jobTickets',
      label: t('manager.jobTickets.title'),
      icon: ClipboardDocumentListIcon,
      component: <JobTickets />
    },
    {
      id: 'company',
      label: t('manager.company'),
      icon: BuildingOfficeIcon,
      component: <CompanyProfile />
    },
    {
      id: 'technicians',
      label: t('manager.technicians'),
      icon: UsersIcon,
      component: <TechnicianManagement />
    },
    {
      id: 'audit',
      label: t('audit.title'),
      icon: Cog6ToothIcon,
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
          } md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:static inset-y-0 left-0 z-40 w-64 bg-gray-800 border-r border-gray-700 h-screen`}
        >
          <div className="flex h-full flex-col gap-y-3 md:gap-y-4 overflow-y-auto px-6 py-4 pt-16 md:pt-4">
            {/* Company/Manager Header - moved down on mobile to avoid hamburger overlap */}
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
              <ul className="flex flex-1 flex-col gap-y-4 md:gap-y-5">
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
                  <div className="border-t border-gray-700 pt-3 md:pt-4">
                    <div className="flex items-center gap-x-3 mb-2 md:mb-3">
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
                  {activeTab === 'invoicing' && t('manager.invoicing.subtitle')}
                  {activeTab === 'jobTickets' && t('manager.jobTickets.subtitle')}
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
      
      {/* Render the InviteTechnician modal */}
      <InviteTechnician
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={(result) => {
          console.log('Technician invitation successful:', result);
          // Optionally refresh technician list or show additional success feedback
        }}
      />
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ stats, setActiveTab, setShowInviteModal, setTriggerInvoiceModal }) => {
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
      title: t('manager.totalWorkHours'),
      value: stats?.totalWorkHours || 0,
      icon: Cog6ToothIcon,
      color: 'yellow',
      description: t('manager.thisMonth')
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
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-blue-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">
                  {t('manager.totalTechnicians')}
                </dt>
                <dd className="text-lg font-medium text-white">
                  {stats.totalTechnicians}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClipboardDocumentListIcon className="h-8 w-8 text-green-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">
                  {t('manager.activeTickets')}
                </dt>
                <dd className="text-lg font-medium text-white">
                  {stats.activeTickets}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-yellow-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">
                  {t('manager.pendingInvoices')}
                </dt>
                <dd className="text-lg font-medium text-white">
                  {stats.pendingInvoices}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BuildingOfficeIcon className="h-8 w-8 text-purple-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">
                  {t('manager.companyStatus')}
                </dt>
                <dd className="text-lg font-medium text-white">
                  Active
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActionsSection setActiveTab={setActiveTab} setShowInviteModal={setShowInviteModal} setTriggerInvoiceModal={setTriggerInvoiceModal} />
    </div>
  );
};

// Quick Actions Section
const QuickActionsSection = ({ setActiveTab, setShowInviteModal, setTriggerInvoiceModal }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
      <h3 className="text-lg font-semibold text-white mb-4">{t('manager.quickActions')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button 
          className="flex items-center p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
          onClick={() => setShowInviteModal(true)}
        >
          <UsersIcon className="h-5 w-5 text-white mr-3" />
          <span className="text-white font-medium">{t('manager.inviteTechnician')}</span>
        </button>
        <button 
          className="flex items-center p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200"
          onClick={() => {
            setActiveTab('invoicing');
            setTriggerInvoiceModal(true);
          }}
        >
          <DocumentTextIcon className="h-5 w-5 text-white mr-3" />
          <span className="text-white font-medium">{t('manager.createInvoice')}</span>
        </button>
        <button className="flex items-center p-4 bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors duration-200">
          <BuildingOfficeIcon className="h-5 w-5 text-white mr-3" />
          <span className="text-white font-medium">{t('manager.updateCompany')}</span>
        </button>
        <button className="flex items-center p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200">
          <ClipboardDocumentListIcon className="h-5 w-5 text-white mr-3" />
          <span className="text-white font-medium">{t('audit.viewReports')}</span>
        </button>
        <button 
          className="flex items-center p-4 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors duration-200"
          onClick={() => setActiveTab('jobTickets')}
        >
          <ClipboardDocumentListIcon className="h-5 w-5 text-white mr-3" />
          <span className="text-white font-medium">{t('manager.createJobTicket')}</span>
        </button>
        <button 
          className="relative flex items-center p-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl overflow-hidden group"
          style={{
            background: 'linear-gradient(135deg, #39b198 0%, #2d8a73 100%)',
            boxShadow: '0 4px 15px rgba(57, 177, 152, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}
        >
          {/* Animated shine overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
          
          <svg className="h-5 w-5 text-white mr-3 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-white font-medium relative z-10">PatchAI</span>
        </button>
      </div>
    </div>
  );
};

export default ManagerDashboard;
