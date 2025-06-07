import { useCallback, useRef } from 'react';

/**
 * Custom hook for memoizing callbacks with automatic dependency tracking
 * 
 * This hook is similar to useCallback but automatically tracks dependencies
 * by comparing the function string representation. This helps prevent the
 * "missing dependency" ESLint warnings while still optimizing performance.
 * 
 * @param {Function} callback - The callback function to memoize
 * @returns {Function} - The memoized callback function
 */
const useMemoizedCallback = (callback) => {
  // Store the previous callback and its string representation
  const callbackRef = useRef(null);
  const callbackStringRef = useRef('');
  
  // Convert the current callback to string for comparison
  const currentCallbackString = callback.toString();
  
  // Only update the callback if it has changed
  if (currentCallbackString !== callbackStringRef.current) {
    callbackRef.current = callback;
    callbackStringRef.current = currentCallbackString;
  }
  
  // Return a memoized version of the callback
  return useCallback((...args) => {
    return callbackRef.current(...args);
  }, []);
};

export default useMemoizedCallback;
