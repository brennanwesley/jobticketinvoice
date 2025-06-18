/**
 * Invoice Validation Utilities
 * Provides reusable validation logic for invoice creation
 */

/**
 * Validates that all job tickets are from the same customer company
 * @param {Array} jobTickets - Array of job ticket objects
 * @returns {Object} Validation result with status and details
 */
export const validateSameCustomerCompany = (jobTickets) => {
  if (!jobTickets || jobTickets.length === 0) {
    return {
      isValid: false,
      error: 'NO_TICKETS',
      message: 'No job tickets selected',
      customerCompanies: []
    };
  }

  // Extract unique customer company names (filter out null/undefined)
  const customerCompanies = [...new Set(
    jobTickets
      .map(ticket => ticket.company_name)
      .filter(company => company && company.trim())
  )];

  // Check if we have any customer companies
  if (customerCompanies.length === 0) {
    return {
      isValid: false,
      error: 'NO_CUSTOMER_INFO',
      message: 'Selected job tickets do not have customer company information',
      customerCompanies: []
    };
  }

  // Check if all tickets are from the same customer company
  if (customerCompanies.length > 1) {
    return {
      isValid: false,
      error: 'MULTIPLE_CUSTOMERS',
      message: `Job tickets are from different customer companies: ${customerCompanies.join(', ')}`,
      customerCompanies: customerCompanies
    };
  }

  // All validation passed
  return {
    isValid: true,
    error: null,
    message: 'All job tickets are from the same customer company',
    customerCompanies: customerCompanies,
    customerCompany: customerCompanies[0]
  };
};

/**
 * Groups job tickets by customer company
 * @param {Array} jobTickets - Array of job ticket objects
 * @returns {Object} Object with customer companies as keys and arrays of tickets as values
 */
export const groupTicketsByCustomerCompany = (jobTickets) => {
  if (!jobTickets || jobTickets.length === 0) {
    return {};
  }

  return jobTickets.reduce((groups, ticket) => {
    const company = ticket.company_name || 'Unknown Company';
    if (!groups[company]) {
      groups[company] = [];
    }
    groups[company].push(ticket);
    return groups;
  }, {});
};

/**
 * Filters job tickets to only include those from a specific customer company
 * @param {Array} jobTickets - Array of job ticket objects
 * @param {string} customerCompany - Target customer company name
 * @returns {Array} Filtered array of job tickets
 */
export const filterTicketsByCustomerCompany = (jobTickets, customerCompany) => {
  if (!jobTickets || jobTickets.length === 0 || !customerCompany) {
    return [];
  }

  return jobTickets.filter(ticket => 
    ticket.company_name === customerCompany
  );
};

/**
 * Gets validation error message for UI display
 * @param {string} errorCode - Error code from validation result
 * @param {Array} customerCompanies - Array of customer company names
 * @returns {string} User-friendly error message
 */
export const getValidationErrorMessage = (errorCode, customerCompanies = []) => {
  switch (errorCode) {
    case 'NO_TICKETS':
      return 'Please select at least one job ticket to create an invoice.';
    
    case 'NO_CUSTOMER_INFO':
      return 'The selected job tickets do not have customer company information. Please check the ticket details.';
    
    case 'MULTIPLE_CUSTOMERS':
      return `You can only create an invoice using job tickets from the same customer. The selected tickets are from different companies: ${customerCompanies.join(', ')}. Please revise your selection.`;
    
    default:
      return 'Unable to validate job tickets for invoice creation. Please try again.';
  }
};
