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
      equipment: 'Equipment Serviced',
      equipmentPlaceholder: 'Enter equipment details...',
      workType: 'Work Type',
      customerName: 'Customer Name',
      submittedBy: 'Submitted By',
      customerSignature: 'Customer Signature',
      selectDate: 'Select a date',
      companyName: 'Company Name',
      location: 'Location / Well Name / Lease / Facility',
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
        other: 'Other',
        noParts: 'No parts added yet'
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
      stopRecording: 'Stop Recording',
      cancelRecording: 'Cancel Recording',
      restartRecording: 'Restart Recording',
      allDoneCreateJobTicket: 'All Done, Create Ticket',
      processingAudio: 'Processing audio...',
      goBack: 'Go Back',
      speakJobTicketInfo: 'Speak your job ticket information',
      extractedData: 'Extracted Information',
      rawTranscription: 'Raw Voice Transcription',
      recognitionQuality: 'Recognition Quality',
      editForm: 'Edit Job Ticket Form',
      noTranscriptionAvailable: 'No transcription available'
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
      selectDate: 'Seleccione una fecha',
      companyName: 'Nombre de la Empresa',
      equipment: 'Equipo Atendido',
      equipmentPlaceholder: 'Ingrese detalles del equipo...',
      workType: 'Tipo de Trabajo',
      customerName: 'Nombre del Cliente',
      submittedBy: 'Enviado Por',
      customerSignature: 'Firma del Cliente',
      location: 'Ubicación / Nombre del Pozo / Arrendamiento / Instalación',
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
        other: 'Otro',
        noParts: 'Aún no se han agregado piezas'
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
      stopRecording: 'Detener Grabación',
      cancelRecording: 'Cancelar Grabación',
      restartRecording: 'Reiniciar Grabación',
      allDoneCreateJobTicket: 'Listo, Crear Boleta',
      processingAudio: 'Procesando audio...',
      goBack: 'Volver',
      speakJobTicketInfo: 'Hable la información de su boleta de trabajo',
      extractedData: 'Información Extraída',
      rawTranscription: 'Transcripción de Voz',
      recognitionQuality: 'Calidad de Reconocimiento',
      editForm: 'Editar Formulario de Boleta de Trabajo',
      noTranscriptionAvailable: 'No hay transcripción disponible'
    }
  }
};
