import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { authenticatedFetch } from '../../utils/auth';
import { toast } from 'react-toastify';
import Modal from '../ui/Modal';
import { 
  DocumentTextIcon,
  TrashIcon,
  PlusIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

/**
 * Create Invoice Modal Component
 * 
 * Supports two modes:
 * 1. Job Ticket Based - Generate invoice from selected job tickets
 * 2. Manual Entry - Create invoice from scratch
 * 
 * Features:
 * - Professional invoice layout
 * - Auto-calculated totals and service fees
 * - Editable line items
 * - Multiple trigger points support
 */
const CreateInvoiceModal = ({
  isOpen,
  onClose,
  onInvoiceCreated,
  selectedJobTickets = [],
  mode = 'manual' // 'jobTickets' or 'manual'
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    company_name: user?.company_name || '',
    customer_name: '',
    line_items: [],
    notes: ''
  });
  
  // Generate unique invoice number (YY + 6-digit sequence)
  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const sequence = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `${year}${sequence}`;
  };
  
  // Initialize invoice data only when modal opens
  useEffect(() => {
    if (isOpen) {
      // Generate invoice number only once when modal opens
      const newInvoiceNumber = generateInvoiceNumber();
      
      setInvoiceData(prev => ({
        ...prev,
        invoice_number: newInvoiceNumber,
        invoice_date: new Date().toISOString().split('T')[0],
        company_name: user?.company_name || '',
        line_items: mode === 'jobTickets' ? generateLineItemsFromJobTickets() : [],
        customer_name: mode === 'jobTickets' && selectedJobTickets.length > 0 
          ? (selectedJobTickets[0].customer_name || selectedJobTickets[0].company_name || '')
          : ''
      }));
    }
  }, [isOpen]); // Only depend on isOpen, not on mode or selectedJobTickets
  
  // Handle job tickets changes separately to avoid regenerating invoice number
  useEffect(() => {
    if (isOpen && mode === 'jobTickets' && selectedJobTickets.length > 0) {
      const lineItems = generateLineItemsFromJobTickets();
      const customerName = selectedJobTickets[0].customer_name || selectedJobTickets[0].company_name || '';
      
      setInvoiceData(prev => ({
        ...prev,
        line_items: lineItems,
        customer_name: customerName
      }));
    }
  }, [isOpen, mode, selectedJobTickets]);
  
  // Generate line items from job tickets
  const generateLineItemsFromJobTickets = () => {
    if (!selectedJobTickets || selectedJobTickets.length === 0) return [];
    
    // Validate all job tickets are from same customer
    const customers = [...new Set(selectedJobTickets.map(ticket => ticket.customer_name || ticket.company_name))];
    if (customers.length > 1) {
      toast.error('All job tickets must be from the same customer');
      return [];
    }
    
    // Generate line items with placeholder rates
    return selectedJobTickets.map(ticket => ({
      id: `jt_${ticket.id}`,
      job_ticket_id: ticket.id,
      description: `Job Ticket #${ticket.id} - ${ticket.description || 'Service Work'}`,
      rate: 100, // $100/hour placeholder for labor
      quantity: (ticket.total_work_hours || 0) + (ticket.total_travel_hours || 0) * 0.5, // Travel at 50% rate
      total: 0 // Will be calculated
    }));
  };
  
  // Calculate line item totals
  const calculateLineItemTotal = (rate, quantity) => {
    return (parseFloat(rate) || 0) * (parseFloat(quantity) || 0);
  };
  
  // Calculate invoice totals
  const totals = useMemo(() => {
    const subtotal = invoiceData.line_items.reduce((sum, item) => {
      return sum + calculateLineItemTotal(item.rate, item.quantity);
    }, 0);
    
    // Service fee calculation: $0.49 per job ticket + $0.99 invoice fee
    const jobTicketCount = invoiceData.line_items.filter(item => item.job_ticket_id).length;
    const serviceFee = (jobTicketCount * 0.49) + 0.99;
    
    const tax = 0; // Placeholder for tax calculation
    const total = subtotal + serviceFee + tax;
    
    return {
      subtotal: subtotal.toFixed(2),
      serviceFee: serviceFee.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2)
    };
  }, [invoiceData.line_items]);
  
  // Handle input changes
  const handleInputChange = (field, value) => {
    setInvoiceData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle line item changes
  const handleLineItemChange = (index, field, value) => {
    setInvoiceData(prev => ({
      ...prev,
      line_items: prev.line_items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };
  
  // Add new line item
  const addLineItem = () => {
    const newItem = {
      id: `manual_${Date.now()}`,
      description: '',
      rate: 100,
      quantity: 1,
      total: 0
    };
    
    setInvoiceData(prev => ({
      ...prev,
      line_items: [...prev.line_items, newItem]
    }));
  };
  
  // Remove line item
  const removeLineItem = (index) => {
    setInvoiceData(prev => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== index)
    }));
  };
  
  // Validate invoice data
  const validateInvoice = async () => {
    // Check required fields
    if (!invoiceData.customer_name.trim()) {
      toast.error('Customer name is required');
      return false;
    }
    
    if (!invoiceData.invoice_number.trim()) {
      toast.error('Invoice number is required');
      return false;
    }
    
    if (invoiceData.line_items.length === 0) {
      toast.error('At least one line item is required');
      return false;
    }
    
    // Check for empty line items
    const hasEmptyItems = invoiceData.line_items.some(item => 
      !item.description.trim() || item.rate <= 0 || item.quantity <= 0
    );
    
    if (hasEmptyItems) {
      toast.error('All line items must have description, rate, and quantity');
      return false;
    }
    
    // Check for duplicate invoice number
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await authenticatedFetch(`/invoices/check-duplicate/${encodeURIComponent(invoiceData.invoice_number)}`);
      // if (response.ok) {
      //   const { isDuplicate } = await response.json();
      //   if (isDuplicate) {
      //     toast.error('Duplicate invoice number, please edit and submit again');
      //     return false;
      //   }
      // }
      
      // Simulate duplicate check for demo purposes
      // In real implementation, this would be an API call
      console.log('🔍 Checking for duplicate invoice number:', invoiceData.invoice_number);
      
    } catch (error) {
      console.error('❌ Error checking invoice number:', error);
      toast.error('Unable to verify invoice number. Please try again.');
      return false;
    }
    
    return true;
  };
  
  // Save as draft
  const handleSaveAsDraft = async () => {
    if (!await validateInvoice()) return;
    
    try {
      setLoading(true);
      
      const invoicePayload = {
        ...invoiceData,
        status: 'draft',
        subtotal: parseFloat(totals.subtotal),
        service_fee: parseFloat(totals.serviceFee),
        tax: parseFloat(totals.tax),
        total: parseFloat(totals.total),
        created_on: new Date().toISOString().split('T')[0],
        created_by: user?.name || 'Manager',
        id: Date.now() // Temporary ID generation for demo
      };
      
      console.log('💾 Saving invoice as draft:', invoicePayload);
      
      // TODO: Replace with actual API call when backend is ready
      // const response = await authenticatedFetch('/invoices', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(invoicePayload)
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to save invoice');
      // }
      
      // const savedInvoice = await response.json();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Invoice saved as draft successfully');
      
      // Pass the created invoice data back to parent component
      onInvoiceCreated?.(invoicePayload);
      onClose();
      
    } catch (error) {
      console.error('❌ Error saving invoice:', error);
      toast.error('Failed to save invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Submit invoice
  const handleSubmitInvoice = async () => {
    if (!await validateInvoice()) return;
    
    try {
      setLoading(true);
      
      const invoicePayload = {
        ...invoiceData,
        status: 'submitted',
        subtotal: parseFloat(totals.subtotal),
        service_fee: parseFloat(totals.serviceFee),
        tax: parseFloat(totals.tax),
        total: parseFloat(totals.total),
        created_on: new Date().toISOString().split('T')[0],
        created_by: user?.name || 'Manager',
        id: Date.now() // Temporary ID generation for demo
      };
      
      console.log('📤 Submitting invoice:', invoicePayload);
      
      // TODO: Replace with actual API call when backend is ready
      // const response = await authenticatedFetch('/invoices', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(invoicePayload)
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to submit invoice');
      // }
      
      // const submittedInvoice = await response.json();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Invoice submitted successfully');
      
      // Pass the created invoice data back to parent component
      onInvoiceCreated?.(invoicePayload);
      onClose();
      
    } catch (error) {
      console.error('❌ Error submitting invoice:', error);
      toast.error('Failed to submit invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Download PDF placeholder
  const handleDownloadPDF = () => {
    toast.info('PDF download functionality will be implemented in the next phase');
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Invoice"
      size="2xl"
      footer={
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={loading || invoiceData.line_items.length === 0}
            className="px-4 py-2 text-sm font-medium text-gray-900 bg-gray-200 border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Download PDF
          </button>
          
          <button
            type="button"
            onClick={handleSaveAsDraft}
            disabled={loading || invoiceData.line_items.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>
          
          <button
            type="button"
            onClick={handleSubmitInvoice}
            disabled={loading || invoiceData.line_items.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? 'Submitting...' : 'Submit Invoice'}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Invoice Header */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label htmlFor="invoice_number" className="block text-sm font-medium text-gray-300 mb-2">
                  Invoice Number
                </label>
                <input
                  id="invoice_number"
                  type="text"
                  value={invoiceData.invoice_number}
                  onChange={(e) => handleInputChange('invoice_number', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Auto-generated"
                />
              </div>
              
              <div>
                <label htmlFor="invoice_date" className="block text-sm font-medium text-gray-300 mb-2">
                  Invoice Date
                </label>
                <div className="relative">
                  <input
                    id="invoice_date"
                    type="date"
                    value={invoiceData.invoice_date}
                    onChange={(e) => handleInputChange('invoice_date', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-300 mb-2">
                  Company Name
                </label>
                <input
                  id="company_name"
                  type="text"
                  value={invoiceData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your company name"
                />
              </div>
              
              <div>
                <label htmlFor="customer_name" className="block text-sm font-medium text-gray-300 mb-2">
                  Customer Name *
                </label>
                <input
                  id="customer_name"
                  type="text"
                  value={invoiceData.customer_name}
                  onChange={(e) => handleInputChange('customer_name', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Customer company name"
                  disabled={mode === 'jobTickets' && selectedJobTickets.length > 0}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Line Items Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Line Items</h3>
              <button
                type="button"
                onClick={addLineItem}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <PlusIcon className="h-4 w-4" />
                Add Item
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {invoiceData.line_items.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                      No line items added yet. Click &quot;Add Item&quot; to get started.
                    </td>
                  </tr>
                ) : (
                  invoiceData.line_items.map((item, index) => (
                    <tr key={item.id} className="bg-gray-800">
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Service description"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <CurrencyDollarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleLineItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                            className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-6 py-4 text-white font-medium">
                        ${calculateLineItemTotal(item.rate, item.quantity).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors duration-200"
                          title="Remove item"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Invoice Totals */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="max-w-md ml-auto space-y-3">
            <div className="flex justify-between text-gray-300">
              <span>Subtotal:</span>
              <span>${totals.subtotal}</span>
            </div>
            
            <div className="flex justify-between text-gray-300">
              <span>Service Fee:</span>
              <span>${totals.serviceFee}</span>
            </div>
            
            <div className="flex justify-between text-gray-300">
              <span>Tax:</span>
              <span>${totals.tax}</span>
            </div>
            
            <div className="border-t border-gray-600 pt-3">
              <div className="flex justify-between text-lg font-bold text-white">
                <span>Total:</span>
                <span>${totals.total}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Notes Section */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={invoiceData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Additional notes or terms..."
          />
        </div>
      </div>
    </Modal>
  );
};

export default CreateInvoiceModal;
