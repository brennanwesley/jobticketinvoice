import React from 'react';
import theme from '../../design/theme';
import { getVariantStyles, getSizeStyles, focusRing } from '../../design/utils';

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
  
  // Variant styles from theme
  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.button.primary.background,
      color: theme.colors.button.primary.text,
      border: `1px solid ${theme.colors.button.primary.border}`,
      '&:hover': {
        backgroundColor: theme.colors.button.primary.backgroundHover,
      },
      '&:active': {
        backgroundColor: theme.colors.button.primary.backgroundActive,
      },
      '&:focus': {
        ...focusRing(theme.colors.primary[300]),
      },
    },
    secondary: {
      backgroundColor: theme.colors.button.secondary.background,
      color: theme.colors.button.secondary.text,
      border: `1px solid ${theme.colors.button.secondary.border}`,
      '&:hover': {
        backgroundColor: theme.colors.button.secondary.backgroundHover,
      },
      '&:active': {
        backgroundColor: theme.colors.button.secondary.backgroundActive,
      },
      '&:focus': {
        ...focusRing(theme.colors.primary[300]),
      },
    },
    outline: {
      backgroundColor: 'transparent',
      color: theme.colors.text.primary,
      border: `1px solid ${theme.colors.border.primary}`,
      '&:hover': {
        backgroundColor: theme.colors.neutral[50],
      },
      '&:active': {
        backgroundColor: theme.colors.neutral[100],
      },
      '&:focus': {
        ...focusRing(theme.colors.primary[300]),
      },
    },
    danger: {
      backgroundColor: theme.colors.button.danger.background,
      color: theme.colors.button.danger.text,
      border: `1px solid ${theme.colors.button.danger.border}`,
      '&:hover': {
        backgroundColor: theme.colors.button.danger.backgroundHover,
      },
      '&:active': {
        backgroundColor: theme.colors.button.danger.backgroundActive,
      },
      '&:focus': {
        ...focusRing(theme.colors.error[300]),
      },
    },
  };
  
  // Size styles from theme
  const sizeStyles = {
    sm: {
      paddingLeft: theme.components.button.sizes.sm.paddingX,
      paddingRight: theme.components.button.sizes.sm.paddingX,
      paddingTop: theme.components.button.sizes.sm.paddingY,
      paddingBottom: theme.components.button.sizes.sm.paddingY,
      fontSize: theme.components.button.sizes.sm.fontSize,
    },
    md: {
      paddingLeft: theme.components.button.sizes.md.paddingX,
      paddingRight: theme.components.button.sizes.md.paddingX,
      paddingTop: theme.components.button.sizes.md.paddingY,
      paddingBottom: theme.components.button.sizes.md.paddingY,
      fontSize: theme.components.button.sizes.md.fontSize,
    },
    lg: {
      paddingLeft: theme.components.button.sizes.lg.paddingX,
      paddingRight: theme.components.button.sizes.lg.paddingX,
      paddingTop: theme.components.button.sizes.lg.paddingY,
      paddingBottom: theme.components.button.sizes.lg.paddingY,
      fontSize: theme.components.button.sizes.lg.fontSize,
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
