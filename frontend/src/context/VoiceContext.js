import React, { createContext, useState, useContext, useRef, useCallback, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

// Create the context
const VoiceContext = createContext();

/**
 * Provider component for voice recording context
 * @param {Object} props - Component props
 * @returns {React.Component} Provider component
 */
export const VoiceProvider = ({ children }) => {
  const { t } = useLanguage();
  
  // Voice recording states
  const [voiceStatus, setVoiceStatus] = useState(null); // null, 'listening', 'processing', 'captured', or 'error'
  const [transcribedText, setTranscribedText] = useState('');
  const [transcriptionError, setTranscriptionError] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  // Refs
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  
  // Initialize Web Speech API
  useEffect(() => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return;
    }
    
    // Create speech recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    // Configure speech recognition
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';
    
    // Clean up on unmount
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping recognition:', e);
        }
      }
      
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, []);
  
  // Reset silence timer
  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    
    silenceTimerRef.current = setTimeout(() => {
      if (isListening) {
        stopVoiceRecording();
        setTranscriptionError(t('listeningTimeout'));
        setVoiceStatus('error');
      }
    }, 15000); // 15 seconds of silence
  }, [isListening, t]);
  
  // Start voice recording
  const startVoiceRecording = useCallback(() => {
    if (!recognitionRef.current) {
      setTranscriptionError(t('browserNotSupported'));
      setVoiceStatus('error');
      return;
    }
    
    setTranscribedText('');
    setTranscriptionError('');
    setVoiceStatus('listening');
    setIsListening(true);
    
    try {
      // Set up event handlers
      recognitionRef.current.onstart = () => {
        console.log('Voice recognition started');
        resetSilenceTimer();
      };
      
      recognitionRef.current.onresult = (event) => {
        resetSilenceTimer();
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');
        setTranscribedText(transcript);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'no-speech') {
          setTranscriptionError(t('noSpeechDetected'));
        } else if (event.error === 'not-allowed') {
          setTranscriptionError(t('microphoneError'));
        } else {
          setTranscriptionError(t('transcriptionError'));
        }
        setVoiceStatus('error');
        setIsListening(false);
        
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
      };
      
      recognitionRef.current.onend = () => {
        console.log('Voice recognition ended');
        if (isListening && voiceStatus === 'listening') {
          // If we're still supposed to be listening, restart
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error('Error restarting recognition:', e);
          }
        } else {
          setIsListening(false);
          if (voiceStatus === 'listening') {
            setVoiceStatus('captured');
          }
        }
      };
      
      // Start recognition
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      setTranscriptionError(t('transcriptionError'));
      setVoiceStatus('error');
      setIsListening(false);
    }
  }, [isListening, resetSilenceTimer, t, voiceStatus]);
  
  // Stop voice recording
  const stopVoiceRecording = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        console.log('Voice recognition stopped');
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
    }
    
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    setIsListening(false);
    setVoiceStatus('processing');
    
    // Simulate processing delay
    setTimeout(() => {
      if (transcribedText) {
        setVoiceStatus('captured');
      } else {
        setTranscriptionError(t('noSpeechDetected'));
        setVoiceStatus('error');
      }
    }, 1000);
  }, [isListening, t, transcribedText]);
  
  // Cancel voice recording
  const cancelVoiceRecording = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        console.log('Voice recognition cancelled');
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
    }
    
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    setIsListening(false);
    setVoiceStatus(null);
    setTranscribedText('');
    setTranscriptionError('');
  }, [isListening]);
  
  // Context value
  const contextValue = {
    voiceStatus,
    setVoiceStatus,
    transcribedText,
    setTranscribedText,
    transcriptionError,
    setTranscriptionError,
    isListening,
    startVoiceRecording,
    stopVoiceRecording,
    cancelVoiceRecording
  };
  
  return (
    <VoiceContext.Provider value={contextValue}>
      {children}
    </VoiceContext.Provider>
  );
};

/**
 * Custom hook to use the voice context
 * @returns {Object} Voice context value
 */
export const useVoice = () => {
  const context = useContext(VoiceContext);
  
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  
  return context;
};

export default VoiceContext;
