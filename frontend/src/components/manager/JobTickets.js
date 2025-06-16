import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useManagerAccess } from '../../hooks/useManagerAccess';
import { authenticatedFetch } from '../../utils/auth';
import { toast } from 'react-toastify';
import { 
  ClipboardDocumentListIcon, 
  DocumentTextIcon, 
  CurrencyDollarIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import CreateJobTicketModal from './CreateJobTicketModal';

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
  const [editingTicket, setEditingTicket] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [editForm, setEditForm] = useState({
    work_total_hours: '',
    drive_total_hours: '',
    company_name: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch job tickets from API
  const fetchJobTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authenticatedFetch('/job-tickets/');
      if (response.ok) {
        const data = await response.json();
        setJobTickets(data.job_tickets || []);
      } else {
        throw new Error('Failed to fetch job tickets');
      }
    } catch (error) {
      console.error('Error fetching job tickets:', error);
      setError(t('manager.jobTickets.messages.errorLoading'));
      toast.error(t('manager.jobTickets.messages.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Handle job ticket creation
  const handleJobTicketCreated = useCallback(async (newJobTicket) => {
    try {
      // Refresh the job tickets list to include the new ticket
      await fetchJobTickets();
    } catch (error) {
      console.error('Error refreshing job tickets after creation:', error);
      // Still show success since the ticket was created, just refresh manually
      toast.info('Job ticket created! Please refresh the page to see it in the list.');
    }
  }, [fetchJobTickets]);

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

  // Validate manager access
  if (!validateAccess()) {
    return null;
  }

  // Handle edit ticket
  const handleEditTicket = (ticket) => {
    setEditingTicket(ticket.id);
    setEditForm({
      work_total_hours: ticket.work_total_hours || '',
      drive_total_hours: ticket.drive_total_hours || '',
      company_name: ticket.company_name || ''
    });
  };

  // Handle save edit
  const handleSaveEdit = async (ticketId) => {
    if (!ticketId) return;

    try {
      const response = await authenticatedFetch(`/job-tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_name: editForm.company_name,
          work_total_hours: parseFloat(editForm.work_total_hours) || 0,
          drive_total_hours: parseFloat(editForm.drive_total_hours) || 0,
        }),
      });

      if (response.ok) {
        const updatedTicket = await response.json();
        setJobTickets(prev => 
          prev.map(ticket => 
            ticket.id === ticketId ? { ...ticket, ...updatedTicket } : ticket
          )
        );
        setEditingTicket(null);
        setEditForm({ work_total_hours: '', drive_total_hours: '', company_name: '' });
        toast.success(t('manager.jobTickets.messages.editSuccess'));
      } else {
        throw new Error('Failed to update ticket');
      }
    } catch (error) {
      console.error('Error updating job ticket:', error);
      toast.error(t('manager.jobTickets.messages.editError'));
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingTicket(null);
    setEditForm({
      work_total_hours: '',
      drive_total_hours: '',
      company_name: ''
    });
  };

  // Handle delete ticket
  const handleDeleteTicket = (ticket) => {
    setTicketToDelete(ticket);
    setShowDeleteModal(true);
  };

  // Confirm delete ticket
  const confirmDeleteTicket = async () => {
    if (!ticketToDelete) return;

    try {
      const response = await authenticatedFetch(`/job-tickets/${ticketToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setJobTickets(prev => prev.filter(ticket => ticket.id !== ticketToDelete.id));
        toast.success(t('manager.jobTickets.messages.deleteSuccess'));
      } else {
        throw new Error('Failed to delete ticket');
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast.error(t('manager.jobTickets.messages.deleteError'));
    } finally {
      setShowDeleteModal(false);
      setTicketToDelete(null);
    }
  };

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
            <p className="text-red-400 mb-4">{t('manager.jobTickets.messages.errorLoading')}</p>
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
                      {editingTicket === ticket.id ? (
                        <input
                          type="text"
                          value={editForm.company_name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, company_name: e.target.value }))}
                          className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={t('manager.jobTickets.table.placeholders.companyName')}
                        />
                      ) : (
                        ticket.company_name || t('common.notAvailable')
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 hidden sm:table-cell">
                      {editingTicket === ticket.id ? (
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={editForm.work_total_hours}
                          onChange={(e) => setEditForm(prev => ({ ...prev, work_total_hours: e.target.value }))}
                          className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        formatHours(ticket.work_total_hours)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 hidden sm:table-cell">
                      {editingTicket === ticket.id ? (
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={editForm.drive_total_hours}
                          onChange={(e) => setEditForm(prev => ({ ...prev, drive_total_hours: e.target.value }))}
                          className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        formatHours(ticket.drive_total_hours)
                      )}
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
                        {editingTicket === ticket.id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(ticket.id)}
                              className="text-green-400 hover:text-green-300 p-1 rounded transition-colors duration-200"
                              title={t('common.save')}
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-400 hover:text-gray-300 p-1 rounded transition-colors duration-200"
                              title={t('common.cancel')}
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditTicket(ticket)}
                              className="text-blue-400 hover:text-blue-300 p-1 rounded transition-colors duration-200"
                              title={t('common.edit')}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTicket(ticket)}
                              className="text-red-400 hover:text-red-300 p-1 rounded transition-colors duration-200"
                              title={t('common.delete')}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && ticketToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-white">
                {t('manager.jobTickets.deleteModal.title')}
              </h3>
            </div>
            <p className="text-gray-300 mb-6">
              {t('manager.jobTickets.deleteModal.message', { ticketNumber: ticketToDelete.ticket_number })}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setTicketToDelete(null);
                }}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={confirmDeleteTicket}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
      {showCreateModal && (
        <CreateJobTicketModal 
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)} 
          onJobTicketCreated={handleJobTicketCreated} 
        />
      )}
    </div>
  );
};

export default JobTickets;
