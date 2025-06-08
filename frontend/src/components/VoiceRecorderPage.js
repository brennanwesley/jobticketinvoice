import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useVoice } from '../context/VoiceContext';
import VoiceRecorder from './voice/VoiceRecorder';

/**
 * VoiceRecorderPage component
 * Dedicated page for voice-based job ticket creation
 */
const VoiceRecorderPage = () => {
  const { t } = useLanguage();
  const { startVoiceRecording } = useVoice();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // Start voice recording when the component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      startVoiceRecording();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [startVoiceRecording]);
  
  // Handle back button click
  const handleBackClick = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with back button */}
      <div className="mb-6 flex items-center">
        <button 
          onClick={handleBackClick}
          className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={t('common.back')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">{t('jobTicket.createByVoice')}</h1>
      </div>
      
      {/* Voice recorder container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <VoiceRecorder />
      </div>
    </div>
  );
};

export default VoiceRecorderPage;
