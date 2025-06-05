import React, { useState, memo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTicket } from '../context/TicketContext';

/**
 * Draft Ticket List component
 * Displays a table of all draft job tickets with edit functionality
 */
const DraftTicketList = () => {
  const { t } = useLanguage();
  const { draftTickets, setSelectedDraftTicket, setViewMode, deleteDraftTicket } = useTicket();
  
  // State for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      return dateString;
    } catch (e) {
      return dateString;
    }
  };

  // Truncate text with ellipsis
  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };
  
  // Handle view ticket
  const handleViewTicket = (ticket) => {
    setSelectedDraftTicket(ticket);
    setViewMode('draft');
  };
  
  // Handle edit ticket
  const handleEditTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowConfirmModal(true);
  };
  
  // Confirm edit and load draft into form
  const confirmEditDraft = () => {
    if (selectedTicket) {
      // Set the selected draft ticket
      setSelectedDraftTicket(selectedTicket);
      
      // Set ticket mode to manual to ensure form loads properly
      const { setTicketMode } = require('../context/TicketContext').default;
      setTicketMode('manual');
      
      // Change view mode to form to load the appropriate form component
      setViewMode('form');
      
      // Remove the draft from the list
      deleteDraftTicket(selectedTicket.id);
    }
    setShowConfirmModal(false);
  };
  
  // Cancel edit
  const cancelEditDraft = () => {
    setSelectedTicket(null);
    setShowConfirmModal(false);
  };
  
  // Handle delete ticket
  const handleDeleteTicket = (ticketId) => {
    deleteDraftTicket(ticketId);
  };
  
  return (
    <div className="py-6 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {t('jobTicket.drafts')}
      </h1>
      
      (
        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow max-w-full">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-24">
                  {t('common.edit')}
                </th>
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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {draftTickets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4">
                    <div className="text-center py-8">
                      <p className="text-gray-400">{t('jobTicket.noDrafts')}</p>
                    </div>
                  </td>
                </tr>
              ) : draftTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <button
                      onClick={() => handleEditTicket(ticket)}
                      className="text-orange-500 hover:text-orange-400 font-medium"
                      aria-label={`${t('common.edit')} ${ticket.companyName || t('jobTicket.untitledTicket')}`}
                    >
                      {t('common.edit')}
                    </button>
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
                      <button
                        onClick={() => handleViewTicket(ticket)}
                        className="text-blue-500 hover:text-blue-400"
                        aria-label={`${t('common.view')} ${ticket.companyName || t('jobTicket.untitledTicket')}`}
                      >
                        {t('common.view')}
                      </button>
                      <button
                        onClick={() => handleDeleteTicket(ticket.id)}
                        className="text-red-500 hover:text-red-400"
                        aria-label={`${t('common.delete')} ${ticket.companyName || t('jobTicket.untitledTicket')}`}
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">
              Need to edit this Job Ticket?
            </h3>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelEditDraft}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
              >
                No
              </button>
              <button
                onClick={confirmEditDraft}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(DraftTicketList);
