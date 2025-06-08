import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MicrophoneIcon, PencilSquareIcon, QuestionMarkCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../context/LanguageContext';
import { useTicket } from '../context/TicketContext';
import { useVoice } from '../context/VoiceContext';

/**
 * Landing Page component
 * Displays the initial screen with options to create job tickets
 * with a professional and visually appealing design
 */
const LandingPage = () => {
  const { t, language } = useLanguage();
  const { setTicketMode, setViewMode } = useTicket();
  const { startVoiceRecording } = useVoice();
  const navigate = useNavigate();
  
  // Handle manual job ticket creation
  const handleManualClick = () => {
    // Navigate to the dedicated job ticket form page instead of changing context state
    navigate('/job-ticket-form');
  };
  
  // Handle voice job ticket creation
  const handleVoiceClick = () => {
    // Navigate to the dedicated voice recorder page instead of changing context state
    navigate('/voice-recorder');
    // Voice recording will be started in the VoiceRecorderPage component
  };
  
  // Handle help button click (placeholder for future functionality)
  const handleHelpClick = () => {
    console.log('Help button clicked');
    // Future functionality will be added here
  };
  
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[80vh] px-4 py-8 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Top left decorative shape */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-orange-500 opacity-5"></div>
        
        {/* Bottom right decorative shape */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-orange-500 opacity-5"></div>
        
        {/* Center decorative element */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <DocumentTextIcon className="w-96 h-96 text-gray-700 opacity-[0.03]"/>
        </div>
        
        {/* Additional subtle shapes */}
        <div className="absolute top-1/4 right-1/4 w-20 h-20 rounded-lg rotate-45 bg-gray-600 opacity-[0.03]"></div>
        <div className="absolute bottom-1/3 left-1/3 w-16 h-16 rounded-lg rotate-12 bg-gray-600 opacity-[0.03]"></div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-3xl mx-auto bg-gray-900 bg-opacity-60 backdrop-filter backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800 p-8 sm:p-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{t('jobTicket.createNew')}</h2>
          <p className="text-gray-300 text-sm sm:text-base max-w-md mx-auto">
            {language === 'en' ? 
              'Select how you would like to create your job ticket' : 
              'Seleccione cómo desea crear su boleta de trabajo'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-stretch">
          {/* By Hand Button */}
          <button
            onClick={handleManualClick}
            className="flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-700 hover:border-orange-500/30 w-full sm:w-1/2 group"
            aria-label={t('jobTicket.byHand')}
          >
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
              <PencilSquareIcon className="h-8 w-8 text-white" />
            </div>
            <span className="text-lg font-medium">{t('jobTicket.byHand')}</span>
            <span className="text-sm text-gray-400 mt-2">
              {language === 'en' ? 'Fill out form manually' : 'Llenar formulario manualmente'}
            </span>
          </button>
          
          {/* By Voice Button */}
          <button
            onClick={handleVoiceClick}
            className="flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-700 hover:border-orange-500/30 w-full sm:w-1/2 group"
            aria-label={t('jobTicket.byVoice')}
          >
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
              <MicrophoneIcon className="h-8 w-8 text-white" />
            </div>
            <span className="text-lg font-medium">{t('jobTicket.byVoice')}</span>
            <span className="text-sm text-gray-400 mt-2">
              {language === 'en' ? 'Create using voice commands' : 'Crear usando comandos de voz'}
            </span>
          </button>
        </div>
      </div>
      
      {/* Need Help button */}
      <div className="fixed bottom-4 right-4 z-20">
        <button
          onClick={handleHelpClick}
          className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full transition-colors shadow-lg"
          aria-label={t('needHelp') || "Need Help?"}
        >
          <QuestionMarkCircleIcon className="h-5 w-5 text-white" />
          <span className="text-sm">
            {t('needHelp') || (language === 'en' ? 'Need Help?' : '¿Necesita Ayuda?')}
          </span>
        </button>
      </div>
    </div>
  );
};

export default memo(LandingPage);
