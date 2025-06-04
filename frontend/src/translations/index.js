/**
 * Main translations file that combines all translation modules
 * for the JobTicketInvoice application
 */

import { authTranslations } from './auth';
import { jobTicketTranslations } from './jobTicket';
import { commonTranslations } from './common';

/**
 * Merge all translation objects into a single object
 * This allows us to add new translation modules without modifying existing code
 */
const translations = {
  en: {
    // Include common translations
    ...commonTranslations.en.common,
    
    // Include navigation
    ...commonTranslations.en.nav,
    
    // Include public landing page
    ...commonTranslations.en.publicLanding,
    
    // Include job ticket translations
    ...jobTicketTranslations.en.jobTicket,
    
    // Include auth translations
    ...authTranslations.en
  },
  
  es: {
    // Include common translations
    ...commonTranslations.es.common,
    
    // Include navigation
    ...commonTranslations.es.nav,
    
    // Include public landing page
    ...commonTranslations.es.publicLanding,
    
    // Include job ticket translations
    ...jobTicketTranslations.es.jobTicket,
    
    // Include auth translations
    ...authTranslations.es
  }
};

export default translations;
