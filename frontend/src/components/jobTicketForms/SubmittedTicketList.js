import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import jobTicketService from '../../services/jobTicketService';
import { Toast } from '../ui/Toast';

/**
 * SubmittedTicketList Component
 * 
 * Displays a list of submitted job tickets with:
 * - Ticket number
 * - Submission date
 * - Company name
 * - Location
 * - Status
 * - Actions (view details)
 */
const SubmittedTicketList = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State for tickets and loading
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Toast state
  const [toast, setToast] = useState({ show: false, type: 'info', message: '' });
  
  // Load tickets on component mount
  useEffect(() => {
    loadTickets();
  }, []);
  
  /**
   * Load submitted tickets from API
   */
  const loadTickets = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const allTickets = await jobTicketService.getAllJobTickets();
      
      // Sort by submission date (newest first)
      const sortedTickets = allTickets.sort((a, b) => {
        return new Date(b.submission_date) - new Date(a.submission_date);
      });
      
      setTickets(sortedTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
      setError(error.message || 'Failed to load tickets');
      
      // Show error toast
      showToast('error', error.message || t('jobTicket.loadError'));
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Navigate to ticket details
   * @param {string} id - Ticket ID
   */
  const viewTicketDetails = (id) => {
    navigate(`/dashboard/ticket/${id}`);
  };
  
  /**
   * Format date for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  /**
   * Show a toast notification
   * @param {string} type - Toast type (success, error, info, warning)
   * @param {string} message - Toast message
   */
  const showToast = (type, message) => {
    setToast({
      show: true,
      type,
      message
    });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000);
  };
  
  /**
   * Close the toast
   */
  const closeToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-md p-4 my-4">
        <h3 className="text-red-500 font-bold">{t('common.error')}</h3>
        <p className="text-red-400">{error}</p>
        <button 
          onClick={loadTickets}
          className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }
  
  // Render empty state
  if (tickets.length === 0) {
    return (
      <div className="bg-gray-700 rounded-lg p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-4">
          {t('jobTicket.noTickets')}
        </h2>
        <p className="text-gray-300 mb-6">
          {t('jobTicket.noTicketsMessage')}
        </p>
        <button
          onClick={() => navigate('/dashboard/job-ticket-selector')}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-md transition-colors"
        >
          {t('jobTicket.createNew')}
        </button>
      </div>
    );
  }
  
  // Render tickets list
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          {t('jobTicket.submittedTickets')}
        </h2>
        <button
          onClick={() => navigate('/dashboard/job-ticket-selector')}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md transition-colors"
        >
          {t('jobTicket.createNew')}
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {t('jobTicket.ticketNumber')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {t('jobTicket.date')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {t('jobTicket.companyName')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {t('jobTicket.location')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {t('jobTicket.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  {ticket.ticket_number || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {formatDate(ticket.submission_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {ticket.company_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {ticket.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    ticket.status === 'submitted' ? 'bg-green-500 bg-opacity-20 text-green-400' :
                    ticket.status === 'processing' ? 'bg-blue-500 bg-opacity-20 text-blue-400' :
                    ticket.status === 'completed' ? 'bg-purple-500 bg-opacity-20 text-purple-400' :
                    'bg-gray-500 bg-opacity-20 text-gray-400'
                  }`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <button
                    onClick={() => viewTicketDetails(ticket.id)}
                    className="text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    {t('common.view')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Toast notification */}
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          show={toast.show}
          onClose={closeToast}
        />
      )}
    </div>
  );
};

export default SubmittedTicketList;
