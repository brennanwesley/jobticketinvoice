import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

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
      ) : error ? (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 px-4 py-3 rounded">
          {error}
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <p className="text-gray-400">{t('jobTicket.noSubmitted')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow max-w-full">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-24 sm:w-auto">
                  {t('jobTicket.date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-32 sm:w-auto">
                  {t('jobTicket.company')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  {t('jobTicket.workType')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  {t('jobTicket.description')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-16 sm:w-auto">
                  {t('jobTicket.hours')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(ticket.job_date)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="max-w-[120px] sm:max-w-xs truncate">
                      {ticket.company_name || t('jobTicket.untitledTicket')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm hidden md:table-cell">
                    <div className="truncate">
                      {t(`workTypes.${ticket.work_type}`) || ticket.work_type || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm hidden lg:table-cell">
                    <div className="max-w-xs truncate">
                      {ticket.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {parseFloat(ticket.work_total_hours || 0) + parseFloat(ticket.travel_total_hours || 0)}
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SubmittedTicketList;
