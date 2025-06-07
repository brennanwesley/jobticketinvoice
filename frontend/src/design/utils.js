/**
 * Design System Utilities
 * 
 * This file provides utility functions for working with the design system.
 * These functions help with creating consistent styles and responsive designs.
 */

import theme from './theme';

/**
 * Creates a responsive style object based on breakpoints
 * @param {Object} styles - Object with breakpoint keys and style values
 * @returns {Object} - CSS-in-JS style object with media queries
 */
export const responsive = (styles) => {
  const result = {};
  
  // Apply base styles (no media query)
  if (styles.base) {
    Object.assign(result, styles.base);
  }
  
  // Apply responsive styles
  Object.entries(styles).forEach(([breakpoint, value]) => {
    if (breakpoint !== 'base' && theme.mediaQueries[breakpoint]) {
      const mediaQuery = theme.mediaQueries[breakpoint].replace('@media ', '');
      result[`@media ${mediaQuery}`] = value;
    }
  });
  
  return result;
};

/**
 * Creates styles for different component variants
 * @param {string} variant - The variant name
 * @param {Object} variants - Object with variant styles
 * @returns {Object} - CSS-in-JS style object for the variant
 */
export const getVariantStyles = (variant, variants) => {
  return variants[variant] || variants.default || {};
};

/**
 * Creates styles for different component sizes
 * @param {string} size - The size name (sm, md, lg)
 * @param {Object} sizes - Object with size styles
 * @returns {Object} - CSS-in-JS style object for the size
 */
export const getSizeStyles = (size, sizes) => {
  return sizes[size] || sizes.md || {};
};

/**
 * Creates a focus ring style
 * @param {string} color - The focus ring color
 * @returns {Object} - CSS-in-JS style object for focus ring
 */
export const focusRing = (color = theme.colors.border.focus) => ({
  outline: 'none',
  boxShadow: `0 0 0 3px ${color}`,
});

/**
 * Creates a visually hidden style (accessible to screen readers but not visible)
 * @returns {Object} - CSS-in-JS style object for visually hidden elements
 */
export const visuallyHidden = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  width: '1px',
  whiteSpace: 'nowrap',
};

/**
 * Creates a truncated text style with ellipsis
 * @param {number} lines - Number of lines to show before truncating
 * @returns {Object} - CSS-in-JS style object for truncated text
 */
export const truncate = (lines = 1) => {
  if (lines === 1) {
    return {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    };
  }
  
  return {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
  };
};

/**
 * Creates a flex container style
 * @param {Object} options - Flex container options
 * @returns {Object} - CSS-in-JS style object for flex container
 */
export const flexContainer = ({
  direction = 'row',
  wrap = 'nowrap',
  justify = 'flex-start',
  align = 'stretch',
  gap = 0,
} = {}) => ({
  display: 'flex',
  flexDirection: direction,
  flexWrap: wrap,
  justifyContent: justify,
  alignItems: align,
  gap: theme.spacing[gap] || gap,
});

/**
 * Creates a grid container style
 * @param {Object} options - Grid container options
 * @returns {Object} - CSS-in-JS style object for grid container
 */
export const gridContainer = ({
  columns = 1,
  rows = 'auto',
  gap = 4,
  columnGap,
  rowGap,
} = {}) => ({
  display: 'grid',
  gridTemplateColumns: typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns,
  gridTemplateRows: rows,
  gap: theme.spacing[gap] || gap,
  columnGap: columnGap ? (theme.spacing[columnGap] || columnGap) : undefined,
  rowGap: rowGap ? (theme.spacing[rowGap] || rowGap) : undefined,
});

/**
 * Creates a style for absolute positioning
 * @param {Object} options - Position options
 * @returns {Object} - CSS-in-JS style object for absolute positioning
 */
export const absolutePosition = ({
  top,
  right,
  bottom,
  left,
} = {}) => ({
  position: 'absolute',
  top: top !== undefined ? (theme.spacing[top] || top) : undefined,
  right: right !== undefined ? (theme.spacing[right] || right) : undefined,
  bottom: bottom !== undefined ? (theme.spacing[bottom] || bottom) : undefined,
  left: left !== undefined ? (theme.spacing[left] || left) : undefined,
});

/**
 * Creates a style for fixed positioning
 * @param {Object} options - Position options
 * @returns {Object} - CSS-in-JS style object for fixed positioning
 */
export const fixedPosition = (options) => ({
  position: 'fixed',
  ...absolutePosition(options),
});

/**
 * Creates a style for sticky positioning
 * @param {Object} options - Position options
 * @returns {Object} - CSS-in-JS style object for sticky positioning
 */
export const stickyPosition = ({
  top = 0,
  zIndex = theme.zIndex.sticky,
} = {}) => ({
  position: 'sticky',
  top: theme.spacing[top] || top,
  zIndex,
});

/**
 * Creates a style for a container with max width and centered
 * @param {string|number} maxWidth - Maximum width of the container
 * @returns {Object} - CSS-in-JS style object for container
 */
export const container = (maxWidth = theme.breakpoints.lg) => ({
  width: '100%',
  maxWidth,
  marginLeft: 'auto',
  marginRight: 'auto',
  paddingLeft: theme.spacing[4],
  paddingRight: theme.spacing[4],
});

/**
 * Creates a style for hiding elements based on breakpoints
 * @param {Array} hideOn - Array of breakpoints to hide on
 * @returns {Object} - CSS-in-JS style object for responsive hiding
 */
export const hideOn = (hideOn = []) => {
  const styles = {};
  
  hideOn.forEach((breakpoint) => {
    if (theme.mediaQueries[breakpoint]) {
      styles[theme.mediaQueries[breakpoint]] = {
        display: 'none',
      };
    }
  });
  
  return styles;
};

/**
 * Creates a style for showing elements based on breakpoints
 * @param {Array} showOn - Array of breakpoints to show on
 * @returns {Object} - CSS-in-JS style object for responsive showing
 */
export const showOn = (showOn = []) => {
  const styles = {
    display: 'none',
  };
  
  showOn.forEach((breakpoint) => {
    if (theme.mediaQueries[breakpoint]) {
      styles[theme.mediaQueries[breakpoint]] = {
        display: 'block',
      };
    }
  });
  
  return styles;
};

/**
 * Creates a style for a skeleton loading state
 * @returns {Object} - CSS-in-JS style object for skeleton loading
 */
export const skeletonLoading = {
  backgroundColor: theme.colors.neutral[200],
  backgroundImage: 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0) 100%)',
  backgroundSize: '200% 100%',
  backgroundRepeat: 'no-repeat',
  borderRadius: theme.borderRadius.base,
  animation: 'skeleton-loading 1.5s infinite',
  '@keyframes skeleton-loading': {
    '0%': {
      backgroundPosition: '200% 0',
    },
    '100%': {
      backgroundPosition: '-200% 0',
    },
  },
};

export default {
  responsive,
  getVariantStyles,
  getSizeStyles,
  focusRing,
  visuallyHidden,
  truncate,
  flexContainer,
  gridContainer,
  absolutePosition,
  fixedPosition,
  stickyPosition,
  container,
  hideOn,
  showOn,
  skeletonLoading,
};
