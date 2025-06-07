/**
 * Common TypeScript type definitions used throughout the application
 */

/**
 * Generic ID type
 */
export type ID = string | number;

/**
 * Generic status type for async operations
 */
export type Status = 'idle' | 'loading' | 'success' | 'error';

/**
 * Generic pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Generic paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

/**
 * Generic API response
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

/**
 * Generic API error
 */
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  errors?: Record<string, string[]>;
}

/**
 * User role
 */
export type UserRole = 'admin' | 'manager' | 'user' | 'guest';

/**
 * User interface
 */
export interface User {
  id: ID;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Form field validation state
 */
export interface ValidationState {
  valid: boolean;
  error?: string;
  touched: boolean;
}

/**
 * Form field validation function
 */
export type ValidationFunction<T = any> = (value: T) => string | undefined | null | boolean;

/**
 * Form validation errors
 */
export type ValidationErrors = Record<string, string>;

/**
 * Form field props shared by all form components
 */
export interface BaseFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  helperText?: string;
  error?: string;
  className?: string;
  testId?: string;
}

/**
 * Component size variants
 */
export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Component color variants
 */
export type ColorVariant = 
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark';

/**
 * Component visual variants
 */
export type VisualVariant = 'default' | 'outlined' | 'filled' | 'text';

/**
 * Toast notification type
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast notification
 */
export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
}

/**
 * Modal size
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Breakpoint
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
