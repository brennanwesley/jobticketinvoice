/**
 * Authentication-related translations for the JobTicketInvoice application
 * Provides bilingual support for signup, login, and user profile pages
 */

export const authTranslations = {
  en: {
    // Common authentication terms
    common: {
      email: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      name: 'Full Name',
      submit: 'Submit',
      loading: 'Loading...',
      back: 'Back',
      cancel: 'Cancel',
      save: 'Save',
      required: 'Required',
    },
    
    // Auth test page
    auth: {
      testPageTitle: 'Authentication Test Page',
      testControls: 'Test Controls',
      currentStatus: 'Current Authentication Status',
      loggedInAs: 'Logged in as',
      notLoggedIn: 'Not logged in',
      loginTest: 'Login Test',
      registerTest: 'Register Test',
      runLoginTest: 'Run Login Test',
      runRegisterTest: 'Run Register Test',
      runLogoutTest: 'Run Logout Test',
      logoUploadTest: 'Logo Upload Test',
      testResults: 'Test Results',
      noTestResults: 'No test results yet. Run a test to see results here.',
      clearResults: 'Clear Results',
    },
    
    // Login page
    login: {
      title: 'Log In to Your Account',
      description: 'Enter your credentials to access your dashboard',
      email: 'Email Address',
      password: 'Password',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      loginButton: 'Log In',
      noAccount: 'Don\'t have an account?',
      signupLink: 'Sign up',
      loginSuccess: 'Login successful!',
    },
    
    // Signup page
    signup: {
      title: 'Create Your Account',
      description: 'Create your manager account to get started',
      managerSignup: 'Create Manager Account',
      managerDescription: 'Set up your company profile to manage tickets and invoices',
      companyName: 'Company Name',
      companyLogo: 'Company Logo (Optional)',
      uploadLogo: 'Upload Logo',
      changeLogo: 'Change Logo',
      removeLogo: 'Remove Logo',
      logoRequirements: 'JPG, PNG or GIF (max. 2MB)',
      createAccount: 'Create Account',
      alreadyHaveAccount: 'Already have an account?',
      loginLink: 'Log in',
      signupSuccess: 'Account created successfully!',
    },
    
    // User profile
    profile: {
      title: 'User Profile',
      description: 'View your account information',
      name: 'Name',
      email: 'Email',
      role: 'Role',
      companyName: 'Company Name',
      companyLogo: 'Company Logo',
      memberSince: 'Member Since',
      notLoggedIn: 'You are not logged in',
      noLogoUploaded: 'No logo uploaded',
      editProfile: 'Edit Profile',
      changePassword: 'Change Password',
    },
    
    // Form validation
    validation: {
      nameRequired: 'Name is required',
      emailRequired: 'Email is required',
      emailInvalid: 'Please enter a valid email address',
      passwordRequired: 'Password is required',
      passwordLength: 'Password must be at least 8 characters',
      passwordsDoNotMatch: 'Passwords do not match',
      companyNameRequired: 'Company name is required',
      invalidFileType: 'Invalid file type. Please upload JPG, PNG, or GIF',
      fileTooLarge: 'File is too large. Maximum size is 2MB',
    },
    
    // Error messages
    errors: {
      loginFailed: 'Login failed. Please check your credentials and try again.',
      signupFailed: 'Registration failed. Please try again later.',
      uploadFailed: 'Logo upload failed. Please try again.',
      serverError: 'Server error. Please try again later.',
      networkError: 'Network error. Please check your connection and try again.',
    },
  },
  
  es: {
    // Common authentication terms
    common: {
      email: 'Correo Electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      name: 'Nombre Completo',
      submit: 'Enviar',
      loading: 'Cargando...',
      back: 'Atrás',
      cancel: 'Cancelar',
      save: 'Guardar',
      required: 'Requerido',
    },
    
    // Auth test page
    auth: {
      testPageTitle: 'Página de Prueba de Autenticación',
      testControls: 'Controles de Prueba',
      currentStatus: 'Estado Actual de Autenticación',
      loggedInAs: 'Conectado como',
      notLoggedIn: 'No ha iniciado sesión',
      loginTest: 'Prueba de Inicio de Sesión',
      registerTest: 'Prueba de Registro',
      runLoginTest: 'Ejecutar Prueba de Inicio de Sesión',
      runRegisterTest: 'Ejecutar Prueba de Registro',
      runLogoutTest: 'Ejecutar Prueba de Cierre de Sesión',
      logoUploadTest: 'Prueba de Carga de Logo',
      testResults: 'Resultados de Pruebas',
      noTestResults: 'Aún no hay resultados de pruebas. Ejecute una prueba para ver los resultados aquí.',
      clearResults: 'Borrar Resultados',
    },
    
    // Login page
    login: {
      title: 'Iniciar Sesión en su Cuenta',
      description: 'Ingrese sus credenciales para acceder a su panel',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      rememberMe: 'Recordarme',
      forgotPassword: '¿Olvidó su contraseña?',
      loginButton: 'Iniciar Sesión',
      noAccount: '¿No tiene una cuenta?',
      signupLink: 'Regístrese',
      loginSuccess: '¡Inicio de sesión exitoso!',
    },
    
    // Signup page
    signup: {
      title: 'Crear su Cuenta',
      description: 'Cree su cuenta de gerente para comenzar',
      managerSignup: 'Crear Cuenta de Gerente',
      managerDescription: 'Configure su perfil de empresa para gestionar boletas y facturas',
      companyName: 'Nombre de la Empresa',
      companyLogo: 'Logo de la Empresa (Opcional)',
      uploadLogo: 'Subir Logo',
      changeLogo: 'Cambiar Logo',
      removeLogo: 'Eliminar Logo',
      logoRequirements: 'JPG, PNG o GIF (máx. 2MB)',
      createAccount: 'Crear Cuenta',
      alreadyHaveAccount: '¿Ya tiene una cuenta?',
      loginLink: 'Iniciar sesión',
      signupSuccess: '¡Cuenta creada exitosamente!',
    },
    
    // User profile
    profile: {
      title: 'Perfil de Usuario',
      description: 'Ver información de su cuenta',
      name: 'Nombre',
      email: 'Correo Electrónico',
      role: 'Rol',
      companyName: 'Nombre de la Empresa',
      companyLogo: 'Logo de la Empresa',
      memberSince: 'Miembro Desde',
      notLoggedIn: 'No ha iniciado sesión',
      noLogoUploaded: 'No se ha subido ningún logo',
      editProfile: 'Editar Perfil',
      changePassword: 'Cambiar Contraseña',
    },
    
    // Form validation
    validation: {
      nameRequired: 'El nombre es requerido',
      emailRequired: 'El correo electrónico es requerido',
      emailInvalid: 'Por favor ingrese un correo electrónico válido',
      passwordRequired: 'La contraseña es requerida',
      passwordLength: 'La contraseña debe tener al menos 8 caracteres',
      passwordsDoNotMatch: 'Las contraseñas no coinciden',
      companyNameRequired: 'El nombre de la empresa es requerido',
      invalidFileType: 'Tipo de archivo inválido. Por favor suba JPG, PNG o GIF',
      fileTooLarge: 'El archivo es demasiado grande. El tamaño máximo es 2MB',
    },
    
    // Error messages
    errors: {
      loginFailed: 'Error al iniciar sesión. Por favor verifique sus credenciales e intente nuevamente.',
      signupFailed: 'Error al registrarse. Por favor intente más tarde.',
      uploadFailed: 'Error al subir el logo. Por favor intente nuevamente.',
      serverError: 'Error del servidor. Por favor intente más tarde.',
      networkError: 'Error de red. Por favor verifique su conexión e intente nuevamente.',
    },
  }
};
