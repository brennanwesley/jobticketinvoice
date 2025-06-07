/**
 * Voice Parser Utility
 * 
 * Parses transcribed text from voice input and extracts structured data
 * for job ticket form fields.
 */

/**
 * Extract job ticket data from transcribed text
 * @param {string} text - The transcribed text from voice input
 * @returns {Object} - Extracted job ticket data
 */
export const parseJobTicketFromVoice = (text) => {
  if (!text) return {};
  
  // Normalize text for consistent parsing
  const normalizedText = text.toLowerCase().trim();
  
  // Initialize extracted data object
  const extractedData = {};
  
  // Extract company name
  extractedData.companyName = extractCompanyName(normalizedText);
  
  // Extract customer name
  extractedData.customerName = extractCustomerName(normalizedText);
  
  // Extract location
  extractedData.location = extractLocation(normalizedText);
  
  // Extract work type
  extractedData.workType = extractWorkType(normalizedText);
  
  // Extract equipment
  extractedData.equipment = extractEquipment(normalizedText);
  
  // Extract work description
  extractedData.workDescription = extractWorkDescription(normalizedText);
  
  // Extract parts used
  extractedData.partsUsed = extractPartsUsed(normalizedText);
  
  // Extract submitted by
  extractedData.submittedBy = extractSubmittedBy(normalizedText);
  
  // Extract times
  const times = extractTimes(normalizedText);
  if (times.workStartTime) extractedData.workStartTime = times.workStartTime;
  if (times.workEndTime) extractedData.workEndTime = times.workEndTime;
  if (times.driveStartTime) extractedData.driveStartTime = times.driveStartTime;
  if (times.driveEndTime) extractedData.driveEndTime = times.driveEndTime;
  
  // Extract travel type
  extractedData.travelType = extractTravelType(normalizedText);
  
  // Extract job date
  extractedData.jobDate = extractJobDate(normalizedText);
  
  return extractedData;
};

/**
 * Extract company name from text
 */
