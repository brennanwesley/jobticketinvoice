/**
 * Job ticket related translations for the JobTicketInvoice application
 * Provides bilingual support for job ticket creation and management
 */

export const jobTicketTranslations = {
  en: {
    // Job ticket related translations
    jobTicket: {
      title: 'Job Ticket',
      createNew: 'Create Job Ticket...',
      byHand: 'By Hand',
      byVoice: 'By Voice',
      date: 'Job Date',
      companyName: 'Company Name',
      location: 'Location / Well or Lease Name / Facility',
      workDescription: 'Description of Work',
      workStartTime: 'Work Start Time',
      workEndTime: 'Work End Time',
      workTotalTime: 'Work Total Time',
      travelStartTime: 'Travel Start Time',
      travelEndTime: 'Travel End Time',
      travelTotalTime: 'Travel Total Time',
      travelType: {
        oneWay: 'One-Way',
        roundTrip: 'Round Trip'
      },
      parts: {
        title: 'Parts Used',
        placeholder: 'Select Part(s) to Add...',
        lubricant: 'Lubricant',
        pumpSeal: 'Pump Seal',
        thrustChamber: 'Thrust Chamber',
        vfdBreakerSwitch: 'VFD Breaker/Switch',
        serviceKit: 'Service/Safety Maintenance Kit',
        other: 'Other'
      },
      submit: 'Submit Job Ticket',
      draft: 'Save as Draft',
      voicePrompt: 'Speak now to create a job ticket...',
      voiceListening: 'Listening...',
      voiceCaptured: 'Voice input captured!',
      voiceProcessing: 'Processing voice input...',
      voiceRetry: 'Try Again',
      validation: {
        dateRequired: 'Job date is required',
        companyRequired: 'Company name is required',
        locationRequired: 'Location is required',
        workDescriptionRequired: 'Work description is required',
        timeFormatInvalid: 'Invalid time format (use HH:MM)',
        endTimeBeforeStart: 'End time cannot be before start time'
      },
      // Additional job ticket translations from existing file
      listening: 'Listening now...',
      voiceCaptured: 'Your Job Ticket has been captured — please review',
      stopRecording: 'Stop Recording'
    }
  },
  
  es: {
    // Job ticket related translations
    jobTicket: {
      title: 'Boleta de Trabajo',
      createNew: 'Crear Boleta de Trabajo...',
      byHand: 'Manual',
      byVoice: 'Por Voz',
      date: 'Fecha de Trabajo',
      companyName: 'Nombre de la Empresa',
      location: 'Ubicación / Pozo o Nombre del Arrendamiento / Instalación',
      workDescription: 'Descripción del Trabajo',
      workStartTime: 'Hora de Inicio del Trabajo',
      workEndTime: 'Hora de Finalización del Trabajo',
      workTotalTime: 'Tiempo Total de Trabajo',
      travelStartTime: 'Hora de Inicio de Viaje',
      travelEndTime: 'Hora de Finalización de Viaje',
      travelTotalTime: 'Tiempo Total de Viaje',
      travelType: {
        oneWay: 'Solo Ida',
        roundTrip: 'Ida y Vuelta'
      },
      parts: {
        title: 'Piezas Utilizadas',
        placeholder: 'Seleccionar Pieza(s) para Agregar...',
        lubricant: 'Lubricante',
        pumpSeal: 'Sello de Bomba',
        thrustChamber: 'Cámara de Empuje',
        vfdBreakerSwitch: 'Interruptor/Disyuntor VFD',
        serviceKit: 'Kit de Mantenimiento de Servicio/Seguridad',
        other: 'Otro'
      },
      submit: 'Enviar Boleta de Trabajo',
      draft: 'Guardar como Borrador',
      voicePrompt: 'Hable ahora para crear una boleta de trabajo...',
      voiceListening: 'Escuchando...',
      voiceCaptured: '¡Entrada de voz capturada!',
      voiceProcessing: 'Procesando entrada de voz...',
      voiceRetry: 'Intentar de Nuevo',
      validation: {
        dateRequired: 'La fecha de trabajo es requerida',
        companyRequired: 'El nombre de la empresa es requerido',
        locationRequired: 'La ubicación es requerida',
        workDescriptionRequired: 'La descripción del trabajo es requerida',
        timeFormatInvalid: 'Formato de hora inválido (use HH:MM)',
        endTimeBeforeStart: 'La hora de finalización no puede ser antes de la hora de inicio'
      },
      // Additional job ticket translations from existing file
      listening: 'Escuchando ahora...',
      voiceCaptured: 'Su Boleta de Trabajo ha sido capturada — por favor revise',
      stopRecording: 'Detener Grabación'
    }
  }
};
