import React, { useState, useCallback, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useApiCache, useMemoizedCallback } from '../../hooks';
import { Card, Button, VirtualList, LoadingSpinner } from '../ui';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

/**
 * Submitted Ticket List Component
 * Displays a table of submitted job tickets with responsive design
 */
const SubmittedTicketList = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  // Use the API cache hook for fetching submitted tickets
  // This will cache the results for 5 minutes by default
  const { 
    data: ticketsResponse, 
    isLoading: loading, 
    error: apiError,
    refetch
  } = useApiCache('/api/job-tickets/submitted', {
    cacheTime: 3 * 60 * 1000, // 3 minutes cache
    onError: (err) => console.error('Error fetching submitted tickets:', err)
  });
  
  // Extract tickets from the response
  const tickets = ticketsResponse?.data || [];
  
  // Format error message
  const error = apiError ? t('errors.fetchFailed') : null;

  // Format date for display - memoized to prevent recreation on each render
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  }, []);

  // Truncate text with ellipsis - memoized to prevent recreation on each render
  const truncateText = useCallback((text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  }, []);

  // View ticket details - memoized to prevent recreation on each render
  const handleViewTicket = useCallback((ticketId) => {
    // Implement view ticket functionality
    console.log('View ticket:', ticketId);
    // This would typically navigate to a ticket detail page
  }, []);
  
  // Memoize tickets data to prevent unnecessary re-renders
  const memoizedTickets = useMemo(() => tickets || [], [tickets]);

  return (
    <div className="py-6 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {t('jobTicket.submitted')}
      </h1>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" variant="primary" />
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="sticky top-0 bg-gray-800 px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-24 sm:w-auto">
                    {t('jobTicket.date')}
                  </th>
                  <th className="sticky top-0 bg-gray-800 px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-48 sm:w-1/4">
                    {t('jobTicket.company')}
                  </th>
                  <th className="sticky top-0 bg-gray-800 px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-48 sm:w-1/4">
                    {t('jobTicket.location')}
                  </th>
                  <th className="sticky top-0 bg-gray-800 px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-16 sm:w-auto">
                    {t('jobTicket.hours')}
                  </th>
                  <th className="sticky top-0 bg-gray-800 px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {t('jobTicket.description')}
                  </th>
                  <th className="sticky top-0 bg-gray-800 px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider w-20">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              {/* Error State */}
              {error ? (
                <tbody>
                  <tr>
                    <td colSpan="6" className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2 text-red-500">
                        <ExclamationCircleIcon className="h-5 w-5" />
                        <span>{error}</span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => refetch()} 
                          className="ml-3"
                        >
                          {t('common.retry')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              ) : memoizedTickets.length === 0 ? (
                /* Empty State */
                <tbody>
                  <tr>
                    <td colSpan="6" className="px-6 py-4">
                      <div className="text-center py-8">
                        <p className="text-gray-400">{t('jobTicket.noSubmitted')}</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              ) : (
                /* Data State with Virtualized List */
                <tbody className="divide-y divide-gray-700">
                  <VirtualList
                    items={memoizedTickets}
                    height={400}
                    itemHeight={64}
                    renderItem={(ticket) => (
                      <TicketRow
                        key={ticket.id}
                        ticket={ticket}
                        formatDate={formatDate}
                        handleViewTicket={handleViewTicket}
                        t={t}
                      />
                    )}
                    overscan={5}
                    emptyComponent={
                      <tr>
                        <td colSpan="6" className="px-6 py-4">
                          <div className="text-center py-8">
                            <LoadingSpinner size="md" />
                          </div>
                        </td>
                      </tr>
                    }
                  />
                </tbody>
              )}
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

// Memoized Ticket Row component to prevent unnecessary re-renders
const TicketRow = React.memo(({ ticket, formatDate, handleViewTicket, t }) => {
  // Calculate total hours once
  const totalHours = useMemo(() => {
    return parseFloat(ticket.work_total_hours || 0) + parseFloat(ticket.travel_total_hours || 0);
  }, [ticket.work_total_hours, ticket.travel_total_hours]);
  
  return (
    <tr className="hover:bg-gray-700">
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
        {totalHours}
      </td>
      <td className="px-6 py-4 text-sm">
        <div className="truncate">
          {ticket.description || '-'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleViewTicket(ticket.id)}
          className="text-orange-500 hover:text-orange-400"
          aria-label={`${t('common.view')} ${ticket.company_name || t('jobTicket.untitledTicket')}`}
        >
          {t('common.view')}
        </Button>
      </td>
    </tr>
  );
});

// Export memoized component to prevent unnecessary re-renders
export default React.memo(SubmittedTicketList);
