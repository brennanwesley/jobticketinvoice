import {
  FolderIcon,
  DocumentTextIcon,
  InboxIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const translations = {
  en: {
    // Job Ticket related translations
    jobTicket: {
      createNew: 'Create New Job Ticket',
      byHand: 'By Hand',
      byVoice: 'By Voice',
      createByVoice: 'Create Job Ticket by Voice'
    },
    
    // Auth and User related translations
    auth: {
      loggedInAs: 'Logged in as',
      viewProfile: 'View Profile',
      logout: 'Logout',
    },
    
    // Common translations
    common: {
      loading: 'Loading...',
      back: 'Back',
      cancel: 'Cancel',
      confirm: 'Confirm'
    }
  },
  
  es: {
    // Job Ticket related translations
    jobTicket: {
      createNew: 'Crear Nueva Boleta de Trabajo',
      byHand: 'A Mano',
      byVoice: 'Por Voz',
      createByVoice: 'Crear Boleta de Trabajo por Voz'
    },
    
    // Auth and User related translations
    auth: {
      loggedInAs: 'Conectado como',
      viewProfile: 'Ver Perfil',
      logout: 'Cerrar sesión',
    },
    
    // Common translations
    common: {
      loading: 'Cargando...',
      back: 'Atrás',
      cancel: 'Cancelar',
      confirm: 'Confirmar'
    }
  }
};

export default translations;
