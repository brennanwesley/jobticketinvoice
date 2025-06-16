/**
 * Authentication utilities for working with JWT tokens and user data
 */
import config from '../config';

/**
 * Get the stored authentication token from localStorage
 * @returns {string|null} The JWT token or null if not found
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Set the authentication token in localStorage
 * @param {string} token - The JWT token to store
 */
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

/**
 * Remove the authentication token from localStorage
 */
export const removeToken = () => {
  localStorage.removeItem('token');
};

/**
 * Check if the user is authenticated (has a token)
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Parse the JWT token to get the payload
 * @param {string} token - The JWT token to parse
 * @returns {Object|null} The decoded payload or null if invalid
 */
export const parseToken = (token) => {
  if (!token) return null;
  
  try {
    // JWT tokens are in format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Invalid token format: token does not have three parts');
      return null;
    }
    
    const base64Url = parts[1];
    if (!base64Url) {
      console.warn('Invalid token format: missing payload part');
      return null;
    }
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

/**
 * Check if the token is expired
 * @param {string} token - The JWT token to check
 * @returns {boolean} True if expired, false otherwise
 */
export const isTokenExpired = (token) => {
  const payload = parseToken(token);
  if (!payload) return true;
  
  // exp is in seconds, Date.now() is in milliseconds
  const currentTime = Date.now() / 1000;
  return payload.exp < currentTime;
};

/**
 * Get the user ID from the token
 * @param {string} token - The JWT token
 * @returns {string|null} The user ID or null if not found
 */
export const getUserIdFromToken = (token) => {
  const payload = parseToken(token);
  if (!payload) return null;
  
  return payload.sub;
};

/**
 * Create authorization headers with the JWT token
 * @returns {Object} Headers object with Authorization header
 */
export const getAuthHeaders = () => {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * Make an authenticated API request
 * @param {string} endpoint - The API endpoint path (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise} Fetch promise
 */
export const authenticatedFetch = async (endpoint, options = {}) => {
  const token = getToken();
  console.log('🔐 authenticatedFetch called with:', { endpoint, options });
  console.log('🎫 Token exists:', !!token);
  
  if (!token) {
    console.error('❌ No authentication token found');
    throw new Error('No authentication token found');
  }
  
  // Construct the full URL using the config
  // If the endpoint already starts with http, assume it's a full URL
  const url = endpoint.startsWith('http') ? endpoint : `${config.apiUrl}${endpoint}`;
  console.log('🌐 Full URL constructed:', url);
  console.log('⚙️ Config API URL:', config.apiUrl);
  
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };
  console.log('📋 Request headers:', headers);
  console.log('📦 Request body:', options.body);
  
  try {
    console.log(`🚀 Making API request to: ${url}`);
    const response = await fetch(url, { ...options, headers });
    console.log('📡 Raw response received:', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      headers: Object.fromEntries(response.headers.entries())
    });
    return response;
  } catch (error) {
    console.error(`💥 API request failed for ${url}:`, error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    // Return a mock response object to prevent undefined errors
    return {
      ok: false,
      status: 500,
      statusText: 'Network Error',
      json: async () => ({ error: 'API request failed', details: error.message })
    };
  }
};
