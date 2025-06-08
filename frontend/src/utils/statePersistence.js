/**
 * Enhanced state persistence utilities with encryption support
 * for secure storage of application state in localStorage/sessionStorage
 */
import React, { useState } from 'react';
import CryptoJS from 'crypto-js';

// Secret key for encryption - in production, this should be loaded from environment variables
const SECRET_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'jobticket-secure-storage-key';

/**
 * Storage types
 */
export const StorageType = {
  LOCAL: 'localStorage',
  SESSION: 'sessionStorage',
};

/**
 * Get the appropriate storage object based on type
 * @param {string} type - Storage type (LOCAL or SESSION)
 * @returns {Storage} Storage object
 */
const getStorage = (type = StorageType.LOCAL) => {
  return type === StorageType.SESSION ? sessionStorage : localStorage;
};

/**
 * Encrypt data before storing
 * @param {any} data - Data to encrypt
 * @returns {string} Encrypted data string
 */
const encrypt = (data) => {
  if (typeof data === 'undefined') return '';
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(dataString, SECRET_KEY).toString();
};

/**
 * Decrypt stored data
 * @param {string} encryptedData - Encrypted data string
 * @returns {any} Decrypted data
 */
const decrypt = (encryptedData) => {
  if (!encryptedData) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedString) {
      // If decryption failed but didn't throw, return null
      return null;
    }
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Error decrypting data:', error);
    // Clear the corrupted data from storage to prevent future errors
    return null;
  }
};

/**
 * Store data with optional encryption
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 * @param {Object} options - Storage options
 * @param {boolean} options.encrypt - Whether to encrypt the data
 * @param {string} options.storageType - Storage type (LOCAL or SESSION)
 */
export const setItem = (key, data, { encrypt: shouldEncrypt = false, storageType = StorageType.LOCAL } = {}) => {
  try {
    const storage = getStorage(storageType);
    const valueToStore = shouldEncrypt ? encrypt(data) : JSON.stringify(data);
    storage.setItem(key, valueToStore);
  } catch (error) {
    console.error(`Error storing ${key}:`, error);
  }
};

/**
 * Retrieve data with optional decryption
 * @param {string} key - Storage key
 * @param {Object} options - Storage options
 * @param {boolean} options.encrypted - Whether the data is encrypted
 * @param {string} options.storageType - Storage type (LOCAL or SESSION)
 * @param {any} options.defaultValue - Default value if key not found
 * @returns {any} Retrieved data or defaultValue if not found
 */
export const getItem = (key, { encrypted = false, storageType = StorageType.LOCAL, defaultValue = null } = {}) => {
  try {
    const storage = getStorage(storageType);
    const storedValue = storage.getItem(key);
    
    if (storedValue === null) return defaultValue;
    
    return encrypted ? decrypt(storedValue) : JSON.parse(storedValue);
  } catch (error) {
    console.error(`Error retrieving ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Remove data from storage
 * @param {string} key - Storage key
 * @param {Object} options - Storage options
 * @param {string} options.storageType - Storage type (LOCAL or SESSION)
 */
export const removeItem = (key, { storageType = StorageType.LOCAL } = {}) => {
  try {
    const storage = getStorage(storageType);
    storage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
  }
};

/**
 * Clear all data from storage
 * @param {Object} options - Storage options
 * @param {string} options.storageType - Storage type (LOCAL or SESSION)
 */
export const clearStorage = ({ storageType = StorageType.LOCAL } = {}) => {
  try {
    const storage = getStorage(storageType);
    storage.clear();
  } catch (error) {
    console.error(`Error clearing storage:`, error);
  }
};

/**
 * Check if a key exists in storage
 * @param {string} key - Storage key
 * @param {Object} options - Storage options
 * @param {string} options.storageType - Storage type (LOCAL or SESSION)
 * @returns {boolean} True if key exists, false otherwise
 */
export const hasItem = (key, { storageType = StorageType.LOCAL } = {}) => {
  try {
    const storage = getStorage(storageType);
    return storage.getItem(key) !== null;
  } catch (error) {
    console.error(`Error checking for ${key}:`, error);
    return false;
  }
};

/**
 * Enhanced hook for using localStorage/sessionStorage with React
 * @param {string} key - Storage key
 * @param {any} initialValue - Initial value if key not found
 * @param {Object} options - Storage options
 * @returns {Array} [storedValue, setValue, removeValue]
 */
export const useStorage = (key, initialValue = null, options = {}) => {
  const { 
    encrypt: shouldEncrypt = false, 
    storageType = StorageType.LOCAL 
  } = options;
  
  // Get from storage on initial render
  const [storedValue, setStoredValue] = useState(() => {
    return getItem(key, { 
      encrypted: shouldEncrypt, 
      storageType, 
      defaultValue: initialValue 
    });
  });
  
  // Return a wrapped version of useState's setter function
  const setValue = (value) => {
    try {
      // Allow value to be a function
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to storage
      setItem(key, valueToStore, { encrypt: shouldEncrypt, storageType });
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
    }
  };
  
  // Function to remove the item
  const removeValue = () => {
    try {
      setStoredValue(null);
      removeItem(key, { storageType });
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  };
  
  return [storedValue, setValue, removeValue];
};

export default {
  setItem,
  getItem,
  removeItem,
  clearStorage,
  hasItem,
  useStorage,
  StorageType
};
