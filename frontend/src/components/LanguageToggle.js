import React, { memo } from 'react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Language Toggle component
 * Provides a button to switch between English and Spanish
 */
const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();
  
  // Determine which language to show in the toggle button (opposite of current)
  const targetLanguage = language === 'en' ? 'Español' : 'English';
  const instructionText = language === 'es' ? 'click for' : 'haga clic para';
  
  return (
    <button
      onClick={toggleLanguage}
      className="absolute top-0 right-0 m-4 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors flex items-center focus:outline-none focus:ring-2 focus:ring-orange-700"
      aria-label={`${instructionText} ${targetLanguage}`}
      title={`${instructionText} ${targetLanguage}`}
      tabIndex={0}
    >
      <span className="text-xs italic text-white mr-1">{instructionText}</span>
      <span>{targetLanguage}</span>
    </button>
  );
};

export default memo(LanguageToggle);
