/**
 * Job Ticket Service
 * 
 * Enhanced service for job ticket submission with:
 * - Better error handling
 * - Progress tracking
 * - Response formatting
 * - Validation
 * - Improved error feedback for form submissions
 * 
 * This service extends the base apiService with job ticket specific functionality.
 * Updated: June 9, 2025 - Fixed job ticket submission error handling
 */

import apiService from './apiService';

/**
 * Format ticket data for API submission
 * @param {Object} ticketData - The ticket data to format
 * @returns {Object} Formatted ticket data
 */
export const formatTicketForApi = (ticketData) => {
  console.log('Original ticket data for API:', ticketData);
  
  // Remove any fields that shouldn't be sent to the API
  const {
    id,
    lastUpdated,
    ...apiData
  } = ticketData;
  
  // Map fields to match the backend JobTicketSubmit schema
  const formattedData = {
    ...apiData,
    // The backend expects 'description' instead of 'workDescription'
    description: apiData.workDescription,
    // Map drive fields to travel fields as expected by the backend
    travel_start_time: apiData.driveStartTime,
    travel_end_time: apiData.driveEndTime,
    travel_total_hours: parseFloat(apiData.driveTotalHours) || 0,
    travel_type: apiData.travelType || 'drive',
    // Ensure submitted_by is present as it's required
    submitted_by: apiData.submittedBy || 'Unknown',
    // Format work hours
    work_total_hours: parseFloat(apiData.workTotalHours) || 0,
    // Format parts used as JSON string
    parts_used: Array.isArray(apiData.parts) ? JSON.stringify(apiData.parts) : '[]',
    // Set status
    status: apiData.status || 'submitted'
  };
  
  console.log('Formatted API data for submission:', formattedData);
  return formattedData;
};

/**
 * Validate job ticket data before submission
 * @param {Object} ticketData - The ticket data to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateJobTicket = (ticketData) => {
  const errors = {};
  
  // Required fields
  if (!ticketData.date) errors.date = 'Date is required';
  if (!ticketData.companyName) errors.companyName = 'Company name is required';
  if (!ticketData.location) errors.location = 'Location is required';
  if (!ticketData.workStartTime) errors.workStartTime = 'Work start time is required';
  if (!ticketData.workEndTime) errors.workEndTime = 'Work end time is required';
  if (!ticketData.workDescription) errors.workDescription = 'Work description is required';
  
  // Validate work hours
  if (ticketData.workStartTime && ticketData.workEndTime) {
    const start = new Date(`2000-01-01T${ticketData.workStartTime}`);
    const end = new Date(`2000-01-01T${ticketData.workEndTime}`);
    
    if (end <= start) {
      errors.workEndTime = 'End time must be after start time';
    }
  }
  
  // Validate drive hours if provided
  if (ticketData.driveStartTime && ticketData.driveEndTime) {
    const start = new Date(`2000-01-01T${ticketData.driveStartTime}`);
    const end = new Date(`2000-01-01T${ticketData.driveEndTime}`);
    
    if (end <= start) {
      errors.driveEndTime = 'Drive end time must be after start time';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Submit a job ticket with progress tracking and enhanced error handling
 * @param {Object} ticketData - The ticket data to submit
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<Object>} API response with ticket number
 */
export const submitJobTicket = async (ticketData, onProgress = null) => {
  try {
    // Initial progress
    if (onProgress) onProgress(10);
    
    console.log('Submitting job ticket data:', ticketData);
    
    // Validate the ticket data
    const validation = validateJobTicket(ticketData);
    if (!validation.isValid) {
      console.error('Validation errors:', validation.errors);
      throw new Error('Validation failed: ' + Object.values(validation.errors).join(', '));
    }
    
    // Format data for API
    const apiData = formatTicketForApi(ticketData);
    
    // Ensure description field exists (backend requires it)
    if (!apiData.description && apiData.work_description) {
      apiData.description = apiData.work_description;
    }
    
    // Ensure submitted_by is present
    if (!apiData.submitted_by) {
      throw new Error('Validation failed: Customer signature (submitted by) is required');
    }
    
    if (onProgress) onProgress(30);
    
    // Submit to API
    const response = await apiService.jobTickets.submitTicket(apiData);
    if (onProgress) onProgress(80);
    
    return {
      success: true,
      ticketNumber: response.ticket_number,
      id: response.id,
      message: `Job ticket #${response.ticket_number} submitted successfully`,
      apiResponse: response
    };
  } catch (error) {
    if (onProgress) onProgress(0);
    
    // Format error response
    return {
      success: false,
      message: error.message || 'Failed to submit job ticket',
      error: error
    };
  }
};

/**
 * Prepare ticket data for saving as draft
 * @param {Object} ticketData - The ticket data to prepare
 * @returns {Object} The prepared draft data
 */
export const prepareDraftData = (ticketData) => {
  // Ensure we have the right status and metadata
  return {
    ...ticketData,
    status: 'draft',
    lastUpdated: new Date().toISOString(),
    // Ensure we have an ID
    id: ticketData.id || `draft-${Date.now()}`
  };
};

/**
 * Get a job ticket by ID
 * @param {string} id - Ticket ID
 * @returns {Promise<Object>} Ticket data
 */
export const getJobTicketById = async (id) => {
  try {
    return await apiService.jobTickets.getById(id);
  } catch (error) {
    console.error('Error fetching job ticket:', error);
    throw error;
  }
};

/**
 * Get all job tickets
 * @returns {Promise<Array>} Array of tickets
 */
export const getAllJobTickets = async () => {
  try {
    return await apiService.jobTickets.getAll();
  } catch (error) {
    console.error('Error fetching job tickets:', error);
    throw error;
  }
};

export default {
  formatTicketForApi,
  validateJobTicket,
  submitJobTicket,
  prepareDraftData,
  getJobTicketById,
  getAllJobTickets
};
