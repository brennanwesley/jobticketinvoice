/**
 * Enhanced API Service for the JobTicketInvoice application
 * Uses middleware pattern for consistent error handling, logging, and caching
 */
import { apiMiddleware, createApiMiddleware } from '../utils/apiMiddleware';
import { getItem } from '../utils/statePersistence';

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
 * Makes an API request
 * @param {Object} params - Request parameters
 * @returns {Promise} API response
 */
const apiRequest = async (params) => {
  const { endpoint, method = 'GET', data = null, requiresAuth = false } = params;
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  // Add authorization header if required and token exists
  if (requiresAuth) {
    const token = getItem('auth_token', { encrypted: true });
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

// Create specialized middleware instances for different API endpoints
const authMiddleware = createApiMiddleware({
  enableCaching: false, // Don't cache auth requests
  retryCount: 1, // Retry once for auth requests
});

const ticketsMiddleware = createApiMiddleware({
  enableCaching: true,
  cacheDuration: 2 * 60 * 1000, // 2 minutes cache for tickets
  retryCount: 2,
});

const invoicesMiddleware = createApiMiddleware({
  enableCaching: true,
  cacheDuration: 5 * 60 * 1000, // 5 minutes cache for invoices
  retryCount: 2,
});

/**
 * Enhanced API service object with methods for each endpoint
 * Using middleware pattern for consistent handling
 */
const apiService = {
  // Auth endpoints
  auth: {
    login: (credentials) => 
      authMiddleware(apiRequest, { 
        endpoint: '/auth/login', 
        method: 'POST', 
        data: credentials 
      }),
      
    register: (userData) => 
      authMiddleware(apiRequest, { 
        endpoint: '/auth/register', 
        method: 'POST', 
        data: userData 
      }),
      
    getCurrentUser: () => 
      authMiddleware(apiRequest, { 
        endpoint: '/users/me', 
        method: 'GET', 
        requiresAuth: true 
      }),
  },
  
  // Job Ticket endpoints
  jobTickets: {
    getAll: () => 
      ticketsMiddleware(apiRequest, { 
        endpoint: '/job-tickets', 
        method: 'GET', 
        requiresAuth: true 
      }),
      
    getById: (id) => 
      ticketsMiddleware(apiRequest, { 
        endpoint: `/job-tickets/${id}`, 
        method: 'GET', 
        requiresAuth: true 
      }),
      
    create: (ticketData) => 
      ticketsMiddleware(apiRequest, { 
        endpoint: '/job-tickets', 
        method: 'POST', 
        data: ticketData, 
        requiresAuth: true 
      }),
      
    update: (id, ticketData) => 
      ticketsMiddleware(apiRequest, { 
        endpoint: `/job-tickets/${id}`, 
        method: 'PUT', 
        data: ticketData, 
        requiresAuth: true 
      }),
      
    delete: (id) => 
      ticketsMiddleware(apiRequest, { 
        endpoint: `/job-tickets/${id}`, 
        method: 'DELETE', 
        requiresAuth: true 
      }),
      
    // Submit a job ticket without authentication (for technicians in the field)
    submitTicket: (ticketData) => 
      ticketsMiddleware(apiRequest, { 
        endpoint: '/job-tickets/submit', 
        method: 'POST', 
        data: ticketData 
      }),
  },
  
  // Invoice endpoints
  invoices: {
    getAll: () => 
      invoicesMiddleware(apiRequest, { 
        endpoint: '/invoices', 
        method: 'GET', 
        requiresAuth: true 
      }),
      
    getById: (id) => 
      invoicesMiddleware(apiRequest, { 
        endpoint: `/invoices/${id}`, 
        method: 'GET', 
        requiresAuth: true 
      }),
      
    create: (invoiceData) => 
      invoicesMiddleware(apiRequest, { 
        endpoint: '/invoices', 
        method: 'POST', 
        data: invoiceData, 
        requiresAuth: true 
      }),
      
    update: (id, invoiceData) => 
      invoicesMiddleware(apiRequest, { 
        endpoint: `/invoices/${id}`, 
        method: 'PUT', 
        data: invoiceData, 
        requiresAuth: true 
      }),
      
    delete: (id) => 
      invoicesMiddleware(apiRequest, { 
        endpoint: `/invoices/${id}`, 
        method: 'DELETE', 
        requiresAuth: true 
      }),
  }
};

export default apiService;
