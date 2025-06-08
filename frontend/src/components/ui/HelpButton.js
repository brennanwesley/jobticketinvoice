import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import Modal from './Modal';

/**
 * HelpButton - A floating help button that displays help information when clicked
 * 
 * @returns {React.ReactElement} The HelpButton component
 */
const HelpButton = () => {
  const { t, language } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      {/* Floating help button */}
      <button
        className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-3 shadow-lg flex items-center justify-center z-50 transition-all duration-200 ease-in-out"
        onClick={openModal}
        aria-label={language === 'en' ? 'Need Help?' : '¿Necesita Ayuda?'}
      >
        <QuestionMarkCircleIcon className="h-6 w-6" />
        <span className="ml-2 font-medium">
          {language === 'en' ? 'Need Help?' : '¿Necesita Ayuda?'}
        </span>
      </button>

      {/* Help modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={language === 'en' ? 'Need Help?' : '¿Necesita Ayuda?'}
      >
        <div className="space-y-4 text-gray-200">
          <p>
            {language === 'en' 
              ? 'If you need assistance with this form, please contact our support team:' 
              : 'Si necesita ayuda con este formulario, comuníquese con nuestro equipo de soporte:'}
          </p>
          
          <div className="bg-gray-800 p-4 rounded-md">
            <p className="font-medium">
              {language === 'en' ? 'Support Contact:' : 'Contacto de soporte:'}
            </p>
            <p className="mt-2">
              <span className="block">📞 (432) 640-7688</span>
              <span className="block">✉️ feedbacklooploop@gmail.com</span>
            </p>
          </div>
          
          <p>
            {language === 'en'
              ? 'Our support team is available Monday through Friday, 8:00 AM to 5:00 PM.'
              : 'Nuestro equipo de soporte está disponible de lunes a viernes, de 8:00 AM a 5:00 PM.'}
          </p>
        </div>
      </Modal>
    </>
  );
};

export default HelpButton;
