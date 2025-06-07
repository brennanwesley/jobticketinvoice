import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Optimized Image Component
 * 
 * Features:
 * - Lazy loading for improved performance
 * - Loading state with placeholder
 * - Error handling with fallback
 * - Responsive sizing
 * - Blur-up loading effect
 * 
 * @param {Object} props - Component props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alternative text for accessibility
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.fallbackSrc - Fallback image to show on error
 * @param {boolean} props.lazy - Whether to lazy load the image (default: true)
 * @param {string} props.objectFit - CSS object-fit property (default: 'cover')
 * @param {Function} props.onLoad - Callback when image loads
 * @param {Function} props.onError - Callback when image fails to load
 */
const Image = ({
  src,
  alt,
  className = '',
  fallbackSrc = '',
  lazy = true,
  objectFit = 'cover',
  onLoad,
  onError,
  ...rest
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(lazy ? '' : src);
  const imgRef = useRef(null);
  
  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!lazy) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // When image is in viewport
        if (entry.isIntersecting) {
          setCurrentSrc(src);
          observer.disconnect();
        }
      });
    }, {
      rootMargin: '200px 0px', // Start loading when image is 200px from viewport
      threshold: 0.01
    });
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => {
      if (imgRef.current) {
        observer.disconnect();
      }
    };
  }, [src, lazy]);
  
  // Handle image load event
  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };
  
  // Handle image error event
  const handleError = (e) => {
    setHasError(true);
    if (fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
    if (onError) onError(e);
  };
  
  // Combine classes
  const imageClasses = `transition-opacity duration-300 ${objectFit ? `object-${objectFit}` : ''} ${
    isLoaded ? 'opacity-100' : 'opacity-0'
  } ${className}`;
  
  // Placeholder styles
  const placeholderClasses = `absolute inset-0 bg-gray-800 animate-pulse ${
    isLoaded ? 'opacity-0' : 'opacity-100'
  } transition-opacity duration-300`;
  
  return (
    <div className="relative overflow-hidden" style={{ minHeight: '40px' }}>
      {!isLoaded && !hasError && (
        <div className={placeholderClasses} />
      )}
      
      {hasError && !currentSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      )}
      
      <img
        ref={imgRef}
        src={currentSrc || 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='} // Transparent placeholder if no src
        alt={alt}
        className={imageClasses}
        onLoad={handleLoad}
        onError={handleError}
        loading={lazy ? 'lazy' : 'eager'}
        {...rest}
      />
    </div>
  );
};

Image.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  fallbackSrc: PropTypes.string,
  lazy: PropTypes.bool,
  objectFit: PropTypes.string,
  onLoad: PropTypes.func,
  onError: PropTypes.func
};

export default Image;
