import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Modal from '../ui/Modal';
import { 
  DocumentTextIcon,
  TrashIcon,
  PlusIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  EnvelopeIcon,
  DocumentIcon,
  PaperAirplaneIcon
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
    company_name: '', // Customer's company name (who receives the invoice)
    customer_name: '', // Individual contact name at customer company
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
        company_name: mode === 'jobTickets' && selectedJobTickets.length > 0 
          ? (selectedJobTickets[0].company_name || '') // Customer's company from job ticket
          : '', // Empty for manual entry
        line_items: mode === 'jobTickets' ? generateLineItemsFromJobTickets() : [],
        customer_name: mode === 'jobTickets' && selectedJobTickets.length > 0 
          ? (selectedJobTickets[0].customer_name || '')
          : ''
      }));
    }
  }, [isOpen]); // Only depend on isOpen, not on mode or selectedJobTickets
  
  // Handle job tickets changes separately to avoid regenerating invoice number
  useEffect(() => {
    if (isOpen && mode === 'jobTickets' && selectedJobTickets.length > 0) {
      try {
        console.log('Processing job tickets for invoice:', selectedJobTickets);
        const lineItems = generateLineItemsFromJobTickets();
        console.log('Generated line items:', lineItems);
        
        const customerName = selectedJobTickets[0].customer_name || '';
        const companyName = selectedJobTickets[0].company_name || '';
        
        setInvoiceData(prev => ({
          ...prev,
          line_items: lineItems,
          customer_name: customerName,
          company_name: companyName
        }));
      } catch (error) {
        console.error('Error processing job tickets for invoice:', error);
        toast.error('Error processing job tickets. Please try again.');
        // Set empty line items on error to prevent crash
        setInvoiceData(prev => ({
          ...prev,
          line_items: [],
          customer_name: '',
          company_name: ''
        }));
      }
    }
  }, [isOpen, mode, selectedJobTickets]);
  
  // Generate line items from job tickets
  const generateLineItemsFromJobTickets = () => {
    if (!selectedJobTickets || selectedJobTickets.length === 0) return [];
    
    // Validate all job tickets are from same customer company
    const customerCompanies = [...new Set(selectedJobTickets.map(ticket => ticket.company_name).filter(Boolean))];
    if (customerCompanies.length > 1) {
      console.error('Job tickets from multiple customer companies:', customerCompanies);
      toast.error(`Cannot create invoice: Job tickets are from different customer companies (${customerCompanies.join(', ')}). Please select tickets from the same customer.`);
      return [];
    }
    
    if (customerCompanies.length === 0) {
      console.error('No customer company found in selected job tickets');
      toast.error('Cannot create invoice: Selected job tickets do not have customer company information.');
      return [];
    }
    
    // Generate line items with proper error handling and fallbacks
    return selectedJobTickets.map((ticket, index) => {
      try {
        // Safely extract values with fallbacks
        const rate = parseFloat(ticket.rate) || 100; // $100/hour default
        const workHours = parseFloat(ticket.total_work_hours) || 0;
        const travelHours = parseFloat(ticket.total_travel_hours) || 0;
        const quantity = workHours + (travelHours * 0.5); // Travel at 50% rate
        const cost = rate * quantity;
        
        return {
          id: `jt_${ticket.id}`,
          job_ticket_id: ticket.id,
          description: `Job Ticket #${ticket.id} - ${ticket.description || 'Service Work'}`,
          rate: rate,
          quantity: quantity,
          cost: cost,
          total: cost // Keep both for compatibility
        };
      } catch (error) {
        console.error(`Error processing job ticket ${ticket.id}:`, error, ticket);
        // Return a safe fallback item
        return {
          id: `jt_${ticket.id}_error`,
          job_ticket_id: ticket.id,
          description: `Job Ticket #${ticket.id} - Error processing data`,
          rate: 0,
          quantity: 0,
          cost: 0,
          total: 0
        };
      }
    });
  };
  
  // Calculate line item totals
  const calculateLineItemTotal = (rate, quantity) => {
    return (parseFloat(rate) || 0) * (parseFloat(quantity) || 0);
  };
  
  // Calculate invoice totals
  const totals = useMemo(() => {
    const subtotal = invoiceData.line_items.reduce((sum, item) => {
      // Safely calculate line item total with fallbacks
      const rate = parseFloat(item.rate) || 0;
      const quantity = parseFloat(item.quantity) || 0;
      const itemTotal = rate * quantity;
      return sum + itemTotal;
    }, 0);
    
    // Service fee calculation: $0.49 per job ticket + $0.99 invoice fee
    const jobTicketCount = invoiceData.line_items.filter(item => item.job_ticket_id).length;
    const serviceFee = (jobTicketCount * 0.49) + 0.99;
    
    const tax = 0; // Placeholder for tax calculation
    const total = subtotal + serviceFee + tax;
    
    return {
      subtotal: (subtotal || 0).toFixed(2),
      serviceFee: (serviceFee || 0).toFixed(2),
      tax: (tax || 0).toFixed(2),
      total: (total || 0).toFixed(2)
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

  // Update line item (alias for handleLineItemChange for consistency)
  const updateLineItem = (index, field, value) => {
    const numericValue = field === 'rate' || field === 'quantity' ? parseFloat(value) || 0 : value;
    setInvoiceData(prev => ({
      ...prev,
      line_items: prev.line_items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: numericValue };
          // Calculate cost and total when rate or quantity changes
          if (field === 'rate' || field === 'quantity') {
            const rate = parseFloat(updatedItem.rate) || 0;
            const quantity = parseFloat(updatedItem.quantity) || 0;
            const calculatedCost = rate * quantity;
            updatedItem.cost = calculatedCost;
            updatedItem.total = calculatedCost; // Keep both for compatibility
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };
  
  // Add new line item
  const addLineItem = () => {
    const rate = 100;
    const quantity = 1;
    const cost = rate * quantity;
    
    const newItem = {
      id: `manual_${Date.now()}`,
      description: '',
      rate: rate,
      quantity: quantity,
      cost: cost,
      total: cost // Keep both for compatibility
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
  
  // Check for duplicate invoice number
  const checkDuplicateInvoiceNumber = async (invoiceNumber) => {
    try {
      const response = await fetch(`/api/v1/invoices/check-duplicate/${encodeURIComponent(invoiceNumber)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const { isDuplicate } = await response.json();
        return isDuplicate;
      }
      return false;
    } catch (error) {
      console.error('❌ Error checking invoice number:', error);
      throw error;
    }
  };

  // Validate invoice data
  const validateInvoiceData = () => {
    const errors = [];
    
    // Validate required fields
    if (!invoiceData.invoice_number?.trim()) {
      errors.push('Invoice number is required');
    }
    
    if (!invoiceData.company_name?.trim()) {
      errors.push('Customer company name is required');
    }
    
    if (!invoiceData.line_items || invoiceData.line_items.length === 0) {
      errors.push('At least one line item is required');
    }
    
    // Validate line items
    invoiceData.line_items.forEach((item, index) => {
      if (!item.description?.trim()) {
        errors.push(`Line item ${index + 1}: Description is required`);
      }
      if (!item.rate || item.rate <= 0) {
        errors.push(`Line item ${index + 1}: Rate must be greater than 0`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Line item ${index + 1}: Quantity must be greater than 0`);
      }
    });
    
    // Validate totals
    const totalAmount = parseFloat(totals.total);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      errors.push('Invoice total must be greater than 0');
    }
    
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (status = 'Draft') => {
    // Validate invoice data
    const validationErrors = validateInvoiceData();
    if (validationErrors.length > 0) {
      toast.error(`Please fix the following errors:\n${validationErrors.join('\n')}`);
      return;
    }

    setLoading(true);
    
    try {
      const invoicePayload = {
        invoice_number: invoiceData.invoice_number,
        invoice_date: new Date(invoiceData.invoice_date).toISOString(),
        customer_name: invoiceData.customer_name,
        company_name: invoiceData.company_name, // Customer's company name
        subtotal: parseFloat(totals.subtotal),
        service_fee: parseFloat(totals.serviceFee),
        tax: parseFloat(totals.tax),
        total_amount: parseFloat(totals.total),
        line_items: invoiceData.line_items.map(item => ({
          description: item.description,
          rate: parseFloat(item.rate),
          quantity: parseFloat(item.quantity),
          amount: parseFloat(item.cost || item.total || 0)
        })),
        job_ticket_ids: invoiceData.line_items
          .filter(item => item.job_ticket_id)
          .map(item => item.job_ticket_id),
        status: status,
        created_by: user?.name || 'Unknown User',
        notes: invoiceData.notes || ''
      };

      console.log('Submitting invoice payload:', invoicePayload);

      const response = await fetch('/api/v1/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(invoicePayload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to save invoice');
      }

      const result = await response.json();
      console.log('Invoice created successfully:', result);
      
      toast.success(`Invoice ${status.toLowerCase()} successfully!`);
      onClose();
      
      // Refresh invoices list if available
      if (typeof onInvoiceCreated === 'function') {
        onInvoiceCreated(result);
      }
      
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error(`Failed to create invoice: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Save as draft
  const handleSaveAsDraft = async () => {
    await handleSubmit('Draft');
  };

  // Submit invoice and show delivery options
  const handleSubmitInvoice = async () => {
    await handleSubmit('Submitted');
    setShowDeliveryModal(true);
  };

  // State for delivery options modal
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryLoading, setDeliveryLoading] = useState(false);

  // Delivery options handlers
  const handleSendEmail = async () => {
    setDeliveryLoading(true);
    try {
      // TODO: Implement email delivery
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.info('Email delivery feature coming soon!');
    } catch (error) {
      toast.error('Failed to send email');
    } finally {
      setDeliveryLoading(false);
    }
  };

  const handleSendToQuickBooks = async () => {
    setDeliveryLoading(true);
    try {
      // TODO: Implement QuickBooks integration
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.info('QuickBooks integration coming soon!');
    } catch (error) {
      toast.error('Failed to send to QuickBooks');
    } finally {
      setDeliveryLoading(false);
    }
  };

  const handleSaveAsDraftFromDelivery = () => {
    toast.success('Invoice saved as draft');
    setShowDeliveryModal(false);
  };

  const handleCloseDeliveryModal = () => {
    setShowDeliveryModal(false);
  };
  
  return (
    <>
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
              onClick={handleSaveAsDraft}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <DocumentIcon className="h-4 w-4 mr-2" />
                  Save as Draft
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleSubmitInvoice}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  Submit Invoice
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Invoice Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-700 rounded-lg">
            <div>
              <label htmlFor="invoice_number" className="block text-sm font-medium text-gray-300 mb-2">
                Invoice Number *
              </label>
              <input
                id="invoice_number"
                type="text"
                value={invoiceData.invoice_number}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, invoice_number: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="24000001"
              />
            </div>
            
            <div>
              <label htmlFor="invoice_date" className="block text-sm font-medium text-gray-300 mb-2">
                Invoice Date *
              </label>
              <div className="relative">
                <input
                  id="invoice_date"
                  type="date"
                  value={invoiceData.invoice_date}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, invoice_date: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Company and Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="company_name" className="block text-sm font-medium text-gray-300 mb-2">
                Customer Company Name *
              </label>
              <input
                id="company_name"
                type="text"
                value={invoiceData.company_name}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, company_name: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Customer company name"
                disabled={mode === 'jobTickets' && selectedJobTickets.length > 0}
              />
            </div>
            
            <div>
              <label htmlFor="customer_name" className="block text-sm font-medium text-gray-300 mb-2">
                Customer Contact Name
              </label>
              <input
                id="customer_name"
                type="text"
                value={invoiceData.customer_name}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, customer_name: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Customer contact name"
                disabled={mode === 'jobTickets' && selectedJobTickets.length > 0}
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Line Items</h3>
              <button
                type="button"
                onClick={addLineItem}
                className="flex items-center px-3 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Item
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Rate</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Quantity</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Cost</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.line_items
                    .filter(item => item && typeof item === 'object') // Safety filter
                    .map((item, index) => {
                      // Ensure all required fields exist with safe defaults
                      const safeItem = {
                        description: item.description || '',
                        rate: parseFloat(item.rate) || 0,
                        quantity: parseFloat(item.quantity) || 0,
                        cost: item.cost ?? item.total ?? 0,
                        ...item
                      };
                      
                      return (
                    <tr key={item.id || index} className="border-b border-gray-700">
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={safeItem.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                          className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Service description"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="relative">
                          <CurrencyDollarIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="number"
                            value={safeItem.rate}
                            onChange={(e) => updateLineItem(index, 'rate', e.target.value)}
                            className="w-full pl-8 pr-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          value={safeItem.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                          className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="1"
                          step="0.01"
                          min="0"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center text-white font-medium">
                          ${((safeItem.cost ?? safeItem.total ?? 0) || 0).toFixed(2)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-700 rounded-lg p-6">
            <div className="space-y-3">
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
                <div className="flex justify-between text-white font-semibold text-lg">
                  <span>Total:</span>
                  <span>${totals.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      
      {/* Delivery Options Modal */}
      <Modal
        isOpen={showDeliveryModal}
        onClose={handleCloseDeliveryModal}
        size="md"
      >
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Delivery Options
            </h2>
            <button
              onClick={handleCloseDeliveryModal}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-gray-300 mb-6">
              Choose a delivery method for your invoice.
            </p>

            {/* Send Email Option */}
            <button
              onClick={handleSendEmail}
              disabled={deliveryLoading}
              className="w-full flex items-center justify-between p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
            >
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-6 w-6 text-blue-400" />
                <div className="text-left">
                  <div className="text-white font-medium">Send Email</div>
                  <div className="text-gray-400 text-sm">Send the invoice to the customer via email.</div>
                </div>
              </div>
              {deliveryLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>}
            </button>

            {/* Send to QuickBooks Option */}
            <button
              onClick={handleSendToQuickBooks}
              disabled={deliveryLoading}
              className="w-full flex items-center justify-between p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
            >
              <div className="flex items-center space-x-3">
                <DocumentTextIcon className="h-6 w-6 text-green-400" />
                <div className="text-left">
                  <div className="text-white font-medium">Send to QuickBooks</div>
                  <div className="text-gray-400 text-sm">Send the invoice to QuickBooks for further processing.</div>
                </div>
              </div>
              {deliveryLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400"></div>}
            </button>

            {/* Save as Draft Option */}
            <button
              onClick={handleSaveAsDraftFromDelivery}
              disabled={deliveryLoading}
              className="w-full flex items-center justify-between p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
            >
              <div className="flex items-center space-x-3">
                <DocumentIcon className="h-6 w-6 text-yellow-400" />
                <div className="text-left">
                  <div className="text-white font-medium">Save as Draft</div>
                  <div className="text-gray-400 text-sm">Save the invoice as a draft for later use.</div>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-700">
            <button
              onClick={handleCloseDeliveryModal}
              className="w-full px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CreateInvoiceModal;
