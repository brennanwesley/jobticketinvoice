/**
 * Utility to clean up corrupted localStorage data
 * This helps resolve "Error decrypting data: Error: Malformed UTF-8 data" issues
 */

// List of known storage keys used in the application
const KNOWN_STORAGE_KEYS = [
  'jobTicketDraft',
  'jobTicketDrafts',
  'authToken',
  'user',
  'language',
  'theme',
  'viewMode',
  'formData'
];

/**
 * Clears potentially corrupted localStorage items
 * @param {boolean} clearAll - Whether to clear all storage or just attempt to fix corrupted items
 * @returns {Object} - Statistics about the cleanup operation
 */
export const cleanupStorage = (clearAll = false) => {
  const stats = {
    cleared: 0,
    skipped: 0,
    total: localStorage.length
  };

  if (clearAll) {
    // Clear everything
    localStorage.clear();
    sessionStorage.clear();
    stats.cleared = stats.total;
    console.log('Storage cleanup: All storage cleared');
    return stats;
  }

  // Selective cleanup - try to identify and fix corrupted items
  for (const key of KNOWN_STORAGE_KEYS) {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        // Try to parse it - if it fails, it's likely corrupted
        try {
          // For encrypted items, we can't easily check, so we remove them to be safe
          if (key === 'jobTicketDraft' || key === 'jobTicketDrafts') {
            localStorage.removeItem(key);
            stats.cleared++;
            console.log(`Storage cleanup: Removed potentially encrypted item ${key}`);
          } else {
            // For non-encrypted items, try to parse as JSON
            JSON.parse(item);
            stats.skipped++;
          }
        } catch (e) {
          // If parsing fails, remove the item
          localStorage.removeItem(key);
          stats.cleared++;
          console.log(`Storage cleanup: Removed corrupted item ${key}`);
        }
      }
    } catch (e) {
      console.error(`Storage cleanup: Error processing ${key}`, e);
    }
  }

  console.log(`Storage cleanup complete: Cleared ${stats.cleared}, Skipped ${stats.skipped}`);
  return stats;
};

/**
 * Runs on application initialization to clean up storage
 * @param {boolean} force - Whether to force cleanup even if no errors are detected
 */
export const initializeStorageCleanup = (force = false) => {
  const hasErrors = checkForStorageErrors();
  
  if (hasErrors || force) {
    console.log('Storage errors detected, performing cleanup');
    return cleanupStorage(true); // Clear all storage if errors are detected
  }
  
  return { cleared: 0, skipped: 0, total: localStorage.length };
};

/**
 * Checks for signs of storage errors in console
 * @returns {boolean} - Whether errors were detected
 */
const checkForStorageErrors = () => {
  // This is a heuristic - we can't directly access console errors
  // But we can check if our own error handling has logged issues
  try {
    // Check if we've previously marked storage as corrupted
    return localStorage.getItem('storageCorrupted') === 'true';
  } catch (e) {
    // If we can't access localStorage, there's definitely a problem
    return true;
  }
};

export default {
  cleanupStorage,
  initializeStorageCleanup
};
