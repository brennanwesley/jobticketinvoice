/**
 * Job Ticket Service
 * 
 * Enhanced service for job ticket submission with:
 * - Better error handling
 * - Progress tracking
 * - Response formatting
 * - Validation
 * 
 * This service extends the base apiService with job ticket specific functionality.
 */

import apiService from './apiService';

/**
 * Format a job ticket for API submission
 * @param {Object} formData - Raw form data
 * @returns {Object} Formatted API data
 */
export const formatTicketForApi = (formData) => {
  // Map form field names to API field names
  return {
    customer_name: formData.customerName,
    company_name: formData.companyName,
    location: formData.location,
    job_date: formData.date,
    work_type: formData.workType || 'byHand',
    equipment: formData.equipment || '',
    work_start_time: formData.workStartTime,
    work_end_time: formData.workEndTime,
    work_total_hours: parseFloat(formData.workTotalHours) || 0,
    travel_start_time: formData.driveStartTime,
    travel_end_time: formData.driveEndTime,
    travel_total_hours: parseFloat(formData.driveTotalHours) || 0,
    travel_type: formData.travelType || 'drive',
    parts_used: Array.isArray(formData.parts) ? JSON.stringify(formData.parts) : '[]',
    description: formData.workDescription,
    submitted_by: formData.submittedBy,
    status: formData.status || 'submitted'
  };
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
    
    // Validate the ticket data
    const validation = validateJobTicket(ticketData);
    if (!validation.isValid) {
      throw new Error('Validation failed: ' + Object.values(validation.errors).join(', '));
    }
    
    // Format data for API
    const apiData = formatTicketForApi(ticketData);
    
    // Progress update
    if (onProgress) onProgress(30);
    
    // Submit to API
    const response = await apiService.jobTickets.submitTicket(apiData);
    
    // Progress update
    if (onProgress) onProgress(80);
    
    // Format the response
    const formattedResponse = {
      success: true,
      ticketNumber: response.ticket_number,
      id: response.id,
      message: `Job ticket #${response.ticket_number} submitted successfully`,
      apiResponse: response
    };
    
    // Final progress
    if (onProgress) onProgress(100);
    
    return formattedResponse;
  } catch (error) {
    console.error('Error submitting job ticket:', error);
    
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
