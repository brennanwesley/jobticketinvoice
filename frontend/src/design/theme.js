/**
 * Design System Theme
 * 
 * This file defines the theme for the JobTicketInvoice application.
 * It uses the design tokens to create a cohesive theme that can be
 * used throughout the application.
 */

import tokens from './tokens';

// Define semantic mappings for the application
const theme = {
  // Color mappings
  colors: {
    // Background colors
    background: {
      primary: tokens.colors.white,
      secondary: tokens.colors.neutral[50],
      tertiary: tokens.colors.neutral[100],
      inverse: tokens.colors.neutral[900],
      brand: tokens.colors.primary[500],
      brandLight: tokens.colors.primary[100],
      success: tokens.colors.success[100],
      error: tokens.colors.error[100],
      warning: tokens.colors.warning[100],
    },
    
    // Text colors
    text: {
      primary: tokens.colors.neutral[900],
      secondary: tokens.colors.neutral[700],
      tertiary: tokens.colors.neutral[600],
      disabled: tokens.colors.neutral[400],
      inverse: tokens.colors.white,
      brand: tokens.colors.primary[600],
      success: tokens.colors.success[700],
      error: tokens.colors.error[700],
      warning: tokens.colors.warning[700],
    },
    
    // Border colors
    border: {
      primary: tokens.colors.neutral[300],
      secondary: tokens.colors.neutral[200],
      tertiary: tokens.colors.neutral[100],
      focus: tokens.colors.primary[400],
      brand: tokens.colors.primary[500],
      success: tokens.colors.success[500],
      error: tokens.colors.error[500],
      warning: tokens.colors.warning[500],
    },
    
    // Button colors
    button: {
      primary: {
        background: tokens.colors.primary[500],
        backgroundHover: tokens.colors.primary[600],
        backgroundActive: tokens.colors.primary[700],
        text: tokens.colors.white,
        border: tokens.colors.primary[500],
      },
      secondary: {
        background: tokens.colors.white,
        backgroundHover: tokens.colors.neutral[50],
        backgroundActive: tokens.colors.neutral[100],
        text: tokens.colors.primary[500],
        border: tokens.colors.primary[500],
      },
      tertiary: {
        background: 'transparent',
        backgroundHover: tokens.colors.neutral[50],
        backgroundActive: tokens.colors.neutral[100],
        text: tokens.colors.primary[500],
        border: 'transparent',
      },
      danger: {
        background: tokens.colors.error[500],
        backgroundHover: tokens.colors.error[600],
        backgroundActive: tokens.colors.error[700],
        text: tokens.colors.white,
        border: tokens.colors.error[500],
      },
      success: {
        background: tokens.colors.success[500],
        backgroundHover: tokens.colors.success[600],
        backgroundActive: tokens.colors.success[700],
        text: tokens.colors.white,
        border: tokens.colors.success[500],
      },
      warning: {
        background: tokens.colors.warning[500],
        backgroundHover: tokens.colors.warning[600],
        backgroundActive: tokens.colors.warning[700],
        text: tokens.colors.neutral[900],
        border: tokens.colors.warning[500],
      },
    },
    
    // Form element colors
    form: {
      background: tokens.colors.white,
      backgroundDisabled: tokens.colors.neutral[100],
      backgroundHover: tokens.colors.neutral[50],
      backgroundFocus: tokens.colors.white,
      text: tokens.colors.neutral[900],
      textDisabled: tokens.colors.neutral[500],
      placeholder: tokens.colors.neutral[500],
      border: tokens.colors.neutral[300],
      borderHover: tokens.colors.primary[400],
      borderFocus: tokens.colors.primary[500],
      borderError: tokens.colors.error[500],
      borderSuccess: tokens.colors.success[500],
    },
  },
  
  // Typography mappings
  typography: {
    // Headings
    h1: {
      fontFamily: tokens.typography.fontFamily.heading,
      fontSize: tokens.typography.fontSize['4xl'],
      fontWeight: tokens.typography.fontWeight.bold,
      lineHeight: tokens.typography.lineHeight.tight,
      letterSpacing: tokens.typography.letterSpacing.tight,
    },
    h2: {
      fontFamily: tokens.typography.fontFamily.heading,
      fontSize: tokens.typography.fontSize['3xl'],
      fontWeight: tokens.typography.fontWeight.bold,
      lineHeight: tokens.typography.lineHeight.tight,
      letterSpacing: tokens.typography.letterSpacing.tight,
    },
    h3: {
      fontFamily: tokens.typography.fontFamily.heading,
      fontSize: tokens.typography.fontSize['2xl'],
      fontWeight: tokens.typography.fontWeight.semibold,
      lineHeight: tokens.typography.lineHeight.tight,
      letterSpacing: tokens.typography.letterSpacing.normal,
    },
    h4: {
      fontFamily: tokens.typography.fontFamily.heading,
      fontSize: tokens.typography.fontSize.xl,
      fontWeight: tokens.typography.fontWeight.semibold,
      lineHeight: tokens.typography.lineHeight.tight,
      letterSpacing: tokens.typography.letterSpacing.normal,
    },
    h5: {
      fontFamily: tokens.typography.fontFamily.heading,
      fontSize: tokens.typography.fontSize.lg,
      fontWeight: tokens.typography.fontWeight.semibold,
      lineHeight: tokens.typography.lineHeight.tight,
      letterSpacing: tokens.typography.letterSpacing.normal,
    },
    h6: {
      fontFamily: tokens.typography.fontFamily.heading,
      fontSize: tokens.typography.fontSize.base,
      fontWeight: tokens.typography.fontWeight.semibold,
      lineHeight: tokens.typography.lineHeight.tight,
      letterSpacing: tokens.typography.letterSpacing.normal,
    },
    
    // Body text
    body1: {
      fontFamily: tokens.typography.fontFamily.base,
      fontSize: tokens.typography.fontSize.base,
      fontWeight: tokens.typography.fontWeight.normal,
      lineHeight: tokens.typography.lineHeight.normal,
      letterSpacing: tokens.typography.letterSpacing.normal,
    },
    body2: {
      fontFamily: tokens.typography.fontFamily.base,
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.normal,
      lineHeight: tokens.typography.lineHeight.normal,
      letterSpacing: tokens.typography.letterSpacing.normal,
    },
    
    // Other text styles
    caption: {
      fontFamily: tokens.typography.fontFamily.base,
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeight.normal,
      lineHeight: tokens.typography.lineHeight.normal,
      letterSpacing: tokens.typography.letterSpacing.wide,
    },
    button: {
      fontFamily: tokens.typography.fontFamily.base,
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.medium,
      lineHeight: tokens.typography.lineHeight.none,
      letterSpacing: tokens.typography.letterSpacing.wide,
      textTransform: 'uppercase',
    },
    overline: {
      fontFamily: tokens.typography.fontFamily.base,
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeight.medium,
      lineHeight: tokens.typography.lineHeight.none,
      letterSpacing: tokens.typography.letterSpacing.widest,
      textTransform: 'uppercase',
    },
    link: {
      fontFamily: tokens.typography.fontFamily.base,
      fontSize: 'inherit',
      fontWeight: tokens.typography.fontWeight.medium,
      lineHeight: 'inherit',
      letterSpacing: tokens.typography.letterSpacing.normal,
      textDecoration: 'underline',
    },
    code: {
      fontFamily: tokens.typography.fontFamily.mono,
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.normal,
      lineHeight: tokens.typography.lineHeight.normal,
      letterSpacing: tokens.typography.letterSpacing.normal,
    },
  },
  
  // Spacing mappings
  spacing: tokens.spacing,
  
  // Border radius mappings
  borderRadius: tokens.borderRadius,
  
  // Shadow mappings
  shadows: tokens.shadows,
  
  // Z-index mappings
  zIndex: tokens.zIndex,
  
  // Transition mappings
  transitions: tokens.transitions,
  
  // Breakpoint mappings
  breakpoints: tokens.breakpoints,
  
  // Media query mappings
  mediaQueries: tokens.mediaQueries,
  
  // Component-specific theme settings
  components: {
    // Button component theme
    button: {
      borderRadius: tokens.borderRadius.base,
      paddingX: tokens.spacing[4],
      paddingY: tokens.spacing[2],
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.medium,
      transition: `all ${tokens.transitions.duration.normal} ${tokens.transitions.timing.easeInOut}`,
      
      // Button sizes
      sizes: {
        sm: {
          paddingX: tokens.spacing[2],
          paddingY: tokens.spacing[1],
          fontSize: tokens.typography.fontSize.xs,
        },
        md: {
          paddingX: tokens.spacing[4],
          paddingY: tokens.spacing[2],
          fontSize: tokens.typography.fontSize.sm,
        },
        lg: {
          paddingX: tokens.spacing[6],
          paddingY: tokens.spacing[3],
          fontSize: tokens.typography.fontSize.base,
        },
      },
    },
    
    // Input component theme
    input: {
      borderRadius: tokens.borderRadius.base,
      borderWidth: '1px',
      paddingX: tokens.spacing[3],
      paddingY: tokens.spacing[2],
      fontSize: tokens.typography.fontSize.base,
      lineHeight: tokens.typography.lineHeight.normal,
      transition: `all ${tokens.transitions.duration.normal} ${tokens.transitions.timing.easeInOut}`,
      
      // Input sizes
      sizes: {
        sm: {
          paddingX: tokens.spacing[2],
          paddingY: tokens.spacing[1],
          fontSize: tokens.typography.fontSize.sm,
        },
        md: {
          paddingX: tokens.spacing[3],
          paddingY: tokens.spacing[2],
          fontSize: tokens.typography.fontSize.base,
        },
        lg: {
          paddingX: tokens.spacing[4],
          paddingY: tokens.spacing[3],
          fontSize: tokens.typography.fontSize.lg,
        },
      },
    },
    
    // Card component theme
    card: {
      borderRadius: tokens.borderRadius.lg,
      borderWidth: '1px',
      borderColor: tokens.colors.neutral[200],
      backgroundColor: tokens.colors.white,
      boxShadow: tokens.shadows.sm,
      padding: tokens.spacing[4],
      transition: `all ${tokens.transitions.duration.normal} ${tokens.transitions.timing.easeInOut}`,
    },
    
    // Modal component theme
    modal: {
      borderRadius: tokens.borderRadius.lg,
      backgroundColor: tokens.colors.white,
      boxShadow: tokens.shadows.xl,
      padding: tokens.spacing[6],
      backdropColor: 'rgba(0, 0, 0, 0.5)',
      transition: `all ${tokens.transitions.duration.normal} ${tokens.transitions.timing.easeInOut}`,
    },
    
    // Form component theme
    form: {
      spacing: tokens.spacing[4],
      labelMarginBottom: tokens.spacing[1],
      helperTextMarginTop: tokens.spacing[1],
      errorTextColor: tokens.colors.error[500],
    },
  },
};

export default theme;
