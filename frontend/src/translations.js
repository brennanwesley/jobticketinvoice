import {
  FolderIcon,
  DocumentTextIcon,
  InboxIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const translations = {
  en: {
    // Common translations
    common: {
      loading: 'Loading...',
      back: 'Back',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      retry: 'Retry',
      notAvailable: 'N/A',
      loggedInAs: 'Logged in as',
      select: 'Select an option',
      add: 'Add',
      remove: 'Remove',
      success: 'Success',
      error: 'Error',
      welcome: 'Welcome',
      email: 'Email',
      fullName: 'Full Name',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      jobType: 'Job Type',
      goHome: 'Go Home'
    },
    
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
    
    // Signup and registration
    signup: {
      title: 'Create Your Account',
      description: 'Create your account to get started with our platform.',
      managerTitle: 'Create Manager Account',
      managerOnlyDescription: 'Register your company and start managing your team',
      technicianNote: 'Technicians are invited by their manager and cannot self-register',
      managerSignup: 'Manager Signup',
      alreadyHaveAccount: 'Already have an account?',
      loginInstead: 'Login instead',
      email: 'Email Address',
      company: 'Company Name',
      companyLogo: 'Company Logo (Optional)',
      dragDropOrClick: 'Drag and drop a logo here, or click to select',
      logoRequirements: 'PNG, JPG, GIF up to 5MB',
      selectFile: 'Select File',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      submitting: 'Creating Account...',
      termsAgree: 'I agree to the Terms and Conditions',
      address: 'Address',
      phone: 'Phone Number',
      name: 'Full Name',
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
      dashboardSubtitle: 'Manage your team and company operations',
      portal: 'Manager Portal',
      overview: 'Overview',
      technicians: 'Technicians',
      company: 'Company',
      
      // Overview page
      overviewDescription: 'Get a quick overview of your team and company performance',
      totalTechnicians: 'Total Technicians',
      totalWorkHours: 'Total Work Hours',
      activeTechnicians: 'Active Technicians',
      pendingInvitations: 'Pending Invitations',
      completedJobs: 'Completed Jobs',
      awaitingResponse: 'Awaiting Response',
      thisMonth: 'This Month',
      quickActions: 'Quick Actions',
      inviteTechnician: 'Invite Technician',
      updateCompany: 'Update Company',
      createInvoice: 'Create Invoice',
      createJobTicket: 'Create Job Ticket',
      manageTechnicians: 'Manage your team of technicians',
      manageCompany: 'Manage your company profile and settings',
      
      // Dashboard stat cards
      activeTickets: 'Active Tickets',
      pendingInvoices: 'Pending Invoices',
      companyStatus: 'Company Status',
      
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
        phoneNumber: 'Phone Number',
        
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
        delete: 'Delete',
        
        // Batch actions
        batchActions: 'Batch Actions',
        selectAll: 'Select All',
        selectedCount: '{{count}} selected',
        batchActivate: 'Activate Selected',
        batchDeactivate: 'Deactivate Selected',
        batchRemove: 'Remove Selected',
        batchDelete: 'Delete Selected',
        
        // Invite technician form
        inviteForm: {
          title: 'Invite Technician',
          subtitle: 'Send an invitation to join your team',
          
          // Tab labels
          createTab: 'Create Your Own',
          emailTab: 'Send Email',
          smsTab: 'Send Text Message',
          
          // Create Your Own form
          fullName: 'Full Name',
          fullNameRequired: 'Full Name *',
          emailAddress: 'Email Address',
          emailAddressRequired: 'Email Address *',
          phoneNumber: 'Phone Number',
          phoneNumberRequired: 'Phone Number *',
          password: 'Password',
          passwordRequired: 'Password *',
          passwordMinLength: '(minimum 8 characters)',
          confirmPassword: 'Confirm Password',
          confirmPasswordRequired: 'Confirm Password *',
          
          // Placeholders
          enterFullName: 'Enter technician\'s full name',
          enterEmail: 'Enter email address',
          enterPhone: '(XXX) XXX-XXXX',
          enterPassword: 'Enter password',
          confirmPasswordPlaceholder: 'Confirm password',
          enterTechnicianName: 'Enter technician\'s name',
          
          // Buttons and actions
          creating: 'Creating...',
          createTechnician: 'Create Technician',
          sending: 'Sending...',
          sendEmailInvitation: 'Send Email Invitation',
          smsInviteComingSoon: 'SMS invite available after registration',
          
          // Form labels
          technicianName: 'Technician Name',
          technicianNameRequired: 'Technician Name *',
          
          // Info messages
          emailInviteInfo: 'An email invitation will be sent with a secure signup link. The technician will be able to set their own password during signup.',
          smsInviteInfo: 'SMS invitations will be available after completing your company registration and SMS service setup.',
          
          firstName: 'First Name',
          lastName: 'Last Name',
          email: 'Email Address',
          jobType: 'Job Type',
          personalMessage: 'Personal Message (Optional)',
          personalMessagePlaceholder: 'Add a personal message to the invitation...',
          sendInvitation: 'Send Invitation',
          cancel: 'Cancel',
          invitationSent: 'Invitation sent successfully!',
          invitationError: 'Failed to send invitation. Please try again.',
          passwordMismatch: 'Passwords do not match',
          passwordMinLengthError: 'Password must be at least 8 characters',
          createError: 'Failed to create technician',
          emailError: 'Failed to send email invitation',
          smsError: 'Failed to send SMS invitation',
          createSuccess: 'Technician {{name}} created successfully!',
          emailSuccess: 'Email invitation sent to {{name}} at {{email}}!',
          smsSuccess: 'SMS invitation sent to {{name}} at {{phone}}!'
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
          delete: {
            title: 'Delete Technician',
            message: 'Are you sure you want to permanently delete {{name}}? This action cannot be undone and all their data will be deleted.',
            confirm: 'Delete',
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
          },
          batchDelete: {
            title: 'Delete Technicians',
            message: 'Are you sure you want to permanently delete {{count}} technicians? This action cannot be undone.',
            confirm: 'Delete All',
            cancel: 'Cancel',
            warning: 'This action is permanent and cannot be undone.'
          }
        },
        
        // Messages and notifications
        messages: {
          invitationSent: 'Invitation sent successfully',
          technicianCreated: 'Technician {{name}} created successfully',
          technicianDeactivated: 'Technician deactivated successfully',
          technicianDeleted: 'Technician deleted successfully',
          technicianActivated: 'Technician activated successfully',
          techniciansActivated: '{{count}} technicians activated successfully',
          techniciansDeactivated: '{{count}} technicians deactivated successfully',
          techniciansRemoved: '{{count}} technicians removed successfully',
          techniciansDeleted: '{{count}} technicians deleted successfully',
          invitationResent: 'Invitation resent successfully',
          noTechniciansFound: 'No technicians found',
          loadingTechnicians: 'Loading technicians...',
          errorLoadingTechnicians: 'Error loading technicians. Please try again.'
        },
        
        // Stat boxes section
        statBoxes: {
          title: 'Technician Management',
          totalTechnicians: 'Total Technicians',
          activeTechnicians: 'Active Technicians',
          pendingInvitations: 'Pending Invitations'
        },
        
        // Table section
        table: {
          title: 'Technician Team',
          noTechnicians: 'No technicians found',
          inviteFirstTechnician: 'Invite your first technician to get started',
          headers: {
            name: 'Name',
            email: 'Email',
            phoneNumber: 'Phone Number',
            status: 'Status',
            actions: 'Actions'
          },
          actions: {
            deactivate: 'Deactivate',
            delete: 'Delete',
            activate: 'Activate'
          }
        },
      },
      
      // Job Tickets Management
      jobTickets: {
        title: 'Job Tickets',
        subtitle: 'Manage and track all job tickets for your company',
        
        // Status statistics
        stats: {
          totalTickets: 'Total Tickets',
          assignedToInvoice: 'Assigned to Invoice',
          notAssigned: 'Not Assigned'
        },
        
        // Data table
        table: {
          title: 'Job Tickets Overview',
          headers: {
            ticketNumber: 'Ticket Number',
            submittedBy: 'Submitted By',
            customerName: 'Customer Name',
            workHours: 'Work Hours',
            travelHours: 'Travel Hours',
            invoiceLink: 'Invoice Status',
            actions: 'Actions'
          },
          placeholders: {
            customerName: 'Enter customer name'
          },
          status: {
            linked: 'Linked',
            notLinked: 'Not Linked'
          }
        },
        
        // Empty state
        empty: {
          title: 'No Job Tickets Found',
          description: 'Job tickets will appear here once technicians start submitting them.'
        },
        
        // Delete confirmation modal
        deleteModal: {
          title: 'Confirm Delete',
          message: 'Are you sure you want to delete job ticket {{ticketNumber}}? This action cannot be undone.'
        },
        
        // Messages and notifications
        messages: {
          errorLoading: 'Error loading job tickets. Please try again.',
          editSuccess: 'Job ticket updated successfully',
          editError: 'Error updating job ticket. Please try again.',
          deleteSuccess: 'Job ticket deleted successfully',
          deleteError: 'Error deleting job ticket. Please try again.'
        }
      },
      
      // Company Profile Management
      companyProfile: {
        title: 'Company Profile',
        companyName: 'Company Name',
        managerName: 'Manager Name',
        technicianCount: 'Technician Count',
        rateSheet: 'Rate Sheet',
        uploadRateSheet: 'Upload Rate Sheet',
        rateSheetNote: 'Upload functionality coming soon'
      },
      
      // Settings
      settings: {
        title: 'Settings',
        comingSoon: 'Settings functionality coming soon'
      },
      
      // Audit Logs
      auditLogs: {
        title: 'Audit Logs',
        subtitle: 'Monitor system activities and user actions',
        filters: {
          category: 'Category',
          action: 'Action',
          user: 'User',
          dateFrom: 'From Date',
          dateTo: 'To Date',
          search: 'Search',
          apply: 'Apply Filters',
          clear: 'Clear Filters'
        },
        table: {
          timestamp: 'Timestamp',
          user: 'User',
          category: 'Category',
          action: 'Action',
          description: 'Description',
          details: 'Details',
          ipAddress: 'IP Address'
        },
        categories: {
          security: 'Security',
          user: 'User',
          company: 'Company',
          technician: 'Technician',
          system: 'System'
        },
        actions: {
          login: 'Login',
          logout: 'Logout',
          create: 'Create',
          update: 'Update',
          delete: 'Delete',
          invite: 'Invite',
          activate: 'Activate',
          deactivate: 'Deactivate'
        },
        totalLogs: 'Total Logs',
        noLogs: 'No audit logs found',
        export: 'Export CSV',
        loading: 'Loading audit logs...',
        error: 'Error loading audit logs'
      },
      
      // Invoicing
      invoicing: {
        title: 'Invoicing',
        subtitle: 'Manage invoices and billing',
        comingSoon: 'Invoicing functionality coming soon',
        description: 'Create, manage, and track invoices for your technician services.'
      },
      
      // Help and onboarding
      help: {
        techManagementHelp: 'Manage your team of technicians. You can invite new technicians, activate or deactivate existing ones, and track their status.',
        companyProfileHelp: 'Keep your company information up to date. This information will be displayed on job tickets and invoices.',
        invitationHelp: 'Technicians will receive an email invitation with instructions to create their account and join your team.',
        batchActionsHelp: 'Select multiple technicians to perform actions on them all at once.',
        auditTrailHelp: 'All changes to technician status and company profile are logged for audit purposes.'
      },
    },
    
    // Audit and logging
    audit: {
      title: 'Audit Log',
      subtitle: 'Track all changes and activities',
      viewLogs: 'View audit logs and system activity',
      viewReports: 'View Reports',
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
    
    // Technician Signup
    techSignup: {
      title: 'Complete Your Registration',
      subtitle: 'You have been invited to join as a technician',
      validatingInvitation: 'Validating Invitation',
      pleaseWait: 'Please wait while we verify your invitation...',
      invalidInvitation: 'Invalid Invitation',
      invitationDetails: 'Invitation Details',
      createAccount: 'Create Account',
      creating: 'Creating Account...',
      footer: 'By creating an account, you agree to our terms of service.',
      placeholders: {
        fullName: 'Enter your full name',
        password: 'Enter a secure password',
        confirmPassword: 'Confirm your password'
      },
      errors: {
        noToken: 'No invitation token provided in the URL',
        invalidToken: 'This invitation link is invalid or has expired',
        validationFailed: 'Failed to validate invitation token',
        signupFailed: 'Failed to create account. Please try again.',
        accountCreated: 'Account created successfully. Please login to continue.'
      }
    },
  },
  
  es: {
    // Common translations
    common: {
      loading: 'Cargando...',
      back: 'Atrás',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      save: 'Guardar',
      edit: 'Editar',
      delete: 'Eliminar',
      retry: 'Reintentar',
      notAvailable: 'No disponible',
      loggedInAs: 'Conectado como',
      select: 'Seleccionar una opción',
      add: 'Agregar',
      remove: 'Eliminar',
      success: 'Éxito',
      error: 'Error',
      welcome: 'Bienvenido',
      email: 'Correo Electrónico',
      fullName: 'Nombre Completo',
      password: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      jobType: 'Tipo de Trabajo',
      goHome: 'Ir al Inicio'
    },
    
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
    
    // Signup and registration
    signup: {
      title: 'Crear Su Cuenta',
      description: 'Cree su cuenta para comenzar con nuestra plataforma.',
      managerTitle: 'Crear Cuenta de Gerente',
      managerOnlyDescription: 'Registre su empresa y comience a gestionar su equipo',
      technicianNote: 'Los técnicos son invitados por su gerente y no pueden registrarse ellos mismos',
      managerSignup: 'Registro de Gerente',
      alreadyHaveAccount: '¿Ya tiene una cuenta?',
      loginInstead: 'Iniciar sesión en su lugar',
      email: 'Correo Electrónico',
      company: 'Nombre de la Empresa',
      companyLogo: 'Logo de la Empresa (Opcional)',
      dragDropOrClick: 'Arrastre y suelte un logo aquí, o haga clic para seleccionar',
      logoRequirements: 'PNG, JPG, GIF hasta 5MB',
      selectFile: 'Seleccionar Archivo',
      password: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      submitting: 'Creando Cuenta...',
      termsAgree: 'Acepto los Términos y Condiciones',
      address: 'Dirección',
      phone: 'Número de Teléfono',
      name: 'Nombre Completo',
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
      dashboardSubtitle: 'Administre su equipo y operaciones de la empresa',
      portal: 'Portal de Gerente',
      overview: 'Resumen',
      technicians: 'Técnicos',
      company: 'Empresa',
      
      // Overview page
      overviewDescription: 'Obtenga una visión general rápida del rendimiento de su equipo y empresa',
      totalTechnicians: 'Total de Técnicos',
      totalWorkHours: 'Total de Horas de Trabajo',
      activeTechnicians: 'Técnicos Activos',
      pendingInvitations: 'Invitaciones Pendientes',
      completedJobs: 'Trabajos Completados',
      awaitingResponse: 'Esperando Respuesta',
      thisMonth: 'Este Mes',
      quickActions: 'Acciones Rápidas',
      inviteTechnician: 'Invitar Técnico',
      updateCompany: 'Actualizar Empresa',
      createInvoice: 'Crear Factura',
      createJobTicket: 'Crear Boleta de Trabajo',
      manageTechnicians: 'Administre su equipo de técnicos',
      manageCompany: 'Administre su perfil de empresa y configuración',
      
      // Dashboard stat cards
      activeTickets: 'Boletas Activas',
      pendingInvoices: 'Facturas Pendientes',
      companyStatus: 'Estado de la Empresa',
      
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
        phoneNumber: 'Número de Teléfono',
        
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
        delete: 'Eliminar',
        
        // Batch actions
        batchActions: 'Acciones en Lote',
        selectAll: 'Seleccionar Todo',
        selectedCount: '{{count}} seleccionados',
        batchActivate: 'Activar Seleccionados',
        batchDeactivate: 'Desactivar Seleccionados',
        batchRemove: 'Eliminar Seleccionados',
        batchDelete: 'Eliminar Seleccionados',
        
        // Invite technician form
        inviteForm: {
          title: 'Invitar Técnico',
          subtitle: 'Envía una invitación para unirse a tu equipo',
          
          // Tab labels
          createTab: 'Crear Propio',
          emailTab: 'Enviar Correo',
          smsTab: 'Enviar Mensaje de Texto',
          
          // Create Your Own form
          fullName: 'Nombre Completo',
          fullNameRequired: 'Nombre Completo *',
          emailAddress: 'Dirección de Correo Electrónico',
          emailAddressRequired: 'Dirección de Correo Electrónico *',
          phoneNumber: 'Número de Teléfono',
          phoneNumberRequired: 'Número de Teléfono *',
          password: 'Contraseña',
          passwordRequired: 'Contraseña *',
          passwordMinLength: '(mínimo 8 caracteres)',
          confirmPassword: 'Confirmar Contraseña',
          confirmPasswordRequired: 'Confirmar Contraseña *',
          
          // Placeholders
          enterFullName: 'Ingrese el nombre completo del técnico',
          enterEmail: 'Ingrese la dirección de correo electrónico',
          enterPhone: '(XXX) XXX-XXXX',
          enterPassword: 'Ingrese la contraseña',
          confirmPasswordPlaceholder: 'Confirme la contraseña',
          enterTechnicianName: 'Ingrese el nombre del técnico',
          
          // Buttons and actions
          creating: 'Creando...',
          createTechnician: 'Crear Técnico',
          sending: 'Enviando...',
          sendEmailInvitation: 'Enviar Invitación por Correo',
          smsInviteComingSoon: 'Invitación por SMS disponible después del registro',
          
          // Form labels
          technicianName: 'Nombre del Técnico',
          technicianNameRequired: 'Nombre del Técnico *',
          
          // Info messages
          emailInviteInfo: 'Se enviará una invitación por correo electrónico con un enlace de registro seguro. El técnico podrá establecer su propia contraseña durante el registro.',
          smsInviteInfo: 'Las invitaciones por SMS estarán disponibles después de completar el registro de su empresa y la configuración del servicio SMS.',
          
          firstName: 'Nombre',
          lastName: 'Apellido',
          email: 'Correo Electrónico',
          jobType: 'Tipo de Trabajo',
          personalMessage: 'Mensaje Personal (Opcional)',
          personalMessagePlaceholder: 'Agrega un mensaje personal a la invitación...',
          sendInvitation: 'Enviar Invitación',
          cancel: 'Cancelar',
          invitationSent: '¡Invitación enviada exitosamente!',
          invitationError: 'Error al enviar la invitación. Por favor, inténtelo de nuevo.',
          passwordMismatch: 'Las contraseñas no coinciden',
          passwordMinLengthError: 'La contraseña debe tener al menos 8 caracteres',
          createError: 'Error al crear técnico',
          emailError: 'Error al enviar invitación por correo',
          smsError: 'Error al enviar invitación por SMS',
          createSuccess: '¡Técnico {{name}} creado exitosamente!',
          emailSuccess: '¡Invitación por correo enviada a {{name}} en {{email}}!',
          smsSuccess: '¡Invitación por SMS enviada a {{name}} en {{phone}}!'
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
          delete: {
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
          },
          batchDelete: {
            title: 'Eliminar Técnicos',
            message: '¿Está seguro de que desea eliminar permanentemente {{count}} técnicos? Esta acción no se puede deshacer.',
            confirm: 'Eliminar Todos',
            cancel: 'Cancelar',
            warning: 'Esta acción es permanente y no se puede deshacer.'
          }
        },
        
        // Messages and notifications
        messages: {
          invitationSent: 'Invitación enviada exitosamente',
          technicianCreated: 'Técnico {{name}} creado exitosamente',
          technicianDeactivated: 'Técnico desactivado exitosamente',
          technicianDeleted: 'Técnico eliminado exitosamente',
          technicianActivated: 'Técnico activado exitosamente',
          techniciansActivated: '{{count}} técnicos activados exitosamente',
          techniciansDeactivated: '{{count}} técnicos desactivados exitosamente',
          techniciansRemoved: '{{count}} técnicos eliminados exitosamente',
          techniciansDeleted: '{{count}} técnicos eliminados exitosamente',
          invitationResent: 'Invitación reenviada exitosamente',
          noTechniciansFound: 'No se encontraron técnicos',
          loadingTechnicians: 'Cargando técnicos...',
          errorLoadingTechnicians: 'Error al cargar técnicos. Por favor, inténtelo de nuevo.'
        },
        
        // Stat boxes section
        statBoxes: {
          title: 'Gestión de Técnicos',
          totalTechnicians: 'Total de Técnicos',
          activeTechnicians: 'Técnicos Activos',
          pendingInvitations: 'Invitaciones Pendientes'
        },
        
        // Table section
        table: {
          title: 'Equipo de Técnicos',
          noTechnicians: 'No se encontraron técnicos',
          inviteFirstTechnician: 'Invite a su primer técnico para comenzar',
          headers: {
            name: 'Nombre',
            email: 'Correo Electrónico',
            phoneNumber: 'Número de Teléfono',
            status: 'Estado',
            actions: 'Acciones'
          },
          actions: {
            deactivate: 'Desactivar',
            delete: 'Eliminar',
            activate: 'Activar'
          }
        },
      },
      
      // Job Tickets Management
      jobTickets: {
        title: 'Boletas de Trabajo',
        subtitle: 'Administre y rastree todas las boletas de trabajo para su empresa',
        
        // Status statistics
        stats: {
          totalTickets: 'Total de Boletas',
          assignedToInvoice: 'Asignadas a Factura',
          notAssigned: 'No Asignadas'
        },
        
        // Data table
        table: {
          title: 'Resumen de Boletas de Trabajo',
          headers: {
            ticketNumber: 'Número de Boleta',
            submittedBy: 'Enviado Por',
            customerName: 'Nombre del Cliente',
            workHours: 'Horas de Trabajo',
            travelHours: 'Horas de Viaje',
            invoiceLink: 'Estado de Factura',
            actions: 'Acciones'
          },
          placeholders: {
            customerName: 'Ingrese nombre del cliente'
          },
          status: {
            linked: 'Enlazada',
            notLinked: 'No Enlazada'
          }
        },
        
        // Empty state
        empty: {
          title: 'No se encontraron boletas de trabajo',
          description: 'Las boletas de trabajo aparecerán aquí una vez que los técnicos comiencen a enviarlas.'
        },
        
        // Delete confirmation modal
        deleteModal: {
          title: 'Confirmar Eliminación',
          message: '¿Está seguro de que desea eliminar la boleta de trabajo {{ticketNumber}}? Esta acción no se puede deshacer.'
        },
        
        // Messages and notifications
        messages: {
          errorLoading: 'Error al cargar boletas de trabajo. Por favor, inténtelo de nuevo.',
          editSuccess: 'Boleta de trabajo actualizada exitosamente',
          editError: 'Error al actualizar boleta de trabajo. Por favor, inténtelo de nuevo.',
          deleteSuccess: 'Boleta de trabajo eliminada exitosamente',
          deleteError: 'Error al eliminar boleta de trabajo. Por favor, inténtelo de nuevo.'
        }
      },
      
      // Company Profile Management
      companyProfile: {
        title: 'Perfil de la Empresa',
        companyName: 'Nombre de la Empresa',
        managerName: 'Nombre del Gerente',
        technicianCount: 'Cantidad de Técnicos',
        rateSheet: 'Tarifa',
        uploadRateSheet: 'Subir Tarifa',
        rateSheetNote: 'La funcionalidad de subir está por venir'
      },
      
      // Settings
      settings: {
        title: 'Configuración',
        comingSoon: 'Funcionalidad de configuración por venir'
      },
      
      // Audit Logs
      auditLogs: {
        title: 'Registros de Auditoría',
        subtitle: 'Ver actividad del sistema y acciones de usuarios',
        filters: {
          category: 'Categoría',
          action: 'Acción',
          user: 'Usuario',
          dateFrom: 'Fecha Desde',
          dateTo: 'Fecha Hasta',
          search: 'Buscar',
          apply: 'Aplicar Filtros',
          clear: 'Limpiar Filtros'
        },
        table: {
          timestamp: 'Marca de Tiempo',
          user: 'Usuario',
          category: 'Categoría',
          action: 'Acción',
          description: 'Descripción',
          details: 'Detalles',
          ipAddress: 'Dirección IP'
        },
        categories: {
          security: 'Seguridad',
          user: 'Usuario',
          company: 'Empresa',
          technician: 'Técnico',
          system: 'Sistema'
        },
        actions: {
          login: 'Iniciar Sesión',
          logout: 'Cerrar Sesión',
          create: 'Crear',
          update: 'Actualizar',
          delete: 'Eliminar',
          invite: 'Invitar',
          activate: 'Activar',
          deactivate: 'Desactivar'
        },
        totalLogs: 'Total de Registros',
        noLogs: 'No se encontraron registros de auditoría',
        export: 'Exportar CSV',
        loading: 'Cargando registros de auditoría...',
        error: 'Error al cargar registros de auditoría'
      },
      
      // Invoicing
      invoicing: {
        title: 'Facturación',
        subtitle: 'Administre facturas y cobros',
        comingSoon: 'Funcionalidad de facturación por venir',
        description: 'Cree, administre y rastree facturas para sus servicios técnicos.'
      },
      
      // Help and onboarding
      help: {
        techManagementHelp: 'Administra tu equipo de técnicos. Puedes invitar nuevos técnicos, activar o desactivar los existentes, y rastrear su estado.',
        companyProfileHelp: 'Mantén actualizada la información de tu empresa. Esta información se mostrará en las boletas de trabajo y facturas.',
        invitationHelp: 'Los técnicos recibirán una invitación por correo electrónico con instrucciones para crear su cuenta y unirse a tu equipo.',
        batchActionsHelp: 'Selecciona múltiples técnicos para realizar acciones en todos ellos a la vez.',
        auditTrailHelp: 'Todos los cambios en el estado de los técnicos y el perfil de la empresa se registran para fines de auditoría.'
      },
    },
    
    // Audit and logging
    audit: {
      title: 'Registro de Auditoría',
      subtitle: 'Rastrea todos los cambios y actividades',
      viewLogs: 'Ver registros de auditoría y actividad del sistema',
      viewReports: 'Ver informes',
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
    
    // Technician Signup
    techSignup: {
      title: 'Complete su Registro',
      subtitle: 'Ha sido invitado a unirse como técnico',
      validatingInvitation: 'Validando Invitación',
      pleaseWait: 'Por favor espere mientras verificamos su invitación...',
      invalidInvitation: 'Invitación Inválida',
      invitationDetails: 'Detalles de la Invitación',
      createAccount: 'Crear Cuenta',
      creating: 'Creando Cuenta...',
      footer: 'Al crear una cuenta, acepta nuestros términos de servicio.',
      placeholders: {
        fullName: 'Ingrese su nombre completo',
        password: 'Ingrese una contraseña segura',
        confirmPassword: 'Confirme su contraseña'
      },
      errors: {
        noToken: 'No se proporcionó token de invitación en la URL',
        invalidToken: 'Este enlace de invitación es inválido o ha expirado',
        validationFailed: 'Error al validar el token de invitación',
        signupFailed: 'Error al crear la cuenta. Por favor intente de nuevo.',
        accountCreated: 'Cuenta creada exitosamente. Por favor inicie sesión para continuar.'
      }
    },
  }
};

export default translations;
