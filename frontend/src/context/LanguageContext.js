import React, { createContext, useState, useContext, useCallback } from 'react';
import translations from '../translations';

// Create the context
const LanguageContext = createContext();

/**
 * Provider component for language context
 * @param {Object} props - Component props
 * @returns {React.Component} Provider component
 */
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en'); // Default to English
  
  // Get the current translations based on selected language
  const getTranslation = useCallback((key, variables = {}) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key; // Return the key as fallback
      }
    }
    
    // Handle interpolation if variables are provided
    if (typeof value === 'string' && Object.keys(variables).length > 0) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
        return variables[variableName] !== undefined ? variables[variableName] : match;
      });
    }
    
    return value;
  }, [language]);
  
  // Toggle between English and Spanish
  const toggleLanguage = useCallback(() => {
    setLanguage(prevLang => prevLang === 'en' ? 'es' : 'en');
  }, []);
  
  // Context value
  const contextValue = {
    language,
    setLanguage,
    toggleLanguage,
    t: getTranslation,
    translations: translations[language] || {}
  };
  
  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Custom hook to use the language context
 * @returns {Object} Language context value
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
};

export default LanguageContext;
