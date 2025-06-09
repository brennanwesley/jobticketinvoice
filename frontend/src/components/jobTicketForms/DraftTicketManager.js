import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDraftTickets } from '../../context/DraftTicketContext';
import { useLanguage } from '../../context/LanguageContext';
import { Modal } from '../ui/Modal';
import { Toast } from '../ui/Toast';

/**
 * DraftTicketManager Component
 * 
 * Provides UI and functionality for managing draft job tickets:
 * - Listing all saved drafts
 * - Loading a draft for editing
 * - Deleting drafts
 * - Confirmation dialogs for actions
 * 
 * This component is designed to be used on the landing page or
 * as a modal in the job ticket form.
 */
const DraftTicketManager = ({ onDraftSelected = null, showAsModal = false, isOpen = false, onClose = null }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { 
    draftTickets, 
    isLoading, 
    loadDraftIntoForm, 
    deleteDraft 
  } = useDraftTickets();
  
  // Local state
  const [toast, setToast] = useState({ show: false, type: 'info', message: '' });
  const [confirmModal, setConfirmModal] = useState({ 
    show: false, 
    title: '', 
    message: '', 
    onConfirm: null,
    draftId: null
  });
  const [sortedDrafts, setSortedDrafts] = useState([]);
  
  // Sort drafts by last updated date (newest first)
  useEffect(() => {
    if (draftTickets && draftTickets.length > 0) {
      const sorted = [...draftTickets]
        .filter(draft => draft.status === 'draft') // Only show actual drafts
        .sort((a, b) => {
          return new Date(b.lastUpdated) - new Date(a.lastUpdated);
        });
      setSortedDrafts(sorted);
    } else {
      setSortedDrafts([]);
    }
  }, [draftTickets]);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };
  
  // Handle loading a draft
  const handleLoadDraft = (draft) => {
    try {
      loadDraftIntoForm(draft);
      
      setToast({
        show: true,
        type: 'success',
        message: t('jobTicket.draftLoaded')
      });
      
      // If callback provided, use it
      if (onDraftSelected) {
        onDraftSelected(draft);
      } else {
        // Otherwise navigate to the appropriate form based on work type
        const route = draft.workType === 'byHand' 
          ? '/job-ticket/by-hand' 
          : '/job-ticket/standard';
        
        navigate(route);
      }
      
      // Close modal if in modal mode
      if (showAsModal && onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error loading draft:', error);
      setToast({
        show: true,
        type: 'error',
        message: t('jobTicket.draftLoadError')
      });
    }
  };
  
  // Confirm delete draft
  const confirmDeleteDraft = (draftId) => {
    setConfirmModal({
      show: true,
      title: t('jobTicket.confirmDeleteDraft'),
      message: t('jobTicket.confirmDeleteDraftMessage'),
      onConfirm: () => handleDeleteDraft(draftId),
      draftId
    });
  };
  
  // Handle deleting a draft
  const handleDeleteDraft = (draftId) => {
    try {
      deleteDraft(draftId);
      
      setToast({
        show: true,
        type: 'success',
        message: t('jobTicket.draftDeleted')
      });
      
      // Close confirmation modal
      setConfirmModal({ ...confirmModal, show: false });
    } catch (error) {
      console.error('Error deleting draft:', error);
      setToast({
        show: true,
        type: 'error',
        message: t('jobTicket.draftDeleteError')
      });
    }
  };
  
  // Close toast
  const closeToast = () => setToast({ ...toast, show: false });
  
  // Close confirmation modal
  const closeConfirmModal = () => setConfirmModal({ ...confirmModal, show: false });
  
  // Render draft list
  const renderDraftList = () => {
    if (isLoading) {
      return (
        <div className="py-4 text-center">
          <p className="text-gray-400">{t('common.loading')}</p>
        </div>
      );
    }
    
    if (sortedDrafts.length === 0) {
      return (
        <div className="py-4 text-center">
          <p className="text-gray-400">{t('jobTicket.noDrafts')}</p>
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto w-full">
        <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {t('jobTicket.company')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {t('jobTicket.location')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {t('jobTicket.lastUpdated')}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sortedDrafts.map(draft => (
              <tr key={draft.id} className="hover:bg-gray-700 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                  {draft.companyName || t('jobTicket.untitledDraft')}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                  {draft.location || t('jobTicket.noLocation')}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                  {formatDate(draft.lastUpdated)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors mr-2"
                    onClick={() => handleLoadDraft(draft)}
                  >
                    {t('common.edit')}
                  </button>
                  <button
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                    onClick={() => confirmDeleteDraft(draft.id)}
                  >
                    {t('common.delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Main content
  const content = (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">
        {t('jobTicket.savedDrafts')}
      </h2>
      
      {renderDraftList()}
      
      {/* Toast notification */}
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          show={toast.show}
          onClose={closeToast}
        />
      )}
      
      {/* Confirmation modal */}
      <Modal
        isOpen={confirmModal.show}
        onClose={closeConfirmModal}
        title={confirmModal.title}
        size="sm"
        footer={
          <div className="flex justify-end space-x-2">
            <button
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-md transition-colors"
              onClick={closeConfirmModal}
            >
              {t('common.cancel')}
            </button>
            <button
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md transition-colors"
              onClick={() => handleDeleteDraft(confirmModal.draftId)}
            >
              {t('common.delete')}
            </button>
          </div>
        }
      >
        <p>{confirmModal.message}</p>
      </Modal>
    </div>
  );
  
  // If showing as modal, wrap in Modal component
  if (showAsModal) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t('jobTicket.savedDrafts')}
        size="lg"
      >
        {content}
      </Modal>
    );
  }
  
  // Otherwise return content directly
  return content;
};

export default DraftTicketManager;
