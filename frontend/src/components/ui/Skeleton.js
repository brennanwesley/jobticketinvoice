import React from 'react';
import theme from '../../design/theme';
import { skeletonLoading } from '../../design/utils';

/**
 * Skeleton component - A loading placeholder with animation
 * 
 * @param {Object} props - Component props
 * @param {string} props.variant - Shape variant: 'text', 'circle', 'rect', 'card'
 * @param {string|number} props.width - Width of the skeleton
 * @param {string|number} props.height - Height of the skeleton
 * @param {number} props.count - Number of skeleton items to render
 * @param {string} props.className - Additional CSS classes
 */
const Skeleton = ({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
  ...rest
}) => {
  // Base styles for the skeleton
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  // Variant-specific classes
  const variantClasses = {
    text: 'h-4 rounded',
    circle: 'rounded-full',
    rect: 'rounded-md',
    card: 'rounded-lg',
  };
  
  // Determine dimensions based on variant if not explicitly provided
  const getDefaultDimensions = () => {
    switch (variant) {
      case 'text':
        return { width: width || '100%', height: height || '1rem' };
      case 'circle':
        return { width: width || '3rem', height: height || '3rem' };
      case 'rect':
        return { width: width || '100%', height: height || '6rem' };
      case 'card':
        return { width: width || '100%', height: height || '12rem' };
      default:
        return { width: width || '100%', height: height || '1rem' };
    }
  };
  
  const dimensions = getDefaultDimensions();
  const style = {
    width: dimensions.width,
    height: dimensions.height,
    ...skeletonLoading,
  };
  
  // Generate multiple skeleton items if count > 1
  const renderSkeletons = () => {
    return Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        style={style}
        {...rest}
      />
    ));
  };
  
  return (
    <div className="flex flex-col gap-2">
      {renderSkeletons()}
    </div>
  );
};

/**
 * SkeletonText component - A specialized skeleton for text content
 * 
 * @param {Object} props - Component props
 * @param {number} props.lines - Number of text lines to render
 * @param {string} props.className - Additional CSS classes
 */
export const SkeletonText = ({
  lines = 3,
  className = '',
  ...rest
}) => {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 && lines > 1 ? '70%' : '100%'}
          className={className}
          {...rest}
        />
      ))}
    </div>
  );
};

/**
 * SkeletonCard component - A specialized skeleton for card content
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.hasImage - Whether to include an image placeholder
 * @param {number} props.lines - Number of text lines to render
 * @param {string} props.className - Additional CSS classes
 */
export const SkeletonCard = ({
  hasImage = true,
  lines = 3,
  className = '',
  ...rest
}) => {
  return (
    <div className={`border border-gray-200 rounded-lg p-4 ${className}`}>
      {hasImage && (
        <Skeleton
          variant="rect"
          height="8rem"
          className="mb-4"
          {...rest}
        />
      )}
      <SkeletonText lines={lines} {...rest} />
    </div>
  );
};

/**
 * SkeletonTable component - A specialized skeleton for table content
 * 
 * @param {Object} props - Component props
 * @param {number} props.rows - Number of table rows
 * @param {number} props.columns - Number of table columns
 * @param {string} props.className - Additional CSS classes
 */
export const SkeletonTable = ({
  rows = 5,
  columns = 4,
  className = '',
  ...rest
}) => {
  return (
    <div className={`w-full ${className}`}>
      {/* Header row */}
      <div className="flex gap-2 mb-4">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton
            key={`header-${index}`}
            variant="text"
            height="1.5rem"
            className="flex-1"
            {...rest}
          />
        ))}
      </div>
      
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-2 mb-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              variant="text"
              className="flex-1"
              {...rest}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
