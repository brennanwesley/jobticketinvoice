import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useManagerAccess } from '../../hooks/useManagerAccess';
import { authenticatedFetch } from '../../utils/auth';
import { toast } from 'react-toastify';
import { 
  ClipboardDocumentListIcon, 
  DocumentTextIcon, 
  CheckIcon,
  EyeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import CreateJobTicketModal from './CreateJobTicketModal';
import EditJobTicketModal from './EditJobTicketModal';

/**
 * Job Tickets Management Component
 * Provides comprehensive job ticket management with status cards and data table
 */
const JobTickets = () => {
  const { t } = useLanguage();
  const { validateAccess } = useManagerAccess();

  // State management
  const [jobTickets, setJobTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Fetch job tickets from API
  const fetchJobTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🎫 Fetching job tickets...');
      const response = await authenticatedFetch('/job-tickets?limit=100');
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Job tickets fetched:', data);
        setJobTickets(data.job_tickets || []);
      } else {
        throw new Error('Failed to fetch job tickets');
      }
    } catch (error) {
      console.error('❌ Error fetching job tickets:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle job ticket created
  const handleJobTicketCreated = useCallback((newJobTicket) => {
    console.log('🆕 Job ticket created, refreshing list...');
    fetchJobTickets(); // Refresh the entire list
  }, [fetchJobTickets]);

  // Handle job ticket updated
  const handleJobTicketUpdated = useCallback((updatedTicket) => {
    console.log('📝 Job ticket updated, refreshing list...');
    fetchJobTickets(); // Refresh the entire list
    toast.success(t('manager.jobTickets.messages.editSuccess'));
  }, [fetchJobTickets, t]);

  // Load job tickets on component mount
  useEffect(() => {
    fetchJobTickets();
  }, [fetchJobTickets]);

  // Calculate status statistics
  const getStatusStats = useCallback(() => {
    const totalTickets = jobTickets.length;
    const assignedToInvoice = jobTickets.filter(ticket => ticket.invoice_id).length;
    const notAssigned = totalTickets - assignedToInvoice;

    return {
      totalTickets,
      assignedToInvoice,
      notAssigned
    };
  }, [jobTickets]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // Format hours for display
  const formatHours = (hours) => {
    if (!hours) return '0';
    return parseFloat(hours).toFixed(1);
  };

  // Manager access check
  const { loading: accessLoading, error: accessError } = useManagerAccess();

  if (accessLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (accessError) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-4">{accessError}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            {t('common.goHome')}
          </button>
        </div>
      </div>
    );
  }

  if (!validateAccess()) {
    return null;
  }

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-4 md:p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-6">
      {/* Header with Action Buttons */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white mb-2">
            {t('manager.jobTickets.title')}
          </h1>
          <p className="text-gray-400">
            {t('manager.jobTickets.subtitle')}
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
          {/* Create Job Ticket Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 focus:bg-orange-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            {t('manager.jobTickets.actions.createJobTicket')}
          </button>
          
          {/* Create Invoice Button */}
          <button
            onClick={() => {
              // TODO: Implement create invoice functionality
              console.log('Create Invoice clicked - functionality to be implemented');
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 focus:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            {t('manager.jobTickets.actions.createInvoice')}
          </button>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Tickets */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClipboardDocumentListIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-white">{jobTickets.length}</p>
              <p className="text-gray-400 text-sm">{t('manager.jobTickets.stats.totalTickets')}</p>
            </div>
          </div>
        </div>

        {/* Assigned to Invoice */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-white">{stats.assignedToInvoice}</p>
              <p className="text-gray-400 text-sm">{t('manager.jobTickets.stats.assignedToInvoice')}</p>
            </div>
          </div>
        </div>

        {/* Not Assigned */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-white">{stats.notAssigned}</p>
              <p className="text-gray-400 text-sm">{t('manager.jobTickets.stats.notAssigned')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Job Tickets Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">
            {t('manager.jobTickets.table.title')}
          </h2>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-400 mb-4">{t('manager.jobTickets.messages.loadError')}</p>
            <button
              onClick={fetchJobTickets}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              {t('common.retry')}
            </button>
          </div>
        ) : jobTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <ClipboardDocumentListIcon className="h-12 w-12 text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {t('manager.jobTickets.empty.title')}
            </h3>
            <p className="text-gray-400 text-center max-w-md">
              {t('manager.jobTickets.empty.description')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('manager.jobTickets.table.headers.ticketNumber')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('manager.jobTickets.table.headers.submittedBy')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('manager.jobTickets.table.headers.companyName')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                    {t('manager.jobTickets.table.headers.workHours')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                    {t('manager.jobTickets.table.headers.travelHours')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('manager.jobTickets.table.headers.invoiceLink')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('manager.jobTickets.table.headers.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {jobTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-750 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {ticket.ticket_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {ticket.submitted_by_name || t('common.notAvailable')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {ticket.company_name || t('common.notAvailable')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 hidden sm:table-cell">
                      {formatHours(ticket.work_total_hours)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 hidden sm:table-cell">
                      {formatHours(ticket.drive_total_hours)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ticket.invoice_id 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {ticket.invoice_id ? t('manager.jobTickets.table.status.linked') : t('manager.jobTickets.table.status.notLinked')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowEditModal(true);
                          }}
                          className="text-orange-400 hover:text-orange-300 p-1 rounded transition-colors duration-200"
                          title={t('common.view')}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateJobTicketModal 
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)} 
          onJobTicketCreated={handleJobTicketCreated} 
        />
      )}
      {showEditModal && selectedTicket && (
        <EditJobTicketModal 
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTicket(null);
          }} 
          jobTicket={selectedTicket}
          onJobTicketUpdated={handleJobTicketUpdated}
        />
      )}
    </div>
  );
};

export default JobTickets;
