import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing a value
 * 
 * This hook delays updating a value until a specified delay has passed
 * since the last change. This is useful for preventing excessive API calls
 * or calculations during rapid user input.
 * 
 * @param {any} value - The value to debounce
 * @param {number} delay - The delay in milliseconds (default: 500ms)
 * @returns {any} - The debounced value
 */
const useDebounce = (value, delay = 500) => {
  // State to hold the debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    // Clean up the timer if the value or delay changes
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

export default useDebounce;
