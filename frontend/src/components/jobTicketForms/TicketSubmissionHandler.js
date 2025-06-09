import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useDraftTickets } from '../../context/DraftTicketContext';
import { useAuth } from '../../context/AuthContext';
import jobTicketService from '../../services/jobTicketService';
import { Toast } from '../ui/Toast';
import { Modal } from '../ui/Modal';

/**
 * TicketSubmissionHandler Component
 * 
 * Handles the submission process for job tickets with:
 * - Validation
 * - Progress tracking
 * - Success/error handling
 * - Confirmation dialogs
 * - Redirect after submission
 * 
 * This component wraps around form components to provide submission functionality.
 */
const TicketSubmissionHandler = ({ 
  children, 
  onSubmitStart = null,
  onSubmitComplete = null,
  onSubmitError = null,
  redirectPath = '/'
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveDraft, markDraftAsSubmitted } = useDraftTickets();
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [submitResult, setSubmitResult] = useState(null);
  
  // Toast state
  const [toast, setToast] = useState({ show: false, type: 'info', message: '' });
  
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({ 
    show: false, 
    title: '', 
    message: '', 
    onConfirm: null,
    formData: null
  });
  
  /**
   * Show a toast notification
   * @param {string} type - Toast type (success, error, info, warning)
   * @param {string} message - Toast message
   */
  const showToast = useCallback((type, message) => {
    setToast({
      show: true,
      type,
      message
    });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000);
  }, []);
  
  /**
   * Close the toast
   */
  const closeToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);
  
  /**
   * Handle submission progress updates
   * @param {number} progress - Progress percentage (0-100)
   */
  const handleProgress = useCallback((progress) => {
    setSubmitProgress(progress);
  }, []);
  
  /**
   * Submit a job ticket
   * @param {Object} formData - Form data to submit
   */
  const submitJobTicket = useCallback(async (formData) => {
    try {
      setIsSubmitting(true);
      setSubmitProgress(0);
      
      // Notify submission start
      if (onSubmitStart) {
        onSubmitStart(formData);
      }
      
      // Add submitter information
      const ticketData = {
        ...formData,
        submittedBy: user?.username || formData.submittedBy || 'Unknown',
        status: 'submitted'
      };
      
      // Save as draft first to prevent data loss
      const savedDraft = saveDraft(jobTicketService.prepareDraftData(ticketData));
      
      // Submit to API with progress tracking
      const result = await jobTicketService.submitJobTicket(savedDraft, handleProgress);
      
      setSubmitResult(result);
      
      if (result.success) {
        // Mark draft as submitted
        if (savedDraft.id) {
          markDraftAsSubmitted(savedDraft, result.id);
        }
        
        // Show success toast
        showToast('success', t('jobTicket.submitSuccess', { 
          ticketNumber: result.ticketNumber 
        }));
        
        // Notify submission complete
        if (onSubmitComplete) {
          onSubmitComplete(result);
        }
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate(redirectPath);
        }, 2000);
      } else {
        // Show error toast
        showToast('error', result.message || t('jobTicket.submitError'));
        
        // Notify submission error
        if (onSubmitError) {
          onSubmitError(result.error);
        }
      }
    } catch (error) {
      console.error('Error submitting job ticket:', error);
      
      // Show error toast
      showToast('error', error.message || t('jobTicket.submitError'));
      
      // Notify submission error
      if (onSubmitError) {
        onSubmitError(error);
      }
      
      setSubmitResult({
        success: false,
        message: error.message || t('jobTicket.submitError'),
        error
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    user, 
    saveDraft, 
    markDraftAsSubmitted, 
    handleProgress, 
    showToast, 
    t, 
    onSubmitStart, 
    onSubmitComplete, 
    onSubmitError, 
    navigate, 
    redirectPath
  ]);
  
  /**
   * Request confirmation before submitting
   * @param {Object} formData - Form data to submit
   */
  const confirmSubmit = useCallback((formData) => {
    // Validate form data
    const validation = jobTicketService.validateJobTicket(formData);
    
    if (!validation.isValid) {
      // Show validation errors
      showToast('error', t('validation.fixErrors'));
      return;
    }
    
    // Show confirmation modal
    setConfirmModal({
      show: true,
      title: t('jobTicket.confirmSubmit'),
      message: t('jobTicket.confirmSubmitMessage'),
      onConfirm: () => submitJobTicket(formData),
      formData
    });
  }, [submitJobTicket, showToast, t]);
  
  /**
   * Close confirmation modal
   */
  const closeConfirmModal = useCallback(() => {
    setConfirmModal(prev => ({ ...prev, show: false }));
  }, []);
  
  /**
   * Handle confirmation modal action
   */
  const handleConfirmAction = useCallback(() => {
    if (confirmModal.onConfirm && confirmModal.formData) {
      confirmModal.onConfirm(confirmModal.formData);
    }
    closeConfirmModal();
  }, [confirmModal, closeConfirmModal]);
  
  // Render submission UI with children
  return (
    <>
      {/* Pass submission handlers to children */}
      {React.Children.map(children, child => {
        // Check if the child already has an onSubmit handler
        const childOnSubmit = child.props.onSubmit;
        
        return React.cloneElement(child, {
          onSubmit: (data) => {
            console.log('TicketSubmissionHandler received form data:', data);
            // Call confirmSubmit to show confirmation dialog
            confirmSubmit(data);
          },
          isSubmitting,
          submitProgress,
          submitResult
        });
      })}
      
      {/* Submission progress indicator */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">
              {t('jobTicket.submitting')}
            </h3>
            
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
              <div 
                className="bg-orange-500 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${submitProgress}%` }}
              ></div>
            </div>
            
            <p className="text-gray-300">
              {t('jobTicket.submittingMessage')}
            </p>
          </div>
        </div>
      )}
      
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
        size="md"
        footer={
          <div className="flex justify-end space-x-2">
            <button
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-md transition-colors"
              onClick={closeConfirmModal}
            >
              {t('common.cancel')}
            </button>
            <button
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md transition-colors"
              onClick={handleConfirmAction}
            >
              {t('common.confirm')}
            </button>
          </div>
        }
      >
        <p>{confirmModal.message}</p>
      </Modal>
    </>
  );
};

export default TicketSubmissionHandler;
