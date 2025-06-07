import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * VirtualList Component
 * 
 * A performance-optimized list component that only renders items currently visible
 * in the viewport, significantly improving performance for large lists.
 * 
 * @param {Object} props - Component props
 * @param {Array} props.items - Array of items to render
 * @param {Function} props.renderItem - Function to render each item
 * @param {number} props.itemHeight - Height of each item in pixels
 * @param {number} props.overscan - Number of items to render outside of viewport (default: 5)
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.containerStyle - Additional styles for the container
 */
const VirtualList = ({
  items = [],
  renderItem,
  itemHeight = 50,
  overscan = 5,
  className = '',
  containerStyle = {},
  ...rest
}) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  
  // Update container height on resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };
    
    // Initial height
    updateHeight();
    
    // Add resize observer
    const resizeObserver = new ResizeObserver(updateHeight);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    // Cleanup
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);
  
  // Handle scroll events
  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };
  
  // Calculate which items should be visible
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  // Get visible items
  const visibleItems = items.slice(startIndex, endIndex + 1);
  
  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ ...containerStyle, position: 'relative' }}
      onScroll={handleScroll}
      {...rest}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => (
          <div
            key={startIndex + index}
            style={{
              position: 'absolute',
              top: (startIndex + index) * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {renderItem(item, startIndex + index)}
          </div>
        ))}
      </div>
    </div>
  );
};

VirtualList.propTypes = {
  items: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
  itemHeight: PropTypes.number,
  overscan: PropTypes.number,
  className: PropTypes.string,
  containerStyle: PropTypes.object
};

export default VirtualList;
