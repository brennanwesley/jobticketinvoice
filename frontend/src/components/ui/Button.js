import React from 'react';
import importedTheme from '../../design/theme';
import { getVariantStyles, getSizeStyles, focusRing } from '../../design/utils';

// Create a safe theme object with comprehensive fallbacks to prevent rendering errors
const theme = importedTheme || {};

// Ensure all required theme properties exist with complete fallback structure
theme.colors = theme.colors || {};
theme.colors.primary = theme.colors.primary || {};
theme.colors.primary[300] = theme.colors.primary[300] || '#60a5fa';
theme.colors.error = theme.colors.error || {};
theme.colors.error[300] = theme.colors.error[300] || '#f87171';
theme.colors.text = theme.colors.text || {};
theme.colors.text.primary = theme.colors.text.primary || '#111827';
theme.colors.neutral = theme.colors.neutral || {};
theme.colors.neutral[50] = theme.colors.neutral[50] || '#f9fafb';
theme.colors.neutral[100] = theme.colors.neutral[100] || '#f3f4f6';
theme.colors.border = theme.colors.border || {};
theme.colors.border.primary = theme.colors.border.primary || '#d1d5db';

// Ensure typography properties exist
theme.typography = theme.typography || {};
theme.typography.button = theme.typography.button || {};
theme.typography.button.fontFamily = theme.typography.button.fontFamily || "'Inter', sans-serif";
theme.typography.button.fontSize = theme.typography.button.fontSize || '0.875rem';
theme.typography.button.fontWeight = theme.typography.button.fontWeight || 500;
theme.typography.button.lineHeight = theme.typography.button.lineHeight || 1;
theme.typography.button.letterSpacing = theme.typography.button.letterSpacing || '0.025em';

// Ensure component properties exist
theme.components = theme.components || {};
theme.components.button = theme.components.button || {};
theme.components.button.borderRadius = theme.components.button.borderRadius || '0.25rem';
theme.components.button.transition = theme.components.button.transition || 'all 150ms ease-in-out';
theme.components.button.sizes = theme.components.button.sizes || {};
theme.components.button.sizes.sm = theme.components.button.sizes.sm || {
  paddingX: '0.5rem',
  paddingY: '0.25rem',
  fontSize: '0.75rem'
};
theme.components.button.sizes.md = theme.components.button.sizes.md || {
  paddingX: '0.75rem',
  paddingY: '0.5rem',
  fontSize: '0.875rem'
};
theme.components.button.sizes.lg = theme.components.button.sizes.lg || {
  paddingX: '1rem',
  paddingY: '0.75rem',
  fontSize: '1rem'
};

// Button-specific theme properties
theme.colors.button = theme.colors.button || {};
theme.colors.button.primary = theme.colors.button.primary || {
  background: '#3b82f6',
  backgroundHover: '#2563eb',
  backgroundActive: '#1d4ed8',
  text: '#ffffff',
  border: '#3b82f6'
};

theme.colors.button.secondary = theme.colors.button.secondary || {
  background: '#f3f4f6',
  backgroundHover: '#e5e7eb',
  backgroundActive: '#d1d5db',
  text: '#1f2937',
  border: '#d1d5db'
};

theme.colors.button.outline = theme.colors.button.outline || {
  background: 'transparent',
  backgroundHover: '#f3f4f6',
  backgroundActive: '#e5e7eb',
  text: '#4b5563',
  border: '#d1d5db'
};

theme.colors.button.danger = theme.colors.button.danger || {
  background: '#ef4444',
  backgroundHover: '#dc2626',
  backgroundActive: '#b91c1c',
  text: '#ffffff',
  border: '#ef4444'
};

theme.colors.button.success = theme.colors.button.success || {
  background: '#10b981',
  backgroundHover: '#059669',
  backgroundActive: '#047857',
  text: '#ffffff',
  border: '#10b981'
};

/**
 * Button component - A reusable button component with various styles
 * 
 * @param {Object} props - Component props
 * @param {string} props.variant - Button style variant: 'primary', 'secondary', 'outline', 'danger'
 * @param {string} props.size - Button size: 'sm', 'md', 'lg'
 * @param {boolean} props.fullWidth - Whether button should take full width
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {Function} props.onClick - Click handler function
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.type - Button type: 'button', 'submit', 'reset'
 * @param {string} props.className - Additional CSS classes
 */
