import React, { memo } from 'react';
import { MicrophoneIcon, StopIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { ArrowLeftIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { useLanguage } from '../context/LanguageContext';
import { useVoice } from '../context/VoiceContext';
import { useTicket } from '../context/TicketContext';
import JobTicketForm from './JobTicketForm';

/**
 * Voice Recorder component for voice-based job ticket creation
 */
const VoiceRecorder = () => {
  const { translations } = useLanguage();
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
    setSelectedDraftTicket 
  } = useTicket();
  
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
      
      {/* Captured state with form */}
      {voiceStatus === 'captured' && (
        <div>
          <div className="flex justify-center mb-8">
            <p className="text-xl font-medium">{translations.voiceCaptured}</p>
            {/* Restart recording button */}
            <button 
              onClick={startVoiceRecording}
              className="ml-4 bg-orange-700 hover:bg-orange-800 text-white px-4 py-1 rounded-lg transition-colors flex items-center space-x-2"
            >
              <MicrophoneIcon className="h-5 w-5" />
              <span>{translations.restartRecording}</span>
            </button>
          </div>
          
          {/* Show form with prefilled data */}
          <div className="w-full max-w-2xl mx-auto">
            <JobTicketForm />
            
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  const newDraft = saveJobTicketAsDraft({ workDescription: transcribedText });
                  setSelectedDraftTicket(newDraft);
                  setViewMode('draft');
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {translations.submit}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(VoiceRecorder);
