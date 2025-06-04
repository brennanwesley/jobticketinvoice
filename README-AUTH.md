# JobTicketInvoice Authentication System

This document provides an overview of the authentication and user onboarding flow implemented in the JobTicketInvoice application.

## Features

- **Role-based User Registration**: Separate flows for Technicians and Managers
- **Secure Authentication**: JWT-based authentication with token management
- **Protected Routes**: Role-based access control for application features
- **User Profile**: Display and management of user information
- **Company Logo Upload**: For Manager accounts
- **Bilingual Support**: Full English and Spanish translations for all auth-related UI
- **Responsive Design**: Mobile-friendly signup and login forms

## Technical Implementation

### Frontend Authentication System

The authentication system is built with the following components:

1. **Auth Context (`/frontend/src/context/AuthContext.js`)**
   - Manages authentication state (user, token, loading)
   - Provides login, register, and logout functions
   - Automatically checks authentication status on app load

2. **Auth Utilities (`/frontend/src/utils/auth.js`)**
   - Token management (get, set, remove)
   - JWT parsing and validation
   - Token expiration checking
   - Authenticated API request wrapper

3. **Auth Status Hook (`/frontend/src/hooks/useAuthStatus.js`)**
   - Custom React hook for checking auth status
   - Provides loading state for UI feedback
   - Used by protected routes

4. **Protected Route Component (`/frontend/src/components/ProtectedRoute.js`)**
   - Redirects unauthenticated users to login
   - Shows loading spinner during auth checks
   - Uses the useAuthStatus hook

5. **Form Validation (`/frontend/src/utils/validators.js`)**
   - Email format validation
   - Password strength checking
   - Password confirmation
   - File upload validation (type and size)

6. **Translations (`/frontend/src/translations/`)**
   - Modular translation system with separate files for:
     - Auth-related strings (`auth.js`)
     - Common UI elements (`common.js`)
     - Job ticket-related strings (`jobTicket.js`)

### User Registration Flow

1. User navigates to `/signup`
2. User selects role (Tech or Manager)
3. Role-specific form is displayed:
   - **Tech**: Name, Email, Password, Job Type
   - **Manager**: Name, Email, Password, Company Name, Logo (optional)
4. Form validation occurs on submit
5. On successful registration:
   - User is automatically logged in
   - JWT token is stored in localStorage
   - User is redirected to dashboard

### Login Flow

1. User navigates to `/login`
2. User enters email and password
3. On successful login:
   - JWT token is stored in localStorage
   - User data is fetched and stored in context
   - User is redirected to dashboard

### Protected Routes

The following routes require authentication:
- `/dashboard/*` - Main application dashboard
- `/profile` - User profile page

## Backend API Endpoints

The authentication system interacts with the following API endpoints:

- **POST /api/auth/register**
  - Registers a new user
  - Accepts: name, email, password, role, job_type (for techs), company_name (for managers)
  - Returns: User data and access token

- **POST /api/auth/login**
  - Authenticates a user
  - Accepts: username (email), password
  - Returns: Access token

- **GET /api/auth/me**
  - Gets the current user's profile
  - Requires: Authorization header with JWT token
  - Returns: User data

- **POST /api/auth/logo**
  - Uploads a company logo (managers only)
  - Requires: Authorization header with JWT token
  - Accepts: Multipart form with logo file
  - Returns: Updated user data with logo URL

## Testing the Authentication System

### Manual Testing

You can use the test script at `/frontend/src/test-auth.js` to manually test the authentication API endpoints:

1. Open the browser console
2. Run the registration test: `testRegister()`
3. Run the login test: `testLogin()`
4. Run the profile test: `testGetProfile()`

### User Registration Testing

1. Navigate to `/signup`
2. Test both Tech and Manager registration flows
3. Verify form validation for all fields
4. Test logo upload for Manager accounts
5. Verify successful registration and redirect

### Login Testing

1. Navigate to `/login`
2. Test with valid and invalid credentials
3. Verify error messages for invalid login attempts
4. Verify successful login and redirect

### Protected Routes Testing

1. Try accessing `/dashboard` or `/profile` when not logged in
2. Verify redirect to login page
3. Log in and verify access to protected routes

## Security Considerations

- Passwords are never stored in plain text (hashed on backend)
- JWT tokens have expiration times
- Protected routes prevent unauthorized access
- Form validation helps prevent malicious input
- File uploads are validated for type and size

## Future Enhancements

- Password reset functionality
- Email verification
- Social login options
- Two-factor authentication
- Session management
- Account settings page
