/**
 * API Middleware for handling API requests with middleware pattern
 * Provides consistent error handling, logging, caching, and retry logic
 */

// Default middleware options
const defaultOptions = {
  enableLogging: true,
  enableCaching: false,
  cacheDuration: 5 * 60 * 1000, // 5 minutes in milliseconds
  retryCount: 0,
  retryDelay: 1000, // 1 second
};

// In-memory cache for API responses
const apiCache = new Map();

/**
 * Clear the API cache
 * @param {string} [key] - Optional specific cache key to clear
 */
export const clearApiCache = (key) => {
  if (key) {
    apiCache.delete(key);
  } else {
    apiCache.clear();
  }
};

/**
 * Generate a cache key from request details
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {Object} data - Request data
 * @returns {string} Cache key
 */
const generateCacheKey = (endpoint, method, data) => {
  return `${method}:${endpoint}:${JSON.stringify(data || {})}`;
};

/**
 * Check if cached response is still valid
 * @param {Object} cachedItem - Cached item with timestamp
 * @param {number} duration - Cache duration in milliseconds
 * @returns {boolean} True if cache is valid, false otherwise
 */
const isCacheValid = (cachedItem, duration) => {
  if (!cachedItem) return false;
  return Date.now() - cachedItem.timestamp < duration;
};

/**
 * Delay execution for specified milliseconds
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Create an API middleware with specified options
 * @param {Object} customOptions - Custom middleware options
 * @returns {Function} Middleware function
 */
export const createApiMiddleware = (customOptions = {}) => {
  const options = { ...defaultOptions, ...customOptions };
  
  /**
   * Middleware function that wraps API requests
   * @param {Function} apiCall - The API call function to execute
   * @param {Object} params - Parameters for the API call
   * @returns {Promise} API response
   */
  return async (apiCall, params) => {
    const { endpoint, method = 'GET', data = null, requiresAuth = true } = params;
    
    // Generate cache key if caching is enabled
    const cacheKey = options.enableCaching ? generateCacheKey(endpoint, method, data) : null;
    
    // Check cache first if enabled and method is GET
    if (options.enableCaching && method === 'GET' && cacheKey) {
      const cachedResponse = apiCache.get(cacheKey);
      if (isCacheValid(cachedResponse, options.cacheDuration)) {
        if (options.enableLogging) {
          console.log(`[API Cache] Using cached response for ${method} ${endpoint}`);
        }
        return cachedResponse.data;
      }
    }
    
    // Log request if logging is enabled
    if (options.enableLogging) {
      console.log(`[API Request] ${method} ${endpoint}`, data);
      console.time(`[API] ${method} ${endpoint}`);
    }
    
    let attempts = 0;
    let lastError = null;
    
    // Retry logic
    while (attempts <= options.retryCount) {
      try {
        if (attempts > 0 && options.enableLogging) {
          console.log(`[API Retry] Attempt ${attempts} for ${method} ${endpoint}`);
        }
        
        // Execute the API call
        const response = await apiCall(params);
        
        // Log response if logging is enabled
        if (options.enableLogging) {
          console.log(`[API Response] ${method} ${endpoint}`, response);
          console.timeEnd(`[API] ${method} ${endpoint}`);
        }
        
        // Cache successful GET responses if caching is enabled
        if (options.enableCaching && method === 'GET' && cacheKey) {
          apiCache.set(cacheKey, {
            data: response,
            timestamp: Date.now(),
          });
        }
        
        return response;
      } catch (error) {
        lastError = error;
        
        // Log error if logging is enabled
        if (options.enableLogging) {
          console.error(`[API Error] ${method} ${endpoint}`, error);
          if (attempts < options.retryCount) {
            console.log(`[API Retry] Will retry in ${options.retryDelay}ms`);
          }
        }
        
        // If we've reached max retries, throw the error
        if (attempts >= options.retryCount) {
          break;
        }
        
        // Wait before retrying
        await delay(options.retryDelay);
        attempts++;
      }
    }
    
    // If we get here, all retries failed
    if (options.enableLogging) {
      console.timeEnd(`[API] ${method} ${endpoint}`);
    }
    
    throw lastError;
  };
};

/**
 * Default middleware instance with default options
 */
export const apiMiddleware = createApiMiddleware();

export default apiMiddleware;