const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  disabled = false, 
  onClick, 
  children, 
  type = 'button',
  className = '',
  ...rest 
}) => {
  // Base styles from theme
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: theme.typography.button.fontFamily,
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    lineHeight: theme.typography.button.lineHeight,
    letterSpacing: theme.typography.button.letterSpacing,
    borderRadius: theme.components.button.borderRadius,
    transition: theme.components.button.transition,
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
  };
  
  // Variant styles from theme with safe access patterns
  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.button?.primary?.background || '#3b82f6',
      color: theme.colors.button?.primary?.text || '#ffffff',
      border: `1px solid ${theme.colors.button?.primary?.border || '#3b82f6'}`,
      '&:hover': {
        backgroundColor: theme.colors.button?.primary?.backgroundHover || '#2563eb',
      },
      '&:active': {
        backgroundColor: theme.colors.button?.primary?.backgroundActive || '#1d4ed8',
      },
      '&:focus': {
        ...focusRing(theme.colors.primary?.[300] || '#60a5fa'),
      },
    },
    success: {
      backgroundColor: theme.colors.button?.success?.background || '#10b981',
      color: theme.colors.button?.success?.text || '#ffffff',
      border: `1px solid ${theme.colors.button?.success?.border || '#10b981'}`,
      '&:hover': {
        backgroundColor: theme.colors.button?.success?.backgroundHover || '#059669',
      },
      '&:active': {
        backgroundColor: theme.colors.button?.success?.backgroundActive || '#047857',
      },
      '&:focus': {
        ...focusRing('#34d399'),
      },
    },
    secondary: {
      backgroundColor: theme.colors.button?.secondary?.background || '#f3f4f6',
      color: theme.colors.button?.secondary?.text || '#1f2937',
      border: `1px solid ${theme.colors.button?.secondary?.border || '#d1d5db'}`,
      '&:hover': {
        backgroundColor: theme.colors.button?.secondary?.backgroundHover || '#e5e7eb',
      },
      '&:active': {
        backgroundColor: theme.colors.button?.secondary?.backgroundActive || '#d1d5db',
      },
      '&:focus': {
        ...focusRing(theme.colors.primary?.[300] || '#60a5fa'),
      },
    },
    outline: {
      backgroundColor: 'transparent',
      color: theme.colors.text?.primary || '#4b5563',
      border: `1px solid ${theme.colors.border?.primary || '#d1d5db'}`,
      '&:hover': {
        backgroundColor: theme.colors.neutral?.[50] || '#f9fafb',
      },
      '&:active': {
        backgroundColor: theme.colors.neutral?.[100] || '#f3f4f6',
      },
      '&:focus': {
        ...focusRing(theme.colors.primary?.[300] || '#60a5fa'),
      },
    },
    danger: {
      backgroundColor: theme.colors.button?.danger?.background || '#ef4444',
      color: theme.colors.button?.danger?.text || '#ffffff',
      border: `1px solid ${theme.colors.button?.danger?.border || '#ef4444'}`,
      '&:hover': {
        backgroundColor: theme.colors.button?.danger?.backgroundHover || '#dc2626',
      },
      '&:active': {
        backgroundColor: theme.colors.button?.danger?.backgroundActive || '#b91c1c',
      },
      '&:focus': {
        ...focusRing(theme.colors.error?.[300] || '#f87171'),
      },
    },
  };
  
  // Size styles from theme with safe access patterns
  const sizeStyles = {
    sm: {
      paddingLeft: theme.components?.button?.sizes?.sm?.paddingX || '0.5rem',
      paddingRight: theme.components?.button?.sizes?.sm?.paddingX || '0.5rem',
      paddingTop: theme.components?.button?.sizes?.sm?.paddingY || '0.25rem',
      paddingBottom: theme.components?.button?.sizes?.sm?.paddingY || '0.25rem',
      fontSize: theme.components?.button?.sizes?.sm?.fontSize || '0.75rem',
    },
    md: {
      paddingLeft: theme.components?.button?.sizes?.md?.paddingX || '0.75rem',
      paddingRight: theme.components?.button?.sizes?.md?.paddingX || '0.75rem',
      paddingTop: theme.components?.button?.sizes?.md?.paddingY || '0.5rem',
      paddingBottom: theme.components?.button?.sizes?.md?.paddingY || '0.5rem',
      fontSize: theme.components?.button?.sizes?.md?.fontSize || '0.875rem',
    },
    lg: {
      paddingLeft: theme.components?.button?.sizes?.lg?.paddingX || '1rem',
      paddingRight: theme.components?.button?.sizes?.lg?.paddingX || '1rem',
      paddingTop: theme.components?.button?.sizes?.lg?.paddingY || '0.75rem',
      paddingBottom: theme.components?.button?.sizes?.lg?.paddingY || '0.75rem',
      fontSize: theme.components?.button?.sizes?.lg?.fontSize || '1rem',
    },
  };
  
  // Width styles
  const widthStyles = fullWidth ? { width: '100%' } : {};
  
  // Disabled styles
  const disabledStyles = disabled ? {
    opacity: 0.5,
    cursor: 'not-allowed',
    pointerEvents: 'none',
  } : {};
  
  // Combine all styles
  const buttonStyles = {
    ...baseStyles,
    ...getVariantStyles(variant, variantStyles),
    ...getSizeStyles(size, sizeStyles),
    ...widthStyles,
    ...disabledStyles,
  };
  
  // Map our design system to Tailwind classes for compatibility with existing code
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Variant classes based on our design system
  const variantClasses = {
    primary: 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'text-blue-700 bg-white border border-blue-500 hover:bg-blue-50 focus:ring-blue-500',
    outline: 'text-gray-700 bg-transparent border border-gray-300 hover:bg-gray-50 focus:ring-blue-500',
    danger: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500',
  };
  
  // Size classes based on our design system
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Disabled classes
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  // Combine all classes
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${disabledClasses} ${className}`;
  
  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
