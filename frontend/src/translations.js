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
      companyName: 'Company Name',
      customer: 'Customer',
      customerName: 'Customer Name',
      location: 'Location',
      workType: 'Work Type',
      description: 'Description',
      workDescription: 'Work Description',
      hours: 'Hours',
      actions: 'Actions',
      equipment: 'Equipment Serviced',
      equipmentPlaceholder: 'e.g., Pump Model XYZ, Serial #12345',
      partsUsed: 'Parts Used',
      noParts: 'No parts added yet',
      noItems: 'No items added yet',
      noLoads: 'No loads added yet',
      addPart: 'Add Part',
      workStartTime: 'Work Start Time',
      workEndTime: 'Work End Time',
      workTotalTime: 'Work Total Time',
      travelStartTime: 'Travel Start Time',
      travelEndTime: 'Travel End Time',
      travelTotalTime: 'Travel Total Time',
      customJobType: 'Job Type',
      customJobTypePlaceholder: 'Enter your job type',
      materialsEquipmentUsed: 'Materials/Equipment Used',
      itemNamePlaceholder: 'Enter item name',
      qty: 'Qty',
      additionalNotes: 'Additional Notes',
      additionalNotesPlaceholder: 'Enter any additional notes or observations',
      vehicleId: 'Vehicle ID',
      vehicleType: 'Vehicle Type',
      startingMileage: 'Starting Mileage',
      endingMileage: 'Ending Mileage',
      totalMileage: 'Total Mileage',
      loadDetails: 'Load Details',
      loadDescription: 'Load Description',
      loadDescriptionPlaceholder: 'Describe the load',
      weight: 'Weight',
      destination: 'Destination',
      destinationPlaceholder: 'Delivery location',
      vehicleInspection: 'Vehicle Inspection',
      fuelChecked: 'Fuel Level Checked',
      tiresChecked: 'Tires Checked',
      oilChecked: 'Oil Level Checked',
      lightsChecked: 'Lights Checked',
      quantity: 'Quantity',
      submittedBy: 'Submitted By',
      submitError: 'There was an error submitting your job ticket. Please try again.'
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
      managerTitle: 'Create Manager Account',
      managerOnlyDescription: 'Create your company account and start managing your team.',
      technicianNote: 'Only company managers may create new accounts. Technicians will be onboarded by their manager.',
      selectRole: 'Select Your Role',
      roleDescription: 'Choose the role that best describes your position.',
      techRole: 'Field Technician',
      techDescription: 'Create job tickets in the field, track hours, and submit work details.',
      managerRole: 'Manager / Admin',
      managerDescription: 'Review job tickets, generate invoices, and manage company settings.',
      techSignup: 'Technician Registration',
      managerSignup: 'Manager Registration',
      alreadyHaveAccount: 'Already have an account?',
      loginInstead: 'Login instead',
      // Form fields
      name: 'Full Name',
      email: 'Email Address',
      jobType: 'Job Type',
      selectJobType: 'Select your job type',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      company: 'Company Name',
      phone: 'Phone Number',
      address: 'Address',
      submit: 'Create Account',
      createAccount: 'Create Account',
      termsAgree: 'I agree to the Terms and Conditions'
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
      loggedInAs: 'Logged in as',
      select: 'Select an option',
      add: 'Add',
      remove: 'Remove',
      success: 'Success',
      error: 'Error'
    },
    
    // Job Types translations
    jobTypes: {
      pumpTech: 'Pump Service Technician',
      roustabout: 'Roustabout',
      electrician: 'Electrician',
      pipeline: 'Pipeline Operator',
      truckDriver: 'Truck Driver',
      other: 'Other'
    },
    
    // Work Types translations
    workTypes: {
      maintenance: 'Maintenance',
      repair: 'Repair',
      installation: 'Installation',
      inspection: 'Inspection',
      delivery: 'Delivery',
      pickup: 'Pickup',
      transport: 'Transport',
      equipment: 'Equipment Transport',
      supplies: 'Supplies Transport',
      other: 'Other'
    },
    
    // Parts translations
    parts: {
      title: 'Parts',
      lubricant: 'Lubricant',
      pumpSeal: 'Pump Seal',
      thrustChamber: 'Thrust Chamber',
      vfdBreaker: 'VFD Breaker',
      serviceKit: 'Service Kit',
      other: 'Other Part'
    },
    
    // Validation messages
    validation: {
      nameRequired: 'Name is required',
      emailRequired: 'Email is required',
      emailInvalid: 'Please enter a valid email address',
      passwordRequired: 'Password is required',
      passwordLength: 'Password must be at least 8 characters',
      passwordsDoNotMatch: 'Passwords do not match',
      jobTypeRequired: 'Please select a job type',
      companyRequired: 'Company name is required',
      phoneRequired: 'Phone number is required',
      addressRequired: 'Address is required'
    },
    
    // Error messages
    errors: {
      registrationFailed: 'Registration failed. Please try again.',
      fetchFailed: 'Failed to fetch data. Please check your connection.',
      serverError: 'Server error. Please try again later.',
      invalidCredentials: 'Invalid email or password',
      emailInUse: 'This email is already in use'
    },
    
    // Manager Dashboard translations
    manager: {
      dashboard: 'Manager Dashboard',
      overview: 'Overview',
      technicians: 'Technicians',
      company: 'Company',
      settings: 'Settings',
      
      // Technician Management
      techManagement: {
        title: 'Technician Management',
        subtitle: 'Manage your team of technicians',
        inviteTechnician: 'Invite Technician',
        totalTechnicians: 'Total Technicians',
        activeTechnicians: 'Active Technicians',
        pendingInvitations: 'Pending Invitations',
        deactivatedTechnicians: 'Deactivated Technicians',
        
        // Status filters
        filterAll: 'All',
        filterActive: 'Active',
        filterPending: 'Pending',
        filterDeactivated: 'Deactivated',
        
        // Table headers
        name: 'Name',
        email: 'Email',
        jobType: 'Job Type',
        status: 'Status',
        invitedDate: 'Invited Date',
        lastActive: 'Last Active',
        actions: 'Actions',
        
        // Status labels
        statusActive: 'Active',
        statusPending: 'Pending',
        statusDeactivated: 'Deactivated',
        statusInvited: 'Invited',
        
        // Actions
        activate: 'Activate',
        deactivate: 'Deactivate',
        reinvite: 'Re-invite',
        remove: 'Remove',
        viewProfile: 'View Profile',
        editProfile: 'Edit Profile',
        
        // Batch actions
        batchActions: 'Batch Actions',
        selectAll: 'Select All',
        selectedCount: '{{count}} selected',
        batchActivate: 'Activate Selected',
        batchDeactivate: 'Deactivate Selected',
        batchRemove: 'Remove Selected',
        
        // Invite technician form
        inviteForm: {
          title: 'Invite New Technician',
          subtitle: 'Send an invitation to join your team',
          firstName: 'First Name',
          lastName: 'Last Name',
          email: 'Email Address',
          jobType: 'Job Type',
          personalMessage: 'Personal Message (Optional)',
          personalMessagePlaceholder: 'Add a personal message to the invitation...',
          sendInvitation: 'Send Invitation',
          cancel: 'Cancel',
          invitationSent: 'Invitation sent successfully!',
          invitationError: 'Failed to send invitation. Please try again.'
        },
        
        // Confirmation dialogs
        confirmations: {
          activate: {
            title: 'Activate Technician',
            message: 'Are you sure you want to activate {{name}}? They will regain access to the system.',
            confirm: 'Activate',
            cancel: 'Cancel'
          },
          deactivate: {
            title: 'Deactivate Technician',
            message: 'Are you sure you want to deactivate {{name}}? They will lose access to the system but their data will be preserved.',
            confirm: 'Deactivate',
            cancel: 'Cancel'
          },
          remove: {
            title: 'Remove Technician',
            message: 'Are you sure you want to permanently remove {{name}}? This action cannot be undone and all their data will be deleted.',
            confirm: 'Remove',
            cancel: 'Cancel',
            warning: 'This action is permanent and cannot be undone.'
          },
          batchActivate: {
            title: 'Activate Technicians',
            message: 'Are you sure you want to activate {{count}} technicians?',
            confirm: 'Activate All',
            cancel: 'Cancel'
          },
          batchDeactivate: {
            title: 'Deactivate Technicians',
            message: 'Are you sure you want to deactivate {{count}} technicians?',
            confirm: 'Deactivate All',
            cancel: 'Cancel'
          },
          batchRemove: {
            title: 'Remove Technicians',
            message: 'Are you sure you want to permanently remove {{count}} technicians? This action cannot be undone.',
            confirm: 'Remove All',
            cancel: 'Cancel',
            warning: 'This action is permanent and cannot be undone.'
          }
        },
        
        // Messages and notifications
        messages: {
          technicianActivated: 'Technician activated successfully',
          technicianDeactivated: 'Technician deactivated successfully',
          technicianRemoved: 'Technician removed successfully',
          techniciansActivated: '{{count}} technicians activated successfully',
          techniciansDeactivated: '{{count}} technicians deactivated successfully',
          techniciansRemoved: '{{count}} technicians removed successfully',
          invitationResent: 'Invitation resent successfully',
          noTechniciansFound: 'No technicians found',
          loadingTechnicians: 'Loading technicians...',
          errorLoadingTechnicians: 'Error loading technicians. Please try again.'
        }
      },
      
      // Company Profile Management
      companyProfile: {
        title: 'Company Profile',
        subtitle: 'Manage your company information',
        basicInfo: 'Basic Information',
        contactInfo: 'Contact Information',
        branding: 'Branding',
        
        // Form fields
        companyName: 'Company Name',
        companyNamePlaceholder: 'Enter your company name',
        description: 'Description',
        descriptionPlaceholder: 'Brief description of your company...',
        website: 'Website',
        websitePlaceholder: 'https://www.yourcompany.com',
        
        // Contact information
        primaryPhone: 'Primary Phone',
        secondaryPhone: 'Secondary Phone (Optional)',
        email: 'Company Email',
        
        // Address
        address: 'Address',
        addressLine1: 'Address Line 1',
        addressLine2: 'Address Line 2 (Optional)',
        city: 'City',
        state: 'State/Province',
        zipCode: 'ZIP/Postal Code',
        country: 'Country',
        
        // Logo upload
        logo: 'Company Logo',
        logoUpload: 'Upload Logo',
        logoRemove: 'Remove Logo',
        logoPreview: 'Logo Preview',
        logoRequirements: 'Recommended: 200x200px, max 2MB, PNG or JPG format',
        logoUploading: 'Uploading...',
        logoUploadSuccess: 'Logo uploaded successfully',
        logoUploadError: 'Failed to upload logo. Please try again.',
        logoRemoveConfirm: 'Are you sure you want to remove the company logo?',
        
        // Actions
        save: 'Save Changes',
        cancel: 'Cancel',
        saving: 'Saving...',
        saved: 'Changes saved successfully',
        saveError: 'Failed to save changes. Please try again.',
        
        // Validation
        validation: {
          companyNameRequired: 'Company name is required',
          companyNameLength: 'Company name must be at least 2 characters',
          emailInvalid: 'Please enter a valid email address',
          phoneInvalid: 'Please enter a valid phone number',
          websiteInvalid: 'Please enter a valid website URL',
          logoTooLarge: 'Logo file is too large. Maximum size is 2MB.',
          logoInvalidFormat: 'Invalid logo format. Please use PNG or JPG.'
        }
      },
      
      // Help and onboarding
      help: {
        techManagementHelp: 'Manage your team of technicians. You can invite new technicians, activate or deactivate existing ones, and track their status.',
        companyProfileHelp: 'Keep your company information up to date. This information will be displayed on job tickets and invoices.',
        invitationHelp: 'Technicians will receive an email invitation with instructions to create their account and join your team.',
        batchActionsHelp: 'Select multiple technicians to perform actions on them all at once.',
        auditTrailHelp: 'All changes to technician status and company profile are logged for audit purposes.'
      }
    },
    
    // Audit and logging
    audit: {
      title: 'Audit Log',
      subtitle: 'Track all changes and activities',
      timestamp: 'Timestamp',
      user: 'User',
      action: 'Action',
      details: 'Details',
      category: 'Category',
      
      // Categories
      categories: {
        technician: 'Technician Management',
        company: 'Company Profile',
        security: 'Security',
        system: 'System'
      },
      
      // Actions
      actions: {
        technicianInvited: 'Technician invited',
        technicianActivated: 'Technician activated',
        technicianDeactivated: 'Technician deactivated',
        technicianRemoved: 'Technician removed',
        companyUpdated: 'Company profile updated',
        logoUploaded: 'Company logo uploaded',
        logoRemoved: 'Company logo removed'
      }
    },
    
    // Audit Logs
    auditLogs: {
      title: 'Audit Logs',
      subtitle: 'View system activity and user actions',
      exportLogs: 'Export Logs',
      exporting: 'Exporting...',
      clearFilters: 'Clear Filters',
      totalLogs: 'Total logs: {count}',
      perPage: 'per page',
      showingResults: 'Showing {start}-{end} of {total} results',
      
      // Table headers
      timestamp: 'Timestamp',
      category: 'Category',
      action: 'Action',
      user: 'User',
      description: 'Description',
      ipAddress: 'IP Address',
      
      // Filters
      filters: {
        category: 'Category',
        action: 'Action',
        user: 'User',
        dateFrom: 'From Date',
        dateTo: 'To Date',
        searchPlaceholder: 'Search logs...'
      },
      
      // Categories
      categories: {
        security: 'Security',
        user: 'User',
        company: 'Company',
        technician: 'Technician',
        system: 'System',
        jobticket: 'Job Ticket',
        invoice: 'Invoice'
      },
      
      // Messages
      messages: {
        loadingLogs: 'Loading audit logs...',
        noLogsFound: 'No audit logs found',
        exportSuccess: 'Audit logs exported successfully',
        exportError: 'Failed to export audit logs'
      }
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
      companyName: 'Nombre de la Empresa',
      customer: 'Cliente',
      customerName: 'Nombre del Cliente',
      location: 'Ubicación',
      workType: 'Tipo de Trabajo',
      description: 'Descripción',
      workDescription: 'Descripción del Trabajo',
      hours: 'Horas',
      actions: 'Acciones',
      equipment: 'Equipo Reparado',
      equipmentPlaceholder: 'ej., Bomba Modelo XYZ, Serie #12345',
      partsUsed: 'Piezas Utilizadas',
      noParts: 'No hay piezas agregadas todavía',
      noItems: 'No hay artículos agregados todavía',
      noLoads: 'No hay cargas agregadas todavía',
      addPart: 'Agregar Pieza',
      workStartTime: 'Hora de Inicio del Trabajo',
      workEndTime: 'Hora de Finalización del Trabajo',
      workTotalTime: 'Tiempo Total de Trabajo',
      travelStartTime: 'Hora de Inicio del Viaje',
      travelEndTime: 'Hora de Finalización del Viaje',
      travelTotalTime: 'Tiempo Total de Viaje',
      customJobType: 'Tipo de Trabajo',
      customJobTypePlaceholder: 'Ingrese su tipo de trabajo',
      materialsEquipmentUsed: 'Materiales/Equipos Utilizados',
      itemNamePlaceholder: 'Ingrese nombre del artículo',
      qty: 'Cant',
      additionalNotes: 'Notas Adicionales',
      additionalNotesPlaceholder: 'Ingrese notas o observaciones adicionales',
      vehicleId: 'ID del Vehículo',
      vehicleType: 'Tipo de Vehículo',
      startingMileage: 'Kilometraje Inicial',
      endingMileage: 'Kilometraje Final',
      totalMileage: 'Kilometraje Total',
      loadDetails: 'Detalles de la Carga',
      loadDescription: 'Descripción de la Carga',
      loadDescriptionPlaceholder: 'Describa la carga',
      weight: 'Peso',
      destination: 'Destino',
      destinationPlaceholder: 'Lugar de entrega',
      vehicleInspection: 'Inspección del Vehículo',
      fuelChecked: 'Nivel de Combustible Verificado',
      tiresChecked: 'Neumáticos Verificados',
      oilChecked: 'Nivel de Aceite Verificado',
      lightsChecked: 'Luces Verificadas',
      quantity: 'Cantidad',
      submittedBy: 'Enviado Por',
      submitError: 'Hubo un error al enviar su boleta de trabajo. Por favor, inténtelo de nuevo.'
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
      managerTitle: 'Crear Cuenta de Gerente',
      managerOnlyDescription: 'Cree su cuenta de empresa y comience a gestionar su equipo.',
      technicianNote: 'Solo los gerentes de empresa pueden crear nuevas cuentas. Los técnicos serán incorporados por su gerente.',
      selectRole: 'Seleccione Su Rol',
      roleDescription: 'Elija el rol que mejor describa su posición.',
      techRole: 'Técnico de Campo',
      techDescription: 'Cree boletas de trabajo en el campo, registre horas y envíe detalles del trabajo.',
      managerRole: 'Gerente / Administrador',
      managerDescription: 'Revise boletas de trabajo, genere facturas y administre la configuración de la empresa.',
      techSignup: 'Registro de Técnico',
      managerSignup: 'Registro de Gerente',
      alreadyHaveAccount: '¿Ya tiene una cuenta?',
      loginInstead: 'Iniciar sesión en su lugar',
      // Form fields
      name: 'Nombre Completo',
      email: 'Correo Electrónico',
      jobType: 'Tipo de Trabajo',
      selectJobType: 'Seleccione su tipo de trabajo',
      password: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      company: 'Nombre de la Empresa',
      phone: 'Número de Teléfono',
      address: 'Dirección',
      submit: 'Crear Cuenta',
      createAccount: 'Crear Cuenta',
      termsAgree: 'Acepto los Términos y Condiciones'
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
      loggedInAs: 'Conectado como',
      select: 'Seleccione una opción',
      add: 'Agregar',
      remove: 'Eliminar',
      success: 'Éxito',
      error: 'Error'
    },
    
    // Job Types translations
    jobTypes: {
      pumpTech: 'Técnico de Servicio de Bombas',
      roustabout: 'Obrero Petrolero',
      electrician: 'Electricista',
      pipeline: 'Operador de Oleoducto',
      truckDriver: 'Conductor de Camión',
      other: 'Otro'
    },
    
    // Work Types translations
    workTypes: {
      maintenance: 'Mantenimiento',
      repair: 'Reparación',
      installation: 'Instalación',
      inspection: 'Inspección',
      delivery: 'Entrega',
      pickup: 'Recogida',
      transport: 'Transporte',
      equipment: 'Transporte de Equipo',
      supplies: 'Transporte de Suministros',
      other: 'Otro'
    },
    
    // Parts translations
    parts: {
      title: 'Piezas',
      lubricant: 'Lubricante',
      pumpSeal: 'Sello de Bomba',
      thrustChamber: 'Cámara de Empuje',
      vfdBreaker: 'Interruptor VFD',
      serviceKit: 'Kit de Servicio',
      other: 'Otra Pieza'
    },
    
    // Validation messages
    validation: {
      nameRequired: 'El nombre es obligatorio',
      emailRequired: 'El correo electrónico es obligatorio',
      emailInvalid: 'Por favor, introduzca una dirección de correo electrónico válida',
      passwordRequired: 'La contraseña es obligatoria',
      passwordLength: 'La contraseña debe tener al menos 8 caracteres',
      passwordsDoNotMatch: 'Las contraseñas no coinciden',
      jobTypeRequired: 'Por favor, seleccione un tipo de trabajo',
      companyRequired: 'El nombre de la empresa es obligatorio',
      phoneRequired: 'El número de teléfono es obligatorio',
      addressRequired: 'La dirección es obligatoria'
    },
    
    // Error messages
    errors: {
      registrationFailed: 'El registro falló. Por favor, inténtelo de nuevo.',
      fetchFailed: 'Error al obtener datos. Por favor, compruebe su conexión.',
      serverError: 'Error del servidor. Por favor, inténtelo más tarde.',
      invalidCredentials: 'Correo electrónico o contraseña inválidos',
      emailInUse: 'Este correo electrónico ya está en uso'
    },
    
    // Manager Dashboard translations
    manager: {
      dashboard: 'Panel de Gerente',
      overview: 'Resumen',
      technicians: 'Técnicos',
      company: 'Empresa',
      settings: 'Configuración',
      
      // Technician Management
      techManagement: {
        title: 'Gestión de Técnicos',
        subtitle: 'Administra tu equipo de técnicos',
        inviteTechnician: 'Invitar Técnico',
        totalTechnicians: 'Total de Técnicos',
        activeTechnicians: 'Técnicos Activos',
        pendingInvitations: 'Invitaciones Pendientes',
        deactivatedTechnicians: 'Técnicos Desactivados',
        
        // Status filters
        filterAll: 'Todos',
        filterActive: 'Activos',
        filterPending: 'Pendientes',
        filterDeactivated: 'Desactivados',
        
        // Table headers
        name: 'Nombre',
        email: 'Correo Electrónico',
        jobType: 'Tipo de Trabajo',
        status: 'Estado',
        invitedDate: 'Fecha de Invitación',
        lastActive: 'Última Actividad',
        actions: 'Acciones',
        
        // Status labels
        statusActive: 'Activo',
        statusPending: 'Pendiente',
        statusDeactivated: 'Desactivado',
        statusInvited: 'Invitado',
        
        // Actions
        activate: 'Activar',
        deactivate: 'Desactivar',
        reinvite: 'Re-invitar',
        remove: 'Eliminar',
        viewProfile: 'Ver Perfil',
        editProfile: 'Editar Perfil',
        
        // Batch actions
        batchActions: 'Acciones en Lote',
        selectAll: 'Seleccionar Todo',
        selectedCount: '{{count}} seleccionados',
        batchActivate: 'Activar Seleccionados',
        batchDeactivate: 'Desactivar Seleccionados',
        batchRemove: 'Eliminar Seleccionados',
        
        // Invite technician form
        inviteForm: {
          title: 'Invitar Nuevo Técnico',
          subtitle: 'Envía una invitación para unirse a tu equipo',
          firstName: 'Nombre',
          lastName: 'Apellido',
          email: 'Correo Electrónico',
          jobType: 'Tipo de Trabajo',
          personalMessage: 'Mensaje Personal (Opcional)',
          personalMessagePlaceholder: 'Agrega un mensaje personal a la invitación...',
          sendInvitation: 'Enviar Invitación',
          cancel: 'Cancelar',
          invitationSent: '¡Invitación enviada exitosamente!',
          invitationError: 'Error al enviar la invitación. Por favor, inténtelo de nuevo.'
        },
        
        // Confirmation dialogs
        confirmations: {
          activate: {
            title: 'Activar Técnico',
            message: '¿Está seguro de que desea activar a {{name}}? Recuperará el acceso al sistema.',
            confirm: 'Activar',
            cancel: 'Cancelar'
          },
          deactivate: {
            title: 'Desactivar Técnico',
            message: '¿Está seguro de que desea desactivar a {{name}}? Perderá el acceso al sistema pero sus datos se conservarán.',
            confirm: 'Desactivar',
            cancel: 'Cancelar'
          },
          remove: {
            title: 'Eliminar Técnico',
            message: '¿Está seguro de que desea eliminar permanentemente a {{name}}? Esta acción no se puede deshacer y todos sus datos serán eliminados.',
            confirm: 'Eliminar',
            cancel: 'Cancelar',
            warning: 'Esta acción es permanente y no se puede deshacer.'
          },
          batchActivate: {
            title: 'Activar Técnicos',
            message: '¿Está seguro de que desea activar {{count}} técnicos?',
            confirm: 'Activar Todos',
            cancel: 'Cancelar'
          },
          batchDeactivate: {
            title: 'Desactivar Técnicos',
            message: '¿Está seguro de que desea desactivar {{count}} técnicos?',
            confirm: 'Desactivar Todos',
            cancel: 'Cancelar'
          },
          batchRemove: {
            title: 'Eliminar Técnicos',
            message: '¿Está seguro de que desea eliminar permanentemente {{count}} técnicos? Esta acción no se puede deshacer.',
            confirm: 'Eliminar Todos',
            cancel: 'Cancelar',
            warning: 'Esta acción es permanente y no se puede deshacer.'
          }
        },
        
        // Messages and notifications
        messages: {
          technicianActivated: 'Técnico activado exitosamente',
          technicianDeactivated: 'Técnico desactivado exitosamente',
          technicianRemoved: 'Técnico eliminado exitosamente',
          techniciansActivated: '{{count}} técnicos activados exitosamente',
          techniciansDeactivated: '{{count}} técnicos desactivados exitosamente',
          techniciansRemoved: '{{count}} técnicos eliminados exitosamente',
          invitationResent: 'Invitación reenviada exitosamente',
          noTechniciansFound: 'No se encontraron técnicos',
          loadingTechnicians: 'Cargando técnicos...',
          errorLoadingTechnicians: 'Error al cargar técnicos. Por favor, inténtelo de nuevo.'
        }
      },
      
      // Company Profile Management
      companyProfile: {
        title: 'Perfil de la Empresa',
        subtitle: 'Administra la información de tu empresa',
        basicInfo: 'Información Básica',
        contactInfo: 'Información de Contacto',
        branding: 'Marca',
        
        // Form fields
        companyName: 'Nombre de la Empresa',
        companyNamePlaceholder: 'Ingresa el nombre de tu empresa',
        description: 'Descripción',
        descriptionPlaceholder: 'Breve descripción de tu empresa...',
        website: 'Sitio Web',
        websitePlaceholder: 'https://www.tuempresa.com',
        
        // Contact information
        primaryPhone: 'Teléfono Principal',
        secondaryPhone: 'Teléfono Secundario (Opcional)',
        email: 'Correo de la Empresa',
        
        // Address
        address: 'Dirección',
        addressLine1: 'Línea de Dirección 1',
        addressLine2: 'Línea de Dirección 2 (Opcional)',
        city: 'Ciudad',
        state: 'Estado/Provincia',
        zipCode: 'Código Postal',
        country: 'País',
        
        // Logo upload
        logo: 'Logo de la Empresa',
        logoUpload: 'Subir Logo',
        logoRemove: 'Eliminar Logo',
        logoPreview: 'Vista Previa del Logo',
        logoRequirements: 'Recomendado: 200x200px, máx 2MB, formato PNG o JPG',
        logoUploading: 'Subiendo...',
        logoUploadSuccess: 'Logo subido exitosamente',
        logoUploadError: 'Error al subir el logo. Por favor, inténtelo de nuevo.',
        logoRemoveConfirm: '¿Está seguro de que desea eliminar el logo de la empresa?',
        
        // Actions
        save: 'Guardar Cambios',
        cancel: 'Cancelar',
        saving: 'Guardando...',
        saved: 'Cambios guardados exitosamente',
        saveError: 'Error al guardar los cambios. Por favor, inténtelo de nuevo.',
        
        // Validation
        validation: {
          companyNameRequired: 'El nombre de la empresa es obligatorio',
          companyNameLength: 'El nombre de la empresa debe tener al menos 2 caracteres',
          emailInvalid: 'Por favor, ingrese un correo electrónico válido',
          phoneInvalid: 'Por favor, ingrese un número de teléfono válido',
          websiteInvalid: 'Por favor, ingrese una URL de sitio web válida',
          logoTooLarge: 'El archivo del logo es demasiado grande. El tamaño máximo es 2MB.',
          logoInvalidFormat: 'Formato de logo inválido. Por favor, use PNG o JPG.'
        }
      },
      
      // Help and onboarding
      help: {
        techManagementHelp: 'Administra tu equipo de técnicos. Puedes invitar nuevos técnicos, activar o desactivar los existentes, y rastrear su estado.',
        companyProfileHelp: 'Mantén actualizada la información de tu empresa. Esta información se mostrará en las boletas de trabajo y facturas.',
        invitationHelp: 'Los técnicos recibirán una invitación por correo electrónico con instrucciones para crear su cuenta y unirse a tu equipo.',
        batchActionsHelp: 'Selecciona múltiples técnicos para realizar acciones en todos ellos a la vez.',
        auditTrailHelp: 'Todos los cambios en el estado de los técnicos y el perfil de la empresa se registran para fines de auditoría.'
      }
    },
    
    // Audit and logging
    audit: {
      title: 'Registro de Auditoría',
      subtitle: 'Rastrea todos los cambios y actividades',
      timestamp: 'Marca de Tiempo',
      user: 'Usuario',
      action: 'Acción',
      details: 'Detalles',
      category: 'Categoría',
      
      // Categories
      categories: {
        technician: 'Gestión de Técnicos',
        company: 'Perfil de la Empresa',
        security: 'Seguridad',
        system: 'Sistema'
      },
      
      // Actions
      actions: {
        technicianInvited: 'Técnico invitado',
        technicianActivated: 'Técnico activado',
        technicianDeactivated: 'Técnico desactivado',
        technicianRemoved: 'Técnico eliminado',
        companyUpdated: 'Perfil de empresa actualizado',
        logoUploaded: 'Logo de empresa subido',
        logoRemoved: 'Logo de empresa eliminado'
      }
    },
    
    // Audit Logs
    auditLogs: {
      title: 'Registros de Auditoría',
      subtitle: 'Ver actividad del sistema y acciones de usuarios',
      exportLogs: 'Exportar Registros',
      exporting: 'Exportando...',
      clearFilters: 'Limpiar Filtros',
      totalLogs: 'Total de registros: {count}',
      perPage: 'por página',
      showingResults: 'Mostrando {start}-{end} de {total} resultados',
      
      // Table headers
      timestamp: 'Marca de Tiempo',
      category: 'Categoría',
      action: 'Acción',
      user: 'Usuario',
      description: 'Descripción',
      ipAddress: 'Dirección IP',
      
      // Filters
      filters: {
        category: 'Categoría',
        action: 'Acción',
        user: 'Usuario',
        dateFrom: 'Fecha Desde',
        dateTo: 'Fecha Hasta',
        searchPlaceholder: 'Buscar registros...'
      },
      
      // Categories
      categories: {
        security: 'Seguridad',
        user: 'Usuario',
        company: 'Empresa',
        technician: 'Técnico',
        system: 'Sistema',
        jobticket: 'Boleta de Trabajo',
        invoice: 'Factura'
      },
      
      // Messages
      messages: {
        loadingLogs: 'Cargando registros de auditoría...',
        noLogsFound: 'No se encontraron registros de auditoría',
        exportSuccess: 'Registros de auditoría exportados exitosamente',
        exportError: 'Error al exportar registros de auditoría'
      }
    }
  }
};

export default translations;
