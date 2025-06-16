/**
 * API Service for the JobTicketInvoice application
 * Handles all communication with the backend API
 */

// Base API URL - use environment variable if available, otherwise default to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

/**
 * Handles API errors and formats them for display
 * @param {Error} error - The error object
 * @returns {Object} Formatted error object
 */
const handleApiError = (error) => {
  console.error('API Error:', error);
  
  // If the error has a response from the server
  if (error.response) {
    const { status, data } = error.response;
    return {
      status,
      message: data.detail || 'An error occurred with the server response',
      data: data
    };
  }
  
  // Network error or other issues
  return {
    status: 500,
    message: error.message || 'Network error or server unavailable',
    data: null
  };
};

/**
 * Makes an authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {Object} data - Request data
 * @param {boolean} requiresAuth - Whether the request requires authentication
 * @returns {Promise} API response
 */
const apiRequest = async (endpoint, method = 'GET', data = null, requiresAuth = false) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  // Add authorization header if required and token exists
  if (requiresAuth) {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      throw new Error('Authentication required but no token found');
    }
  }
  
  const options = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  };
  
  try {
    const response = await fetch(url, options);
    
    // Check if the response is ok (status in the range 200-299)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { response: { status: response.status, data: errorData } };
    }
    
    // For 204 No Content responses
    if (response.status === 204) {
      return { success: true };
    }
    
    return await response.json();
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * API service object with methods for each endpoint
 */
const apiService = {
  // Auth endpoints
  auth: {
    login: (credentials) => apiRequest('/auth/login', 'POST', credentials),
    register: (userData) => apiRequest('/auth/register', 'POST', userData),
    getCurrentUser: () => apiRequest('/users/me', 'GET', null, true),
  },
  
  // Job Ticket endpoints
  jobTickets: {
    getAll: () => apiRequest('/job-tickets/', 'GET', null, true),
    getById: (id) => apiRequest(`/job-tickets/${id}`, 'GET', null, true),
    create: (ticketData) => apiRequest('/job-tickets/', 'POST', ticketData, true),
    update: (id, ticketData) => apiRequest(`/job-tickets/${id}`, 'PUT', ticketData, true),
    delete: (id) => apiRequest(`/job-tickets/${id}`, 'DELETE', null, true),
    
    // Submit a job ticket without authentication (for technicians in the field)
    submitTicket: (ticketData) => apiRequest('/job-tickets/submit', 'POST', ticketData),
  },
  
  // Invoice endpoints
  invoices: {
    getAll: () => apiRequest('/invoices', 'GET', null, true),
    getById: (id) => apiRequest(`/invoices/${id}`, 'GET', null, true),
    create: (invoiceData) => apiRequest('/invoices', 'POST', invoiceData, true),
    update: (id, invoiceData) => apiRequest(`/invoices/${id}`, 'PUT', invoiceData, true),
    delete: (id) => apiRequest(`/invoices/${id}`, 'DELETE', null, true),
  }
};

export default apiService;
