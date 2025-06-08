import React, { useState, useEffect, useRef } from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../context/LanguageContext';

// Create a simplified version of the Input component for date input
const DateInputField = ({
  id,
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  error,
  value,
  onChange,
  onBlur,
  onFocus,
  suffix,
  className = '',
  ...rest
}) => {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative mt-1">
        <input
          id={id}
          name={name}
          type="text"
          className={`bg-gray-800 block w-full rounded-md border-2 border-orange-400 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm ${className} ${error ? 'border-red-500' : ''}`}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          {...rest}
        />
        
        {/* Suffix (calendar icon) */}
        {suffix && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {suffix}
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};

/**
 * DateInput - A specialized input component for date selection
 * Supports both keyboard entry and calendar picker on desktop
 * Uses native date pickers on mobile with year locked to 2025
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Input ID
 * @param {string} props.name - Input name
 * @param {string} props.label - Input label
 * @param {boolean} props.required - Whether input is required
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {boolean} props.readOnly - Whether input is read-only
 * @param {string} props.error - Error message
 * @param {Object} props.register - React Hook Form register function
 * @param {Function} props.setValue - React Hook Form setValue function
 * @param {Function} props.onChange - Change handler function
 */
const DateInput = ({
  id,
  name,
  label,
  required = false,
  disabled = false,
  readOnly = false,
  error,
  register,
  setValue,
  onChange,
  ...rest
}) => {
  const { t } = useLanguage();
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [inputValue, setInputValue] = useState('');
  const calendarRef = useRef(null);
  const inputRef = useRef(null);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle date selection from calendar
  const handleDateSelect = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setShowCalendar(false);
    
    // Format date for display (MM/DD/YYYY)
    if (date) {
      const [year, month, day] = date.split('-');
      const formattedDate = `${month}/${day}/${year}`;
      setInputValue(formattedDate);
    }
    
    // Update form value if using React Hook Form
    if (setValue) {
      setValue(name, date, { shouldValidate: true });
    }
    
    // Call custom onChange if provided
    if (onChange) {
      const event = {
        target: {
          name,
          value: date
        }
      };
      onChange(event);
    }
  };
  
  // Handle manual input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Try to parse the date from MM/DD/YYYY format
    if (value && value.length >= 8) {
      const parts = value.split('/');
      if (parts.length === 3) {
        const month = parts[0].padStart(2, '0');
        const day = parts[1].padStart(2, '0');
        let year = parts[2];
        
        // Force year to be 2025
        year = '2025';
        
        const isoDate = `${year}-${month}-${day}`;
        setSelectedDate(isoDate);
        
        // Update form value
        if (setValue) {
          setValue(name, isoDate, { shouldValidate: true });
        }
      }
    }
  };
  
  // Toggle calendar visibility
  const toggleCalendar = () => {
    if (!disabled && !readOnly) {
      setShowCalendar(!showCalendar);
    }
  };
  
  // Create a custom suffix with calendar icon
  const calendarSuffix = (
    <div 
      className="cursor-pointer" 
      onClick={toggleCalendar}
      aria-label="Open date picker"
    >
      <CalendarIcon className="h-5 w-5 text-gray-400" />
    </div>
  );
  
  // For mobile devices, use the native date picker with year locked to 2025
  if (isMobile) {
    return (
      <div className="relative">
        <label htmlFor={id} className="block text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="mt-1 relative">
          <input
            id={id}
            name={name}
            type="date"
            className={`bg-gray-800 block w-full rounded-md border-2 border-orange-400 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm ${error ? 'border-red-500' : ''}`}
            disabled={disabled}
            readOnly={readOnly}
            onChange={(e) => {
              // Extract date components
              const dateValue = e.target.value;
              if (dateValue) {
                // Force year to be 2025 for mobile
                const [year, month, day] = dateValue.split('-');
                const fixedDate = `2025-${month}-${day}`;
                
                // Update with fixed date
                if (setValue) {
                  setValue(name, fixedDate, { shouldValidate: true });
                }
                
                setSelectedDate(fixedDate);
                
                // Format for display
                const formattedDate = `${month}/${day}/2025`;
                setInputValue(formattedDate);
                
                // Call custom onChange if provided
                if (onChange) {
                  const modifiedEvent = {
                    target: {
                      name,
                      value: fixedDate
                    }
                  };
                  onChange(modifiedEvent);
                }
              }
            }}
            {...(register && register(name))}
            {...rest}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {calendarSuffix}
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
  
  // For desktop, show calendar popup
  return (
    <div className="relative">
      <DateInputField
        id={id}
        name={name}
        label={label}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        error={error}
        value={inputValue}
        onChange={handleInputChange}
        suffix={calendarSuffix}
        placeholder="MM/DD/YYYY"
        {...(register && { ...register(name) })}
        {...rest}
      />
      
      {showCalendar && (
        <div 
          ref={calendarRef}
          className="absolute z-10 mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg p-4"
        >
          <div className="text-white text-sm mb-2">{t('jobTicket.selectDate') || 'Select a date'}</div>
          <input
            type="date"
            className="bg-gray-800 text-white border border-gray-700 rounded-md p-2"
            onChange={handleDateSelect}
            // Lock year to 2025 for desktop calendar
            min="2025-01-01"
            max="2025-12-31"
            defaultValue="2025-06-08" // Set today's date as default
          />
        </div>
      )}
    </div>
  );
};

export default DateInput;
