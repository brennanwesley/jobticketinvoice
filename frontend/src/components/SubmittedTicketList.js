import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

/**
 * Submitted Ticket List Component
 * Displays a table of submitted job tickets with responsive design
 */
const SubmittedTicketList = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch submitted tickets on component mount
  useEffect(() => {
    const fetchSubmittedTickets = async () => {
      try {
        setLoading(true);
        const response = await apiService.jobTickets.getSubmittedTickets();
        setTickets(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching submitted tickets:', err);
        setError(t('errors.fetchFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchSubmittedTickets();
  }, [t]);

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  // Truncate text with ellipsis
  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // View ticket details
  const handleViewTicket = (ticketId) => {
    // Implement view ticket functionality
    console.log('View ticket:', ticketId);
    // This would typically navigate to a ticket detail page
  };

  return (
    <div className="py-6 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {t('jobTicket.submitted')}
      </h1>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow max-w-full">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-24 sm:w-auto">
                  {t('jobTicket.date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-48 sm:w-1/4">
                  {t('jobTicket.company')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-48 sm:w-1/4">
                  {t('jobTicket.location')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-16 sm:w-auto">
                  {t('jobTicket.hours')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t('jobTicket.description')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider w-20">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {error ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-2 text-red-500">
                      <ExclamationCircleIcon className="h-5 w-5" />
                      <span>{t('errors.fetchFailed')}</span>
                    </div>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4">
                    <div className="text-center py-8">
                      <p className="text-gray-400">{t('jobTicket.noSubmitted')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatDate(ticket.job_date)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="truncate">
                        {ticket.company_name || t('jobTicket.untitledTicket')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="truncate">
                        {ticket.location || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {parseFloat(ticket.work_total_hours || 0) + parseFloat(ticket.travel_total_hours || 0)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="truncate">
                        {ticket.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleViewTicket(ticket.id)}
                        className="text-orange-500 hover:text-orange-400"
                        aria-label={`${t('common.view')} ${ticket.company_name || t('jobTicket.untitledTicket')}`}
                      >
                        {t('common.view')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SubmittedTicketList;
