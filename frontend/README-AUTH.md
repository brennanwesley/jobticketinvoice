# JobTicketInvoice Authentication System

This document provides an overview of the authentication system implemented in the JobTicketInvoice application, including its architecture, user flows, API endpoints, and testing utilities.

## Table of Contents

1. [Architecture](#architecture)
2. [User Flows](#user-flows)
3. [API Endpoints](#api-endpoints)
4. [Authentication Context](#authentication-context)
5. [Protected Routes](#protected-routes)
6. [Testing Utilities](#testing-utilities)
7. [Security Considerations](#security-considerations)
8. [Future Enhancements](#future-enhancements)

## Architecture

The authentication system is built using the following technologies:

- **Frontend**: React 18 with Context API for state management
- **Backend**: FastAPI with JWT authentication
- **Database**: Supabase PostgreSQL with field-level encryption for sensitive data
- **Storage**: JWT tokens stored in localStorage with utility functions for management

The system follows a token-based authentication approach, where:

1. Users register or log in to receive a JWT token
2. The token is stored in localStorage and included in subsequent API requests
3. Protected routes check for valid tokens before rendering content
4. Token expiration is handled automatically

## User Flows

### Registration Flow

1. User selects their role (Tech or Manager)
2. User completes the registration form with required information
3. For Manager role, optional company logo upload is available
4. On successful registration, user receives a JWT token and is redirected to the dashboard
5. On failure, appropriate error messages are displayed

### Login Flow

1. User enters email and password
2. On successful login, user receives a JWT token and is redirected to the dashboard
3. On failure, appropriate error messages are displayed

### Authentication State

- The `AuthContext` maintains the current authentication state
- `useAuthStatus` hook provides derived authentication status for protected routes
- Loading states are managed to show appropriate UI during authentication checks

## API Endpoints

The authentication system interacts with the following API endpoints:

- **POST /api/auth/register**: Register a new user
  - Request: `{ name, email, password, role, job_type?, company_name? }`
  - Response: `{ access_token, token_type, user }`

- **POST /api/auth/login**: Authenticate a user
  - Request: Form data with `username` (email) and `password`
  - Response: `{ access_token, token_type, user }`

- **GET /api/auth/me**: Get current user profile
  - Headers: `Authorization: Bearer {token}`
  - Response: `{ id, name, email, role, ... }`

- **POST /api/auth/logo**: Upload company logo (Manager only)
  - Headers: `Authorization: Bearer {token}`
  - Request: Multipart form with `logo` file
  - Response: `{ logo_url }`

## Authentication Context

The `AuthContext` provides the following functionality:

- `user`: Current authenticated user object or null
- `loading`: Boolean indicating if authentication state is being checked
- `login(email, password)`: Function to authenticate a user
- `register(userData)`: Function to register a new user
- `logout()`: Function to log out the current user
- `uploadLogo(file)`: Function to upload a company logo (Manager only)

## Protected Routes

Protected routes are implemented using the `ProtectedRoute` component, which:

1. Uses the `useAuthStatus` hook to check authentication state
2. Shows a loading spinner while checking authentication
3. Redirects to login page if user is not authenticated
4. Renders child routes if user is authenticated

## Testing Utilities

The authentication system includes comprehensive testing utilities:

### Auth Test Page

A dedicated Auth Test Page is available at `/auth-test` in development mode, providing a UI to:

- Test login with different credentials
- Test registration with different user types
- Test logout functionality
- Test logo upload for manager accounts
- View detailed test results and API responses

### Console Testing Utilities

In development mode, the following global functions are available in the browser console:

- `testLogin(email, password)`: Test user login
- `testRegister(userData)`: Test user registration
- `testGetProfile()`: Test fetching user profile
- `testLogoUpload(file)`: Test logo upload
- `testLogout()`: Test logout functionality

### Development Server

A custom development server script (`start-dev.js`) is provided to:

- Set up the development environment
- Enable authentication testing utilities
- Provide helpful console output and configuration

Run the development server with:

```bash
node start-dev.js
```

## Security Considerations

The authentication system implements several security best practices:

- JWT tokens are validated for expiration before use
- Authenticated API requests automatically include Authorization headers
- Password strength validation is enforced during registration
- File uploads (logo) are validated for type and size
- Sensitive data is encrypted at the database level

## Future Enhancements

Planned enhancements for the authentication system include:

- Password reset functionality
- Email verification
- Two-factor authentication
- Social login options (Google, Microsoft, etc.)
- Session management with refresh tokens
- Account settings and profile editing
- Role-based access control for different features
