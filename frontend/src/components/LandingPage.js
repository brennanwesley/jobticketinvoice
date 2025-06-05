import React, { memo } from 'react';
import { MicrophoneIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../context/LanguageContext';
import { useTicket } from '../context/TicketContext';
import { useVoice } from '../context/VoiceContext';

/**
 * Landing Page component
 * Displays the initial screen with options to create job tickets
 */
const LandingPage = () => {
  const { t } = useLanguage();
  const { setTicketMode, setViewMode } = useTicket();
  const { startVoiceRecording } = useVoice();
  
  // Handle manual job ticket creation
  const handleManualClick = () => {
    setTicketMode('manual');
    setViewMode('form');
  };
  
  // Handle voice job ticket creation
  const handleVoiceClick = () => {
    setTicketMode('voice');
    setViewMode('form');
    startVoiceRecording();
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h2 className="text-xl font-bold text-center mb-8">{t('jobTicket.createNew')}</h2>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleManualClick}
          className="flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-4 rounded-lg transition-colors"
        >
          <PencilSquareIcon className="h-8 w-8 text-orange-500" />
          <span>{t('byHand')}</span>
        </button>
        <button
          onClick={handleVoiceClick}
          className="flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-4 rounded-lg transition-colors"
        >
          <MicrophoneIcon className="h-8 w-8 text-orange-500" />
          <span>{t('byVoice')}</span>
        </button>
      </div>
    </div>
  );
};

export default memo(LandingPage);
