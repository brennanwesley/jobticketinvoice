/**
 * TypeScript type definitions for form components
 */
import { ReactNode } from 'react';
import { SizeVariant, ValidationErrors, ValidationFunction, VisualVariant } from './common';

/**
 * Form section definition
 */
export interface FormSection {
  /** Section title */
  title: string;
  /** Section description */
  description?: string;
  /** Fields included in this section */
  fields: string[];
  /** Whether the section is collapsible */
  collapsible?: boolean;
  /** Whether the section is expanded by default (when collapsible) */
  defaultExpanded?: boolean;
}

/**
 * Form props
 */
export interface FormProps {
  /** Form children (form fields) */
  children: ReactNode;
  /** Form submission handler */
  onSubmit: (values: Record<string, any>) => void;
  /** Initial form values */
  initialValues?: Record<string, any>;
  /** Form validation function */
  validate?: (values: Record<string, any>) => ValidationErrors;
  /** Whether to validate on change */
  validateOnChange?: boolean;
  /** Whether to validate on blur */
  validateOnBlur?: boolean;
  /** Whether the form is in loading state */
  loading?: boolean;
  /** Form-level error message */
  error?: string;
  /** Success message to display after submission */
  successMessage?: string;
  /** Text for the submit button */
  submitText?: string;
  /** Whether to use progressive disclosure */
  useProgressiveDisclosure?: boolean;
  /** Form sections for progressive disclosure */
  sections?: FormSection[];
  /** Additional CSS class name */
  className?: string;
  /** Whether to disable the form */
  disabled?: boolean;
  /** Whether to reset the form after successful submission */
  resetOnSubmit?: boolean;
  /** Whether to show a cancel button */
  showCancel?: boolean;
  /** Text for the cancel button */
  cancelText?: string;
  /** Cancel button handler */
  onCancel?: () => void;
}

/**
 * Form field props
 */
export interface FormFieldProps {
  /** Field name */
  name: string;
  /** Field label */
  label?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Helper text to display below the field */
  helperText?: string;
  /** Error message to display */
  error?: string;
  /** Field children (input component) */
  children: ReactNode;
  /** Layout direction */
  layout?: 'vertical' | 'horizontal';
  /** Additional CSS class name */
  className?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether the field is read-only */
  readOnly?: boolean;
  /** Width of the label (for horizontal layout) */
  labelWidth?: string;
}

/**
 * Form section props
 */
export interface FormSectionProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Section children (form fields) */
  children: ReactNode;
  /** Whether the section is collapsible */
  collapsible?: boolean;
  /** Whether the section is expanded by default (when collapsible) */
  defaultExpanded?: boolean;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Form group props
 */
export interface FormGroupProps {
  /** Group title */
  title?: string;
  /** Group description */
  description?: string;
  /** Group children (form fields) */
  children: ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Layout of fields within group */
  layout?: 'default' | 'grid' | 'inline';
  /** Number of columns for grid layout */
  columns?: number;
  /** Gap between grid items */
  gap?: string;
}

/**
 * Input props
 */
export interface InputProps {
  /** Input type */
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local' | 'textarea';
  /** Input name */
  name?: string;
  /** Input value */
  value?: string | number;
  /** Default value */
  defaultValue?: string | number;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether the input is read-only */
  readOnly?: boolean;
  /** Whether the input is required */
  required?: boolean;
  /** Input size variant */
  size?: SizeVariant;
  /** Input visual variant */
  variant?: VisualVariant;
  /** Whether to auto-validate the input */
  autoValidate?: boolean;
  /** Validation function */
  validate?: ValidationFunction;
  /** Whether to show validation icon */
  showValidationIcon?: boolean;
  /** Success validation message */
  validationMessage?: string;
  /** Error message */
  error?: string;
  /** Prefix element */
  prefix?: ReactNode;
  /** Suffix element */
  suffix?: ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Change event handler */
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  /** Blur event handler */
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  /** Focus event handler */
  onFocus?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  /** Key down event handler */
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  /** Key up event handler */
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  /** Input event handler */
  onInput?: (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  /** Maximum length */
  maxLength?: number;
  /** Minimum length */
  minLength?: number;
  /** Pattern for validation */
  pattern?: string;
  /** Autocomplete attribute */
  autoComplete?: string;
  /** Autofocus attribute */
  autoFocus?: boolean;
  /** ID attribute */
  id?: string;
  /** ARIA label */
  'aria-label'?: string;
  /** ARIA described by */
  'aria-describedby'?: string;
  /** Test ID for testing */
  'data-testid'?: string;
}
