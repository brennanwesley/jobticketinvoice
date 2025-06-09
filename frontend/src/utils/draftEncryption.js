/**
 * Draft Encryption Utility
 * 
 * Provides functions for encrypting and decrypting draft job tickets
 * before storing them in local storage.
 * 
 * Uses a simple encryption method for client-side security.
 * Note: This is not meant for highly sensitive data but provides
 * basic protection for locally stored drafts.
 */

// Simple encryption key (in production, this would be more secure)
const ENCRYPTION_KEY = 'jobTicket2025';

/**
 * Encrypt data before storing
 * @param {Object|Array|string} data - Data to encrypt
 * @returns {string} Encrypted string
 */
export const encryptData = (data) => {
  try {
    // Convert data to string if it's an object
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Simple XOR encryption with key
    let result = '';
    for (let i = 0; i < dataString.length; i++) {
      const charCode = dataString.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    
    // Convert to base64 for storage
    return btoa(result);
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt data from storage
 * @param {string} encryptedData - Encrypted string
 * @returns {Object|Array|string} Decrypted data
 */
export const decryptData = (encryptedData) => {
  try {
    // Convert from base64
    const base64Decoded = atob(encryptedData);
    
    // Reverse XOR encryption
    let result = '';
    for (let i = 0; i < base64Decoded.length; i++) {
      const charCode = base64Decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    
    // Try to parse as JSON, return as string if not valid JSON
    try {
      return JSON.parse(result);
    } catch (e) {
      return result;
    }
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Save encrypted data to local storage
 * @param {string} key - Storage key
 * @param {Object|Array|string} data - Data to encrypt and store
 */
export const saveEncrypted = (key, data) => {
  try {
    const encrypted = encryptData(data);
    localStorage.setItem(key, encrypted);
  } catch (error) {
    console.error('Error saving encrypted data:', error);
    throw new Error('Failed to save encrypted data');
  }
};

/**
 * Load and decrypt data from local storage
 * @param {string} key - Storage key
 * @param {Object|null} defaultValue - Default value if key not found
 * @returns {Object|Array|string|null} Decrypted data or default value
 */
export const loadEncrypted = (key, defaultValue = null) => {
  try {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return defaultValue;
    
    return decryptData(encrypted);
  } catch (error) {
    console.error('Error loading encrypted data:', error);
    throw new Error('Failed to load encrypted data');
  }
};

/**
 * Remove data from local storage
 * @param {string} key - Storage key to remove
 */
export const removeData = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing data:', error);
    throw new Error('Failed to remove data');
  }
};

export default {
  encryptData,
  decryptData,
  saveEncrypted,
  loadEncrypted,
  removeData
};
