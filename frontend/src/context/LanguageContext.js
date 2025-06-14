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
  
  // Debug: Check if translations are loaded correctly
  console.log('🔍 LanguageProvider initialized:', {
    language,
    translationsObject: !!translations,
    availableLanguages: Object.keys(translations || {}),
    enTranslations: !!translations?.en,
    esTranslations: !!translations?.es,
    managerSection: !!translations?.en?.manager,
    inviteFormSection: !!translations?.en?.manager?.inviteForm
  });
  
  // Get the current translations based on selected language
  const getTranslation = useCallback((key, variables = {}) => {
    console.log('🔍 Translation Debug:', {
      key,
      language,
      variables,
      translationsAvailable: !!translations[language],
      translationsKeys: Object.keys(translations[language] || {})
    });
    
    const keys = key.split('.');
    let value = translations[language];
    
    console.log('🔍 Starting translation lookup:', { key, keys, initialValue: !!value });
    
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      console.log(`🔍 Step ${i + 1}: Looking for key "${k}" in:`, value ? Object.keys(value) : 'null/undefined');
      
      if (value && value[k] !== undefined) {
        value = value[k];
        console.log(`🔍 Step ${i + 1}: Found value:`, typeof value === 'object' ? Object.keys(value) : value);
      } else {
        console.warn(`❌ Translation key not found: ${key} (failed at "${k}")`);
        console.log('🔍 Available keys at this level:', value ? Object.keys(value) : 'none');
        return key; // Return the key as fallback
      }
    }
    
    console.log('✅ Final translation value:', value);
    
    // Handle interpolation if variables are provided
    if (typeof value === 'string' && Object.keys(variables).length > 0) {
      const interpolated = value.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
        return variables[variableName] !== undefined ? variables[variableName] : match;
      });
      console.log('🔍 Interpolated result:', interpolated);
      return interpolated;
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
