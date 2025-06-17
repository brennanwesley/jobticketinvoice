import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useManagerAccess } from '../../hooks/useManagerAccess';
import { authenticatedFetch } from '../../utils/auth';
import { toast } from 'react-toastify';
import { 
  DocumentTextIcon,
  CurrencyDollarIcon,
  PaperAirplaneIcon,
  PencilIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import CreateInvoiceModal from './CreateInvoiceModal';

/**
 * Invoices Management Component
 * Provides comprehensive invoice management with status cards and data table
 */
const Invoices = ({ triggerInvoiceModal = false, setTriggerInvoiceModal }) => {
  const { t } = useLanguage();
  const { validateAccess } = useManagerAccess();
  
  // State management
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch invoices from backend (placeholder for future implementation)
  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Implement actual API call when backend is ready
      // const response = await authenticatedFetch('/invoices');
      // if (response.ok) {
      //   const data = await response.json();
      //   setInvoices(data);
      // } else {
      //   throw new Error('Failed to fetch invoices');
      // }
      
      // Placeholder data for UI demonstration
      setTimeout(() => {
        setInvoices([
          {
            id: 1,
            invoice_number: 'INV-00000001',
            created_on: '2025-06-15',
            created_by: 'John Manager',
            customer_name: 'ABC Corporation',
            total_amount: 1250.00,
            status: 'submitted'
          },
          {
            id: 2,
            invoice_number: 'INV-00000002',
            created_on: '2025-06-14',
            created_by: 'John Manager',
            customer_name: 'XYZ Industries',
            total_amount: 875.50,
            status: 'draft'
          },
          {
            id: 3,
            invoice_number: 'INV-00000003',
            created_on: '2025-06-13',
            created_by: 'John Manager',
            customer_name: 'Tech Solutions LLC',
            total_amount: 2100.75,
            status: 'submitted'
          }
        ]);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError(err.message);
      setLoading(false);
      toast.error(t('manager.invoices.messages.errorLoading'));
    }
  }, [t]);

  // Load invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Validate manager access - moved after hooks
  if (!validateAccess()) {
    return null;
  }

  // Calculate statistics
  const getStatusStats = () => {
    const totalInvoices = invoices.length;
    const draftInvoices = invoices.filter(invoice => invoice.status === 'draft').length;
    const submittedInvoices = invoices.filter(invoice => invoice.status === 'submitted').length;
    
    return {
      totalInvoices,
      draftInvoices,
      submittedInvoices
    };
  };

  // Handle edit invoice
  const handleEditInvoice = (invoiceId) => {
    // TODO: Implement edit functionality
    console.log('Edit invoice clicked - functionality to be implemented', invoiceId);
    toast.info('Edit functionality will be implemented in future updates');
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  useEffect(() => {
    if (triggerInvoiceModal) {
      setShowCreateModal(true);
      setTriggerInvoiceModal(false);
    }
  }, [triggerInvoiceModal, setTriggerInvoiceModal]);

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-6">
      {/* Header with Create Invoice Button */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white mb-2">
            {t('manager.invoices.title')}
          </h1>
          <p className="text-gray-400">
            {t('manager.invoices.subtitle')}
          </p>
        </div>
        
        {/* Create Invoice Button */}
        <div className="lg:flex-shrink-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 focus:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            {t('manager.invoices.actions.createInvoice')}
          </button>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Invoices */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-white">{stats.totalInvoices}</p>
              <p className="text-gray-400 text-sm">{t('manager.invoices.stats.totalInvoices')}</p>
            </div>
          </div>
        </div>

        {/* Draft Invoices */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <PencilIcon className="h-8 w-8 text-gray-500" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-white">{stats.draftInvoices}</p>
              <p className="text-gray-400 text-sm">{t('manager.invoices.stats.draftInvoices')}</p>
            </div>
          </div>
        </div>

        {/* Submitted Invoices */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <PaperAirplaneIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-white">{stats.submittedInvoices}</p>
              <p className="text-gray-400 text-sm">{t('manager.invoices.stats.submittedInvoices')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">
            {t('manager.invoices.table.title')}
          </h2>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-400 mb-4">{t('manager.invoices.messages.errorLoading')}</p>
            <button
              onClick={fetchInvoices}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              {t('common.retry')}
            </button>
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              {t('manager.invoices.empty.title')}
            </h3>
            <p className="text-gray-400 text-center max-w-md">
              {t('manager.invoices.empty.description')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-750">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('manager.invoices.table.headers.invoiceNumber')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('manager.invoices.table.headers.createdOn')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('manager.invoices.table.headers.createdBy')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('manager.invoices.table.headers.customerName')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('manager.invoices.table.headers.totalAmount')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('manager.invoices.table.headers.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('manager.invoices.table.headers.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-750 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(invoice.created_on)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {invoice.created_by}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {invoice.customer_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatCurrency(invoice.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        invoice.status === 'submitted' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {t(`manager.invoices.table.status.${invoice.status}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <button
                        onClick={() => handleEditInvoice(invoice.id)}
                        className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                        title={t('manager.invoices.actions.edit')}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showCreateModal && (
        <CreateInvoiceModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onInvoiceCreated={(newInvoice) => {
            // Add the new invoice to the beginning of the list
            setInvoices(prevInvoices => [
              {
                id: newInvoice.id,
                invoice_number: newInvoice.invoice_number,
                created_on: newInvoice.created_on,
                created_by: newInvoice.created_by,
                customer_name: newInvoice.customer_name,
                total_amount: newInvoice.total,
                status: newInvoice.status
              },
              ...prevInvoices
            ]);
            setShowCreateModal(false);
          }}
          mode="manual"
        />
      )}
    </div>
  );
};

export default Invoices;
