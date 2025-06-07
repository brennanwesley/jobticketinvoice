import React, { memo, useState, useEffect } from 'react';
import { MicrophoneIcon, StopIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { ArrowLeftIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { useLanguage } from '../context/LanguageContext';
import { useVoice } from '../context/VoiceContext';
import { useTicket } from '../context/TicketContext';
import JobTicketForm from './JobTicketForm';
import { parseJobTicketFromVoice } from '../utils/voiceParser';

/**
 * Voice Recorder component for voice-based job ticket creation
 */
const VoiceRecorder = () => {
  const { translations, t } = useLanguage();
  const { 
    voiceStatus, 
    transcribedText, 
    transcriptionError, 
    startVoiceRecording, 
    stopVoiceRecording, 
    cancelVoiceRecording 
  } = useVoice();
  
  const { 
    setTicketMode, 
    setViewMode, 
    saveJobTicketAsDraft, 
    setSelectedDraftTicket,
    updateFormData
  } = useTicket();
  
  // State to store parsed job ticket data
  const [parsedJobTicket, setParsedJobTicket] = useState({});
  
  // Parse transcribed text when it changes
  useEffect(() => {
    if (transcribedText && voiceStatus === 'captured') {
      const extractedData = parseJobTicketFromVoice(transcribedText);
      console.log('Parsed job ticket data:', extractedData);
      setParsedJobTicket(extractedData);
      
      // Update form data with extracted values
      Object.entries(extractedData).forEach(([field, value]) => {
        if (value) {
          updateFormData(field, value);
        }
      });
    }
  }, [transcribedText, voiceStatus, updateFormData]);
  
  // Handle back button click
  const handleBackClick = () => {
    setTicketMode(null);
    setViewMode('landing');
    cancelVoiceRecording();
  };
  
  return (
    <div>
      <button 
        onClick={handleBackClick}
        className="flex items-center text-gray-400 hover:text-white mb-6"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        {translations.back}
      </button>
      
      {/* Listening state with animated microphone */}
      {voiceStatus === 'listening' && (
        <div className="flex flex-col items-center">
          {/* Enhanced instruction text - larger and burnt orange */}
          <p className="text-2xl md:text-3xl font-bold text-orange-500 mb-8">
            {translations.speakJobTicketInfo}
          </p>
          
          <div className="relative mb-8">
            {/* Larger animated microphone with pulse effect */}
            <div className="pulse-dot">
              <MicrophoneIcon className="h-20 w-20 mx-auto mb-4 text-orange-500" />
            </div>
            
            {/* Enhanced animated sound wave circles */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10">
              <div className="h-24 w-24 rounded-full bg-orange-500 opacity-20 pulse-ring"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-orange-500 opacity-10 pulse-ring animation-delay-300"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-orange-500 opacity-5 pulse-ring animation-delay-600"></div>
            </div>
          </div>
          
          {/* Animated waveform */}
          <div className="waveform mb-8">
            <div className="waveform-bar"></div>
            <div className="waveform-bar"></div>
            <div className="waveform-bar"></div>
            <div className="waveform-bar"></div>
            <div className="waveform-bar"></div>
            <div className="waveform-bar"></div>
            <div className="waveform-bar"></div>
            <div className="waveform-bar"></div>
            <div className="waveform-bar"></div>
          </div>
          
          <p className="text-xl font-medium mb-6">{translations.listening}</p>
          
          {/* Control buttons */}
          <div className="flex flex-col space-y-4 items-center">
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={stopVoiceRecording}
                className="bg-orange-700 hover:bg-orange-800 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <StopIcon className="h-5 w-5" />
                <span>{translations.stopRecording}</span>
              </button>
              
              <button 
                onClick={cancelVoiceRecording}
                className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {translations.cancelRecording}
              </button>
            </div>
            
            {/* Additional buttons for visual only - no functionality */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <button 
                onClick={startVoiceRecording}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <MicrophoneIcon className="h-5 w-5" />
                <span>{translations.restartRecording}</span>
              </button>
              
              <button 
                onClick={stopVoiceRecording}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <PencilSquareIcon className="h-5 w-5" />
                <span>{translations.allDoneCreateJobTicket}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Processing state */}
      {voiceStatus === 'processing' && (
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <svg className="animate-spin h-10 w-10 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-xl font-medium">{translations.processingAudio}</p>
        </div>
      )}
      
      {/* Error state */}
      {voiceStatus === 'error' && (
        <div className="flex flex-col items-center">
          <div className="text-red-500 mb-4">
            <ExclamationCircleIcon className="h-16 w-16 mx-auto" />
          </div>
          <p className="text-xl font-medium text-red-500 mb-4">{transcriptionError}</p>
          <button 
            onClick={() => setTicketMode(null)}
            className="bg-orange-700 hover:bg-orange-800 text-white px-6 py-2 rounded-lg transition-colors"
          >
            {translations.goBack}
          </button>
        </div>
      )}
      
      {/* Captured state with transcription and options */}
      {voiceStatus === 'captured' && (
        <div>
          {/* Header with title and back button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{t('jobTicket.voiceCaptured')}</h2>
            <button 
              onClick={handleBackClick}
              className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>{t('jobTicket.goBack')}</span>
            </button>
          </div>
          
          {/* Prominent transcription display - the main feature requested */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border-2 border-orange-500">
            <h3 className="text-xl font-bold mb-3 text-orange-500">{t('jobTicket.rawTranscription')}</h3>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg max-h-60 overflow-y-auto">
              <p className="text-gray-900 dark:text-gray-100 text-lg">{transcribedText || t('jobTicket.noTranscriptionAvailable')}</p>
            </div>
          </div>
          
          {/* Action buttons - clearly separated and prominently displayed */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <button 
              onClick={startVoiceRecording}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 text-lg"
            >
              <MicrophoneIcon className="h-6 w-6" />
              <span>{t('jobTicket.restartRecording')}</span>
            </button>
            
            <button
              onClick={() => {
                const newDraft = saveJobTicketAsDraft({ ...parsedJobTicket, workDescription: transcribedText });
                setSelectedDraftTicket(newDraft);
                setViewMode('draft');
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 text-lg"
            >
              <PencilSquareIcon className="h-6 w-6" />
              <span>{t('jobTicket.submit')}</span>
            </button>
          </div>
          
          {/* Extracted data with collapsible section */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
            <div className="flex justify-between items-center cursor-pointer" 
                 onClick={() => {
                   const detailsEl = document.getElementById('extractedDataDetails');
                   if (detailsEl) detailsEl.open = !detailsEl.open;
                 }}>
              <h3 className="text-lg font-medium">{t('jobTicket.extractedData')}</h3>
              <span className="text-sm text-gray-400">(Click to expand/collapse)</span>
            </div>
            
            <details id="extractedDataDetails" className="mt-2">
              <summary className="sr-only">Extracted Data Details</summary>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-4 border-l-2 border-gray-700">
                {Object.entries(parsedJobTicket).map(([key, value]) => {
                  // Skip empty values and arrays
                  if (!value || (Array.isArray(value) && value.length === 0)) return null;
                  
                  // Format the key for display
                  const formattedKey = key.replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase());
                  
                  // Format the value for display
                  const formattedValue = Array.isArray(value) 
                    ? value.join(', ')
                    : value;
                  
                  return (
                    <div key={key} className="flex">
                      <span className="font-medium text-gray-400 mr-2">{formattedKey}:</span>
                      <span className="text-white">{formattedValue}</span>
                    </div>
                  );
                })}
                
                {/* Recognition quality indicator */}
                <div className="col-span-2 mt-4 flex items-center">
                  <span className="text-sm text-gray-400 mr-2">{t('jobTicket.recognitionQuality')}:</span>
                  <div className="flex space-x-1">
                    {Object.keys(parsedJobTicket).filter(key => !!parsedJobTicket[key]).length >= 5 ? (
                      <>
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="ml-2 text-green-500 text-xs">Good</span>
                      </>
                    ) : Object.keys(parsedJobTicket).filter(key => !!parsedJobTicket[key]).length >= 3 ? (
                      <>
                        <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                        <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                        <div className="h-2 w-2 rounded-full bg-gray-600"></div>
                        <span className="ml-2 text-yellow-500 text-xs">Fair</span>
                      </>
                    ) : (
                      <>
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <div className="h-2 w-2 rounded-full bg-gray-600"></div>
                        <div className="h-2 w-2 rounded-full bg-gray-600"></div>
                        <span className="ml-2 text-red-500 text-xs">Poor</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </details>
          </div>
          
          {/* Optional: Form with prefilled data (collapsed by default) */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
            <div className="flex justify-between items-center cursor-pointer"
                 onClick={() => {
                   const formEl = document.getElementById('jobTicketFormDetails');
                   if (formEl) formEl.open = !formEl.open;
                 }}>
              <h3 className="text-lg font-medium">{t('jobTicket.editForm')}</h3>
              <span className="text-sm text-gray-400">(Click to expand/collapse)</span>
            </div>
            
            <details id="jobTicketFormDetails" className="mt-2">
              <summary className="sr-only">Job Ticket Form</summary>
              <div className="mt-4">
                <JobTicketForm />
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(VoiceRecorder);
