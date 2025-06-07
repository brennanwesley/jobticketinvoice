import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook for prefetching routes
 * 
 * This hook prefetches components for specified routes to improve navigation performance.
 * It uses React.lazy's preload capability (if available) or a simple import() to trigger
 * the prefetch.
 * 
 * @param {Object} routes - Object mapping route paths to their lazy-loaded components
 * @param {Array} excludePaths - Array of paths to exclude from prefetching
 */
const usePrefetchRoute = (routes, excludePaths = []) => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    // Don't prefetch if we're on an excluded path
    if (excludePaths.includes(pathname)) {
      return;
    }
    
    // Get all route paths except the current one
    const routesToPrefetch = Object.entries(routes).filter(
      ([path]) => path !== pathname
    );
    
    // Prefetch each route
    routesToPrefetch.forEach(([_, component]) => {
      // Try to use the preload method if available (React 18+)
      if (component.preload) {
        component.preload();
      } else {
        // Fallback to a simple dynamic import to trigger prefetch
        const modulePathMatch = component.toString().match(/"([^"]+)"/);
        if (modulePathMatch && modulePathMatch[1]) {
          import(/* webpackPrefetch: true */ modulePathMatch[1]).catch(() => {
            // Silently catch any errors during prefetching
            // This is just a performance optimization, not critical functionality
          });
        }
      }
    });
  }, [pathname, routes, excludePaths]);
};

export default usePrefetchRoute;
