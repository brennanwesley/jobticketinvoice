import React, { useState, useCallback, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTicket } from '../../context/TicketContext';
import { Card, Button, Modal, VirtualList, LoadingSpinner } from '../ui';
import { useMemoizedCallback } from '../../hooks';

/**
 * Draft Ticket List component
 * Displays a table of all draft job tickets with edit functionality
 */
const DraftTicketList = () => {
  const { t } = useLanguage();
  const { draftTickets, setSelectedDraftTicket, setViewMode, deleteDraftTicket, setTicketMode } = useTicket();
  
  // State for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // Format date for display - memoized to prevent recreation on each render
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    try {
      return dateString;
    } catch (e) {
      return dateString;
    }
  }, []);

  // Truncate text with ellipsis - memoized to prevent recreation on each render
  const truncateText = useCallback((text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  }, []);
  
  // Handle view ticket - memoized to prevent recreation on each render
  const handleViewTicket = useCallback((ticket) => {
    setSelectedDraftTicket(ticket);
    setViewMode('draft');
  }, [setSelectedDraftTicket, setViewMode]);
  
  // Handle edit ticket - memoized to prevent recreation on each render
  const handleEditTicket = useCallback((ticket) => {
    setSelectedTicket(ticket);
    setShowConfirmModal(true);
  }, [setSelectedTicket]);
  
  // Confirm edit and load draft into form - memoized to prevent recreation on each render
  const confirmEditDraft = useCallback(() => {
    if (selectedTicket) {
      // Set the selected draft ticket
      setSelectedDraftTicket(selectedTicket);
      
      // Set ticket mode to manual to ensure form loads properly
      setTicketMode('manual');
      
      // Change view mode to form to load the appropriate form component
      setViewMode('form');
      
      // Remove the draft from the list
      deleteDraftTicket(selectedTicket.id);
    }
    setShowConfirmModal(false);
  }, [selectedTicket, setSelectedDraftTicket, setTicketMode, setViewMode, deleteDraftTicket]);
  
  // Cancel edit - memoized to prevent recreation on each render
  const cancelEditDraft = useCallback(() => {
    setSelectedTicket(null);
    setShowConfirmModal(false);
  }, []);
  
  // Handle delete ticket - memoized to prevent recreation on each render
  const handleDeleteTicket = useCallback((ticketId) => {
    deleteDraftTicket(ticketId);
  }, [deleteDraftTicket]);
  
  return (
    <div className="py-6 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {t('jobTicket.drafts')}
      </h1>
      
      <Card className="overflow-hidden">
        {/* Table Header - Fixed to improve scrolling performance */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="sticky top-0 bg-gray-800 px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-24">
                  {t('common.edit')}
                </th>
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
                <th className="sticky top-0 bg-gray-800 px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            
            {/* Table Body - Use VirtualList for large datasets */}
            {draftTickets.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan="7" className="px-6 py-4">
                    <div className="text-center py-8">
                      <p className="text-gray-400">{t('jobTicket.noDrafts')}</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-gray-700">
                <VirtualList
                  items={draftTickets}
                  height={400}
                  itemHeight={64}
                  renderItem={(ticket) => (
                    <TicketRow
                      key={ticket.id}
                      ticket={ticket}
                      formatDate={formatDate}
                      handleEditTicket={handleEditTicket}
                      handleViewTicket={handleViewTicket}
                      handleDeleteTicket={handleDeleteTicket}
                      t={t}
                    />
                  )}
                  overscan={5}
                  emptyComponent={
                    <tr>
                      <td colSpan="7" className="px-6 py-4">
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
      
      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={cancelEditDraft}
        title={t('jobTicket.editConfirmation')}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={cancelEditDraft}>
              {t('common.no')}
            </Button>
            <Button variant="primary" onClick={confirmEditDraft} className="ml-3">
              {t('common.yes')}
            </Button>
          </>
        }
      >
        <p>{t('jobTicket.editConfirmationMessage')}</p>
      </Modal>
    </div>
  );
};

// Memoized Ticket Row component to prevent unnecessary re-renders
const TicketRow = React.memo(({ ticket, formatDate, handleEditTicket, handleViewTicket, handleDeleteTicket, t }) => {
  return (
    <tr className="hover:bg-gray-700">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleEditTicket(ticket)}
          className="text-orange-500 hover:text-orange-400 font-medium"
          aria-label={`${t('common.edit')} ${ticket.companyName || t('jobTicket.untitledTicket')}`}
        >
          {t('common.edit')}
        </Button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {formatDate(ticket.jobDate)}
      </td>
      <td className="px-6 py-4 text-sm">
        <div className="truncate">
          {ticket.companyName || t('jobTicket.untitledTicket')}
        </div>
      </td>
      <td className="px-6 py-4 text-sm">
        <div className="truncate">
          {ticket.location || '-'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {ticket.workTotalHours || '0'}
      </td>
      <td className="px-6 py-4 text-sm">
        <div className="truncate">
          {ticket.workDescription || '-'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
        <div className="flex flex-col sm:flex-row justify-end sm:space-x-3 space-y-2 sm:space-y-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewTicket(ticket)}
            className="text-blue-500 hover:text-blue-400"
            aria-label={`${t('common.view')} ${ticket.companyName || t('jobTicket.untitledTicket')}`}
          >
            {t('common.view')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteTicket(ticket.id)}
            className="text-red-500 hover:text-red-400"
            aria-label={`${t('common.delete')} ${ticket.companyName || t('jobTicket.untitledTicket')}`}
          >
            {t('common.delete')}
          </Button>
        </div>
      </td>
    </tr>
  );
});

// Export memoized component to prevent unnecessary re-renders
export default React.memo(DraftTicketList);
