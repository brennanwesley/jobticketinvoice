/**
 * User Model
 * Defines the user data structure and related constants
 */

// User roles
export const USER_ROLES = {
  TECH: 'tech',
  MANAGER: 'manager'
};

// Job types for technicians
export const JOB_TYPES = {
  PUMP_SERVICE: 'pump_service_technician',
  HVAC: 'hvac_technician',
  PLUMBING: 'plumbing_technician',
  ELECTRICAL: 'electrical_technician',
  GENERAL: 'general_maintenance'
};

// Default user state
export const DEFAULT_USER = {
  id: null,
  name: '',
  email: '',
  role: null,
  job_type: null,
  company_name: null,
  logo_url: null,
  created_at: null,
  updated_at: null
};

/**
 * Validates if a user object has the required fields
 * @param {Object} user - User object to validate
 * @returns {boolean} - True if user is valid
 */
export const isValidUser = (user) => {
  if (!user) return false;
  
  // Basic validation
  if (!user.id || !user.email || !user.name || !user.role) {
    return false;
  }
  
  // Role-specific validation
  if (user.role === USER_ROLES.TECH && !user.job_type) {
    return false;
  }
  
  if (user.role === USER_ROLES.MANAGER && !user.company_name) {
    return false;
  }
  
  return true;
};

/**
 * Formats a user object for display
 * @param {Object} user - User object to format
 * @returns {Object} - Formatted user object
 */
export const formatUserForDisplay = (user) => {
  if (!user) return null;
  
  return {
    ...user,
    displayName: user.name,
    displayRole: user.role === USER_ROLES.TECH ? 'Technician' : 'Manager',
    displayJobType: user.job_type ? formatJobType(user.job_type) : null,
    displayCompany: user.company_name || null,
    hasLogo: !!user.logo_url
  };
};

/**
 * Formats a job type for display
 * @param {string} jobType - Job type to format
 * @returns {string} - Formatted job type
 */
export const formatJobType = (jobType) => {
  switch (jobType) {
    case JOB_TYPES.PUMP_SERVICE:
      return 'Pump Service Technician';
    case JOB_TYPES.HVAC:
      return 'HVAC Technician';
    case JOB_TYPES.PLUMBING:
      return 'Plumbing Technician';
    case JOB_TYPES.ELECTRICAL:
      return 'Electrical Technician';
    case JOB_TYPES.GENERAL:
      return 'General Maintenance';
    default:
      return jobType;
  }
};

export default {
  USER_ROLES,
  JOB_TYPES,
  DEFAULT_USER,
  isValidUser,
  formatUserForDisplay,
  formatJobType
};
