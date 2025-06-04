/**
 * Utility functions for form validation
 */

/**
 * Validates that a string is not empty
 * @param {string} value - The value to check
 * @returns {boolean} True if value is not empty
 */
export const isNotEmpty = (value) => {
  return value !== undefined && value !== null && value.trim() !== '';
};

/**
 * Validates that a number is positive
 * @param {number} value - The value to check
 * @returns {boolean} True if value is a positive number
 */
export const isPositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

/**
 * Validates that a date is not in the future
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {boolean} True if date is valid and not in the future
 */
export const isValidPastOrPresentDate = (dateString) => {
  if (!dateString) return false;
  
  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return inputDate instanceof Date && !isNaN(inputDate) && inputDate <= today;
};

/**
 * Validates a time string in HH:MM format
 * @param {string} timeString - Time string in HH:MM format
 * @returns {boolean} True if time string is valid
 */
export const isValidTimeFormat = (timeString) => {
  if (!timeString) return false;
  
  const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(timeString);
};

/**
 * Calculates hours between two time strings
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @returns {number} Hours difference or null if invalid input
 */
export const calculateHoursBetween = (startTime, endTime) => {
  if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
    return null;
  }
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  let hoursDiff = endHour - startHour;
  let minutesDiff = endMinute - startMinute;
  
  if (minutesDiff < 0) {
    hoursDiff--;
    minutesDiff += 60;
  }
  
  if (hoursDiff < 0) {
    hoursDiff += 24; // Assuming work can span overnight
  }
  
  return parseFloat((hoursDiff + (minutesDiff / 60)).toFixed(2));
};

/**
 * Validates an email address format
 * @param {string} email - The email address to validate
 * @returns {boolean} True if email format is valid
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * @param {string} password - The password to validate
 * @returns {object} Validation result with isValid flag and message
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  // Additional password strength checks could be added here
  // e.g., requiring uppercase, lowercase, numbers, special characters
  
  return { isValid: true, message: 'Password is valid' };
};

/**
 * Validates that two passwords match
 * @param {string} password - The original password
 * @param {string} confirmPassword - The confirmation password
 * @returns {boolean} True if passwords match
 */
export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

/**
 * Validates a file type against allowed types
 * @param {File} file - The file to validate
 * @param {Array} allowedTypes - Array of allowed MIME types
 * @returns {boolean} True if file type is allowed
 */
export const isValidFileType = (file, allowedTypes) => {
  if (!file || !allowedTypes || !allowedTypes.length) return false;
  return allowedTypes.includes(file.type);
};

/**
 * Validates file size against maximum size
 * @param {File} file - The file to validate
 * @param {number} maxSizeInBytes - Maximum allowed size in bytes
 * @returns {boolean} True if file size is within limit
 */
export const isValidFileSize = (file, maxSizeInBytes) => {
  if (!file || !maxSizeInBytes) return false;
  return file.size <= maxSizeInBytes;
};
