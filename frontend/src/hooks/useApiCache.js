import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for API data caching and optimized fetching
 * 
 * Features:
 * - In-memory caching of API responses
 * - Configurable cache expiration
 * - Automatic refetching of stale data
 * - Loading and error states
 * - Support for forced refresh
 * 
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Configuration options
 * @param {number} options.cacheTime - Time in milliseconds to keep data in cache (default: 5 minutes)
 * @param {boolean} options.enabled - Whether to enable the fetch (default: true)
 * @param {Function} options.onSuccess - Callback function when fetch is successful
 * @param {Function} options.onError - Callback function when fetch fails
 * @param {Object} options.headers - Additional headers to include in the request
 * @returns {Object} - { data, isLoading, error, refetch }
 */
const useApiCache = (url, options = {}) => {
  // Default options
  const {
    cacheTime = 5 * 60 * 1000, // 5 minutes
    enabled = true,
    onSuccess,
    onError,
    headers = {},
  } = options;

  // States
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // In-memory cache (shared across hook instances)
  const cacheRef = useRef(useApiCache.cache || {});
  
  // Initialize cache if not already done
  if (!useApiCache.cache) {
    useApiCache.cache = {};
  }

  // Fetch data function
  const fetchData = useCallback(async (skipCache = false) => {
    // Skip if disabled
    if (!enabled) return;
    
    // Check cache first (unless skipCache is true)
    const cacheKey = url;
    const cachedData = useApiCache.cache[cacheKey];
    const now = Date.now();
    
    if (!skipCache && cachedData && (now - cachedData.timestamp) < cacheTime) {
      setData(cachedData.data);
      return;
    }
    
    // Set loading state
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch data from API
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });
      
      // Handle non-2xx responses
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      // Parse JSON response
      const result = await response.json();
      
      // Update cache
      useApiCache.cache[cacheKey] = {
        data: result,
        timestamp: Date.now(),
      };
      
      // Update state
      setData(result);
      setLastFetchTime(Date.now());
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      // Handle error
      setError(err.message || 'An error occurred while fetching data');
      
      // Call onError callback if provided
      if (onError) {
        onError(err);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [url, cacheTime, enabled, onSuccess, onError, headers]);
  
  // Force refetch function (skips cache)
  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);
  
  // Initial fetch and refetch when dependencies change
  useEffect(() => {
    fetchData();
    
    // Set up interval to check for stale data
    const intervalId = setInterval(() => {
      const now = Date.now();
      if (now - lastFetchTime > cacheTime) {
        fetchData();
      }
    }, Math.min(cacheTime, 60000)); // Check at most once per minute
    
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchData, cacheTime, lastFetchTime]);
  
  return { data, isLoading, error, refetch };
};

// Static cache property
useApiCache.cache = {};

// Clear cache method
useApiCache.clearCache = (url) => {
  if (url) {
    delete useApiCache.cache[url];
  } else {
    useApiCache.cache = {};
  }
};

export default useApiCache;