const extractCompanyName = (text) => {
  // Common patterns for company name
  const patterns = [
    /(?:company|company name|for company|at company|with company)[:\s]+([^.,]+)/i,
    /(?:job|work)(?:\s+is)?(?:\s+for)?(?:\s+company)?[:\s]+([^.,]+)/i,
    /(?:at|for)[:\s]+([^.,]+?)(?:\s+(?:in|at|on|job|work))/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return '';
};

/**
 * Extract customer name from text
 */
const extractCustomerName = (text) => {
  // Common patterns for customer name
  const patterns = [
    /(?:customer|customer name|client|client name)[:\s]+([^.,]+)/i,
    /(?:for|with) customer[:\s]+([^.,]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return '';
};

/**
 * Extract location from text
 */
const extractLocation = (text) => {
  // Common patterns for location
  const patterns = [
    /(?:location|site|address|place|facility|well|lease)[:\s]+([^.,]+)/i,
    /(?:at|in) (?:location|site|address|place|facility|well|lease)[:\s]+([^.,]+)/i,
    /(?:at|in)[:\s]+([^.,]+?)(?:\s+(?:on|for|to|performed|did|completed))/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return '';
};

/**
 * Extract work type from text
 */
const extractWorkType = (text) => {
  // Common patterns for work type
  const patterns = [
    /(?:work type|type of work|job type)[:\s]+([^.,]+)/i,
    /(?:performed|did|completed)[:\s]+([^.,]+?)(?:\s+(?:at|on|for|work|job))/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return '';
};

/**
 * Extract equipment from text
 */
const extractEquipment = (text) => {
  // Common patterns for equipment
  const patterns = [
    /(?:equipment|machine|pump|unit|system)[:\s]+([^.,]+)/i,
    /(?:worked on|serviced|repaired|maintained)[:\s]+([^.,]+?)(?:\s+(?:at|on|for|which|that))/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return '';
};

/**
 * Extract work description from text
 */
const extractWorkDescription = (text) => {
  // Common patterns for work description
  const patterns = [
    /(?:work description|description of work|work performed|job description)[:\s]+([^.]+)/i,
    /(?:performed|did|completed|work included)[:\s]+([^.]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // If no specific description found, use the entire text as fallback
  return text;
};

/**
 * Extract parts used from text
 */
const extractPartsUsed = (text) => {
  const parts = [];
  
  // Common part names to look for
  const commonParts = [
    'lubricant', 'pump seal', 'thrust chamber', 
    'vfd breaker', 'vfd switch', 'service kit', 
    'safety maintenance kit', 'maintenance kit'
  ];
  
  // Check for parts used section
  const partsSection = text.match(/(?:parts used|used parts|parts|replaced|installed)[:\s]+([^.]+)/i);
  
  if (partsSection && partsSection[1]) {
    const partsText = partsSection[1].toLowerCase();
    
    // Check for common parts in the parts section
    commonParts.forEach(part => {
      if (partsText.includes(part)) {
        parts.push(part);
      }
    });
  } else {
    // If no specific parts section, check entire text
    commonParts.forEach(part => {
      if (text.includes(part)) {
        parts.push(part);
      }
    });
  }
  
  return parts;
};

/**
 * Extract submitted by from text
 */
const extractSubmittedBy = (text) => {
  // Common patterns for submitted by
  const patterns = [
    /(?:submitted by|completed by|technician|tech|my name is|this is)[:\s]+([^.,]+)/i,
    /(?:submitted|completed)(?:\s+by)?[:\s]+([^.,]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return '';
};

/**
 * Extract times from text
 */
const extractTimes = (text) => {
  const times = {};
  
  // Time patterns (both 12h and 24h formats)
  const timePattern = /(\d{1,2})(?::(\d{2}))?(?:\s*(am|pm))?/i;
  
  // Work start time
  const workStartMatch = text.match(/(?:work|job)(?:\s+start(?:ed)?|\s+begin|began)(?:\s+at)?[:\s]+([^.,]+)/i);
  if (workStartMatch && workStartMatch[1]) {
    const timeMatch = workStartMatch[1].match(timePattern);
    if (timeMatch) {
      times.workStartTime = formatTimeString(timeMatch);
    }
  }
  
  // Work end time
  const workEndMatch = text.match(/(?:work|job)(?:\s+end(?:ed)?|finished|complete(?:d)?)(?:\s+at)?[:\s]+([^.,]+)/i);
  if (workEndMatch && workEndMatch[1]) {
    const timeMatch = workEndMatch[1].match(timePattern);
    if (timeMatch) {
      times.workEndTime = formatTimeString(timeMatch);
    }
  }
  
  // Drive/travel start time
  const driveStartMatch = text.match(/(?:drive|travel|trip)(?:\s+start(?:ed)?|\s+begin|began)(?:\s+at)?[:\s]+([^.,]+)/i);
  if (driveStartMatch && driveStartMatch[1]) {
    const timeMatch = driveStartMatch[1].match(timePattern);
    if (timeMatch) {
      times.driveStartTime = formatTimeString(timeMatch);
    }
  }
  
  // Drive/travel end time
  const driveEndMatch = text.match(/(?:drive|travel|trip)(?:\s+end(?:ed)?|finished|complete(?:d)?)(?:\s+at)?[:\s]+([^.,]+)/i);
  if (driveEndMatch && driveEndMatch[1]) {
    const timeMatch = driveEndMatch[1].match(timePattern);
    if (timeMatch) {
      times.driveEndTime = formatTimeString(timeMatch);
    }
  }
  
  return times;
};

/**
 * Format time string to HH:MM format
 */
const formatTimeString = (timeMatch) => {
  let hours = parseInt(timeMatch[1], 10);
  const minutes = timeMatch[2] ? timeMatch[2] : '00';
  const ampm = timeMatch[3] ? timeMatch[3].toLowerCase() : null;
  
  // Convert to 24-hour format if needed
  if (ampm === 'pm' && hours < 12) {
    hours += 12;
  } else if (ampm === 'am' && hours === 12) {
    hours = 0;
  }
  
  // Format as HH:MM
  return `${hours.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};

/**
 * Extract travel type from text
 */
const extractTravelType = (text) => {
  if (text.includes('one way') || text.includes('oneway') || text.includes('one-way')) {
    return 'oneWay';
  } else if (text.includes('round trip') || text.includes('roundtrip') || text.includes('round-trip')) {
    return 'roundTrip';
  }
  
  return '';
};

/**
 * Extract job date from text
 */
const extractJobDate = (text) => {
  // Common date patterns
  const datePattern = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/;
  const dateTextPattern = /(?:date|job date|on)[:\s]+([^.,]+)/i;
  
  // Check for date in format MM/DD/YYYY or similar
  const dateMatch = text.match(datePattern);
  if (dateMatch) {
    const month = parseInt(dateMatch[1], 10);
    const day = parseInt(dateMatch[2], 10);
    let year = parseInt(dateMatch[3], 10);
    
    // Fix two-digit years
    if (year < 100) {
      year += 2000;
    }
    
    // Format as YYYY-MM-DD for input[type="date"]
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }
  
  // Check for date mentioned in text
  const dateTextMatch = text.match(dateTextPattern);
  if (dateTextMatch && dateTextMatch[1]) {
    // Try to parse the date text - this is a simplified approach
    const dateText = dateTextMatch[1].toLowerCase();
    
    // Check for "today", "yesterday", etc.
    const today = new Date();
    
    if (dateText.includes('today')) {
      return formatDateString(today);
    } else if (dateText.includes('yesterday')) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return formatDateString(yesterday);
    } else if (dateText.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return formatDateString(tomorrow);
    }
  }
  
  // Default to today's date if no date found
  return formatDateString(new Date());
};

/**
 * Format date as YYYY-MM-DD
 */
const formatDateString = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};
