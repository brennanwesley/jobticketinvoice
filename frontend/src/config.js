/**
 * Application configuration
 * 
 * This file contains environment-specific configuration settings
 * such as API URLs for different environments.
 */

// API URLs for different environments
const config = {
  development: {
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1'
  },
  production: {
    // In production, API calls are relative to the current domain
    // This works when backend and frontend are deployed together
    apiUrl: process.env.REACT_APP_API_URL || '/api'
  }
};

// Determine current environment
const env = process.env.NODE_ENV || 'development';

// Export configuration for current environment
export default {
  apiUrl: config[env].apiUrl
};
