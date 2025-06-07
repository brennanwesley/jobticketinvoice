/**
 * TypeScript type definitions for the design system theme
 */

/**
 * Color palette
 */
export interface ColorPalette {
  primary: string;
  secondary: string;
  tertiary: string;
  inverse: string;
  brand: string;
  brandLight: string;
  success: string;
  error: string;
  errorLight: string;
  warning: string;
}

/**
 * Text colors
 */
export interface TextColors {
  primary: string;
  secondary: string;
  tertiary: string;
  disabled: string;
  inverse: string;
  error: string;
  success: string;
  warning: string;
  onError: string;
}

/**
 * Background colors
 */
export interface BackgroundColors extends ColorPalette {
  default: string;
  paper: string;
  disabled: string;
}

/**
 * Border colors
 */
export interface BorderColors extends ColorPalette {
  default: string;
  light: string;
  focus: string;
}

/**
 * Button colors
 */
export interface ButtonColors {
  primary: {
    background: string;
    backgroundHover: string;
    backgroundActive: string;
    text: string;
    border: string;
  };
  secondary: {
    background: string;
    backgroundHover: string;
    backgroundActive: string;
    text: string;
    border: string;
  };
  tertiary: {
    background: string;
    backgroundHover: string;
    backgroundActive: string;
    text: string;
    border: string;
  };
  danger: {
    background: string;
    backgroundHover: string;
    backgroundActive: string;
    text: string;
    border: string;
  };
  success: {
    background: string;
    backgroundHover: string;
    backgroundActive: string;
    text: string;
    border: string;
  };
  warning: {
    background: string;
    backgroundHover: string;
    backgroundActive: string;
    text: string;
    border: string;
  };
  primaryText: string;
}

/**
 * Typography styles
 */
export interface TypographyStyles {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: string;
}

/**
 * Typography
 */
export interface Typography {
  h1: TypographyStyles;
  h2: TypographyStyles;
  h3: TypographyStyles;
  h4: TypographyStyles;
  h5: TypographyStyles;
  h6: TypographyStyles;
  subtitle1: TypographyStyles;
  subtitle2: TypographyStyles;
  body1: TypographyStyles;
  body2: TypographyStyles;
  button: TypographyStyles;
  caption: TypographyStyles;
  overline: TypographyStyles;
  code: TypographyStyles;
  fontSize: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  fontWeight: {
    light: number;
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}

/**
 * Spacing
 */
export interface Spacing {
  [key: number]: string;
}

/**
 * Shadows
 */
export interface Shadows {
  none: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

/**
 * Border radius
 */
export interface BorderRadius {
  none: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  circle: string;
}

/**
 * Transitions
 */
export interface Transitions {
  duration: {
    instant: string;
    fast: string;
    normal: string;
    slow: string;
  };
  timing: {
    ease: string;
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

/**
 * Z-index
 */
export interface ZIndex {
  dropdown: number;
  sticky: number;
  fixed: number;
  modal: number;
  popover: number;
  tooltip: number;
  toast: number;
}

/**
 * Theme
 */
export interface Theme {
  colors: {
    text: TextColors;
    background: BackgroundColors;
    border: BorderColors;
    button: ButtonColors;
  };
  typography: Typography;
  spacing: Spacing;
  shadows: Shadows;
  borderRadius: BorderRadius;
  transitions: Transitions;
  zIndex: ZIndex;
  mode: 'light' | 'dark';
}
