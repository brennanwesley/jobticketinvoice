import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { groupTicketsByCustomerCompany } from '../../utils/invoiceValidation';
import Modal from '../ui/Modal';

/**
 * Same Customer Warning Modal Component
 * Shows detailed information about mixed customer companies in selected job tickets
 * Provides options to fix the selection automatically
 */
const SameCustomerWarningModal = ({ 
  isOpen, 
  onClose, 
  selectedJobTickets = [], 
  onAutoFix = null,
  showAutoFix = false 
}) => {
  const { t } = useLanguage();

  // Group tickets by customer company for display
  const ticketGroups = groupTicketsByCustomerCompany(selectedJobTickets);
  const customerCompanies = Object.keys(ticketGroups);

  const handleAutoFix = (targetCompany) => {
    if (onAutoFix) {
      const ticketsToKeep = ticketGroups[targetCompany] || [];
      onAutoFix(ticketsToKeep.map(ticket => ticket.id));
    }
    onClose();
  };

  const modalContent = (
    <div className="space-y-4">
      <div className="flex items-start space-x-3">
        <ExclamationTriangleIcon className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-gray-300 mb-4">
            {t('manager.jobTickets.warning.content')}
          </p>
          
          {customerCompanies.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-medium text-gray-200 mb-2">
                Selected tickets by customer company:
              </h4>
              {customerCompanies.map(company => (
                <div key={company} className="flex justify-between items-center py-2 px-3 bg-gray-700 rounded">
                  <div>
                    <span className="text-white font-medium">{company}</span>
                    <span className="text-gray-400 text-sm ml-2">
                      ({ticketGroups[company].length} ticket{ticketGroups[company].length !== 1 ? 's' : ''})
                    </span>
                  </div>
                  {showAutoFix && onAutoFix && (
                    <button
                      onClick={() => handleAutoFix(company)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors duration-200"
                    >
                      Keep Only These
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {showAutoFix && (
            <p className="text-sm text-gray-400 mt-3">
              You can automatically keep tickets from one customer company and remove the others, or manually adjust your selection.
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const actions = [
    {
      label: t('common.ok'),
      onClick: onClose,
      variant: 'primary'
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('manager.jobTickets.warning.title')}
      content={modalContent}
      actions={actions}
      size="md"
    />
  );
};

export default SameCustomerWarningModal;
