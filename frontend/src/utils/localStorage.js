/**
 * Utility functions for managing job ticket drafts in localStorage
 */

const DRAFT_KEY = 'jobTicketDraft';
const DRAFTS_LIST_KEY = 'jobTicketDrafts';

/**
 * Save a draft job ticket to localStorage
 * @param {Object} ticketData - The job ticket data to save
 * @returns {Object} The saved ticket with generated ID
 */
export const saveDraft = (ticketData) => {
  const draft = {
    ...ticketData,
    id: ticketData.id || `draft-${Date.now()}`,
    lastUpdated: new Date().toISOString()
  };
  
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  
  // Also save to drafts list
  const existingDrafts = loadAllDrafts();
  const draftIndex = existingDrafts.findIndex(d => d.id === draft.id);
  
  if (draftIndex >= 0) {
    existingDrafts[draftIndex] = draft;
  } else {
    existingDrafts.push(draft);
  }
  
  localStorage.setItem(DRAFTS_LIST_KEY, JSON.stringify(existingDrafts));
  return draft;
};

/**
 * Load the current draft from localStorage
 * @returns {Object|null} The draft ticket data or null if not found
 */
export const loadDraft = () => {
  const draftJson = localStorage.getItem(DRAFT_KEY);
  return draftJson ? JSON.parse(draftJson) : null;
};

/**
 * Clear the current draft from localStorage
 */
export const clearDraft = () => {
  localStorage.removeItem(DRAFT_KEY);
};

/**
 * Load all saved drafts from localStorage
 * @returns {Array} Array of draft tickets
 */
export const loadAllDrafts = () => {
  const draftsJson = localStorage.getItem(DRAFTS_LIST_KEY);
  return draftsJson ? JSON.parse(draftsJson) : [];
};

/**
 * Save all drafts to localStorage
 * @param {Array} drafts - Array of draft tickets
 */
export const saveAllDrafts = (drafts) => {
  localStorage.setItem(DRAFTS_LIST_KEY, JSON.stringify(drafts));
};

/**
 * Delete a specific draft by ID
 * @param {string} draftId - ID of the draft to delete
 * @returns {Array} Updated array of drafts
 */
export const deleteDraft = (draftId) => {
  const drafts = loadAllDrafts().filter(draft => draft.id !== draftId);
  saveAllDrafts(drafts);
  
  // If current draft is the one being deleted, clear it
  const currentDraft = loadDraft();
  if (currentDraft && currentDraft.id === draftId) {
    clearDraft();
  }
  
  return drafts;
};
