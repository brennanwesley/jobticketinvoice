import { useState, useEffect } from 'react';

/**
 * Custom hook for using localStorage with React state
 * 
 * This hook synchronizes a React state value with localStorage,
 * allowing for persistent data across page refreshes while maintaining
 * the React state update pattern.
 * 
 * @param {string} key - The localStorage key to use
 * @param {any} initialValue - The initial value if no value exists in localStorage
 * @returns {Array} - [storedValue, setValue] similar to useState
 */
const useLocalStorage = (key, initialValue) => {
  // Create state to store the value
  // Pass a function to useState so the function is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      
      // Parse stored json or return initialValue if none
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error, return initialValue
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  // Effect to update localStorage when the state changes
  useEffect(() => {
    try {
      // Allow value to be a function like useState setter
      const valueToStore = 
        typeof storedValue === 'function' 
          ? storedValue(storedValue) 
          : storedValue;
          
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // Log errors
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);
  
  // Return a wrapped version of useState's setter function that
  // also persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function like useState setter
      const valueToStore = 
        typeof value === 'function' 
          ? value(storedValue) 
          : value;
          
      // Save state
      setStoredValue(valueToStore);
    } catch (error) {
      console.error(`Error setting value for localStorage key "${key}":`, error);
    }
  };
  
  return [storedValue, setValue];
};

export default useLocalStorage;
