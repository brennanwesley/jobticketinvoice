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
      createByVoice: 'Create Job Ticket by Voice',
      readOnlyMode: 'Read-Only Mode - This is a saved draft job ticket',
      editDraft: 'Edit Draft',
      deleteDraft: 'Delete Draft',
      saveDraft: 'Save as Draft',
      submitTicket: 'Submit Ticket',
      submitting: 'Submitting...',
      submitted: 'Submitted Tickets',
      drafts: 'Draft Tickets',
      date: 'Date',
      company: 'Company',
      workType: 'Work Type',
      description: 'Description',
      hours: 'Hours',
      actions: 'Actions'
    },
    
    // Auth and User related translations
    auth: {
      loggedInAs: 'Logged in as',
      viewProfile: 'View Profile',
      logout: 'Logout',
    },
    
    // Signup Page translations
    signup: {
      title: 'Create Your Account',
      description: 'Choose your role to get started with our platform.',
      selectRole: 'Select Your Role',
      roleDescription: 'Choose the role that best describes your position.',
      techRole: 'Field Technician',
      techDescription: 'Create job tickets in the field, track hours, and submit work details.',
      managerRole: 'Manager / Admin',
      managerDescription: 'Review job tickets, generate invoices, and manage company settings.',
      techSignup: 'Technician Registration',
      managerSignup: 'Manager Registration',
      alreadyHaveAccount: 'Already have an account?',
      loginInstead: 'Login instead'
    },
    
    // Public Landing Page translations
    publicLanding: {
      title: 'Streamline Your Job Tickets and Invoices',
      subtitle: 'The all-in-one platform for field service technicians and managers to create, track, and manage job tickets and invoices.',
      headline: 'Oilfield Job Ticketing & Invoicing Made Simple',
      subheadline: 'The fastest way for oilfield service companies to get paid.',
      signUp: 'Sign Up',
      login: 'Login',
      featuresTitle: 'Why Choose Our Platform',
      feature1Title: 'Easy Job Ticket Creation',
      feature1Description: 'Create job tickets by hand or using voice recognition. Track hours, parts, and work details effortlessly.',
      feature2Title: 'Mobile Responsive',
      feature2Description: 'Access your job tickets and invoices from any device, anywhere. Perfect for field work.',
      feature3Title: 'Secure and Reliable',
      feature3Description: 'Your data is encrypted and secure. We use industry-standard security protocols.',
      ctaTitle: 'Ready to Get Started?',
      ctaDescription: 'Join thousands of technicians and managers who are streamlining their workflow.',
      getStarted: 'Get Started Now'
    },
    
    // Login Page translations
    login: {
      title: 'Login to Your Account',
      description: 'Welcome back! Please enter your credentials to continue.',
      email: 'Email Address',
      password: 'Password',
      signIn: 'Sign In',
      noAccount: 'Don\'t have an account?',
      createAccount: 'Create an account',
      forgotPassword: 'Forgot password?'
    },
    
    // Navigation translations
    nav: {
      jobTickets: 'Job Tickets',
      drafts: 'Draft Tickets',
      submitted: 'Submitted Tickets',
      profile: 'View Profile',
      logout: 'Logout'
    },
    
    // Common translations
    common: {
      loading: 'Loading...',
      back: 'Back',
      cancel: 'Cancel',
      confirm: 'Confirm',
      loggedInAs: 'Logged in as'
    }
  },
  
  es: {
    // Job Ticket related translations
    jobTicket: {
      createNew: 'Crear Nueva Boleta de Trabajo',
      byHand: 'A Mano',
      byVoice: 'Por Voz',
      createByVoice: 'Crear Boleta de Trabajo por Voz',
      readOnlyMode: 'Modo de solo lectura - Esta es una boleta de trabajo guardada como borrador',
      editDraft: 'Editar Borrador',
      deleteDraft: 'Eliminar Borrador',
      saveDraft: 'Guardar como Borrador',
      submitTicket: 'Enviar Boleta',
      submitting: 'Enviando...',
      submitted: 'Boletas Enviadas',
      drafts: 'Boletas en Borrador',
      date: 'Fecha',
      company: 'Empresa',
      workType: 'Tipo de Trabajo',
      description: 'Descripción',
      hours: 'Horas',
      actions: 'Acciones'
    },
    
    // Auth and User related translations
    auth: {
      loggedInAs: 'Conectado como',
      viewProfile: 'Ver Perfil',
      logout: 'Cerrar sesión',
    },
    
    // Signup Page translations
    signup: {
      title: 'Crear Su Cuenta',
      description: 'Elija su rol para comenzar con nuestra plataforma.',
      selectRole: 'Seleccione Su Rol',
      roleDescription: 'Elija el rol que mejor describa su posición.',
      techRole: 'Técnico de Campo',
      techDescription: 'Cree boletas de trabajo en el campo, registre horas y envíe detalles del trabajo.',
      managerRole: 'Gerente / Administrador',
      managerDescription: 'Revise boletas de trabajo, genere facturas y administre la configuración de la empresa.',
      techSignup: 'Registro de Técnico',
      managerSignup: 'Registro de Gerente',
      alreadyHaveAccount: '¿Ya tiene una cuenta?',
      loginInstead: 'Iniciar sesión en su lugar'
    },
    
    // Public Landing Page translations
    publicLanding: {
      title: 'Optimice sus Boletas de Trabajo y Facturas',
      subtitle: 'La plataforma todo en uno para que técnicos y gerentes de servicio creen, rastreen y administren boletas de trabajo y facturas.',
      headline: 'Boletas de Trabajo y Facturación para el Campo Petrolero, Simplificado',
      subheadline: 'La forma más rápida para que las empresas de servicios petroleros reciban pagos.',
      signUp: 'Registrarse',
      login: 'Iniciar Sesión',
      featuresTitle: 'Por Qué Elegir Nuestra Plataforma',
      feature1Title: 'Creación Fácil de Boletas de Trabajo',
      feature1Description: 'Cree boletas de trabajo manualmente o mediante reconocimiento de voz. Rastree horas, piezas y detalles de trabajo sin esfuerzo.',
      feature2Title: 'Responsive para Móviles',
      feature2Description: 'Acceda a sus boletas de trabajo y facturas desde cualquier dispositivo, en cualquier lugar. Perfecto para trabajo de campo.',
      feature3Title: 'Seguro y Confiable',
      feature3Description: 'Sus datos están encriptados y seguros. Utilizamos protocolos de seguridad estándar de la industria.',
      ctaTitle: '¿Listo para Comenzar?',
      ctaDescription: 'Únase a miles de técnicos y gerentes que están optimizando su flujo de trabajo.',
      getStarted: 'Comenzar Ahora'
    },
    
    // Login Page translations
    login: {
      title: 'Iniciar Sesión en su Cuenta',
      description: '¡Bienvenido de nuevo! Por favor, ingrese sus credenciales para continuar.',
      email: 'Dirección de Correo Electrónico',
      password: 'Contraseña',
      signIn: 'Iniciar Sesión',
      noAccount: '¿No tiene una cuenta?',
      createAccount: 'Crear una cuenta',
      forgotPassword: '¿Olvidó su contraseña?'
    },
    
    // Navigation translations
    nav: {
      jobTickets: 'Boletas de Trabajo',
      drafts: 'Boletas en Borrador',
      submitted: 'Boletas Enviadas',
      profile: 'Ver Perfil',
      logout: 'Cerrar Sesión'
    },
    
    // Common translations
    common: {
      loading: 'Cargando...',
      back: 'Atrás',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      loggedInAs: 'Conectado como'
    }
  }
};

export default translations;
