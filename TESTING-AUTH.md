# Authentication Testing Guide for JobTicketInvoice

This guide provides instructions for testing the authentication system in the JobTicketInvoice application, including frontend and backend testing utilities.

## Table of Contents

1. [Frontend Testing](#frontend-testing)
   - [Auth Test Page](#auth-test-page)
   - [Browser Console Utilities](#browser-console-utilities)
   - [Development Server](#development-server)
2. [Backend Testing](#backend-testing)
   - [Command-Line Test Script](#command-line-test-script)
   - [API Endpoint Testing](#api-endpoint-testing)
3. [End-to-End Testing](#end-to-end-testing)
   - [User Registration Flow](#user-registration-flow)
   - [Login Flow](#login-flow)
   - [Profile and Logo Management](#profile-and-logo-management)

## Frontend Testing

### Auth Test Page

The application includes a dedicated Auth Test Page for interactive testing of authentication features.

**To access the Auth Test Page:**

1. Start the development server with `npm run dev:auth`
2. Navigate to `/auth-test` in your browser
3. Or click the "Auth Test Page" link in the sidebar (visible in development mode only)

**Features of the Auth Test Page:**

- Test login with different credentials
- Test registration with different user types (Tech and Manager)
- Test logout functionality
- Test logo upload for manager accounts
- View detailed test results and API responses

### Browser Console Utilities

In development mode, the application exposes several global functions in the browser console for testing authentication:

```javascript
// Test user login
testLogin(email, password)

// Test user registration
testRegister({
  name: "Test User",
  email: "test@example.com",
  password: "Password123!",
  role: "tech",
  job_type: "pump_service_technician"
})

// Test profile retrieval
testGetProfile()

// Test logo upload (Manager only)
testLogoUpload(file)

// Test logout
testLogout()
```

**Example usage:**

1. Open your browser's developer console (F12 or Ctrl+Shift+I)
2. Run a test login:
   ```javascript
   testLogin("test@example.com", "Password123!")
   ```
3. Check the console output for detailed results

### Development Server

A custom development server script is provided to simplify testing:

```bash
# Start the development server with auth testing enabled
npm run dev:auth
```

This script:
- Sets up the development environment
- Enables authentication testing utilities
- Provides helpful console output and configuration

## Backend Testing

### Command-Line Test Script

The backend includes a Python script for testing authentication API endpoints from the command line:

```bash
# Navigate to the backend directory
cd backend

# Test user registration (Tech)
python test_auth_api.py register --name "Test Tech" --email "tech@example.com" --password "Password123!" --role "tech" --job-type "pump_service_technician" --save-token

# Test user registration (Manager)
python test_auth_api.py register --name "Test Manager" --email "manager@example.com" --password "Password123!" --role "manager" --company-name "Test Company" --save-token

# Test user login
python test_auth_api.py login --email "tech@example.com" --password "Password123!" --save-token

# Test profile retrieval
python test_auth_api.py profile

# Test logo upload (Manager only)
python test_auth_api.py logo --logo-file "path/to/logo.png"
```

The script saves authentication tokens to `.auth_token` for subsequent requests.

### API Endpoint Testing

You can also test the API endpoints directly using tools like curl or Postman:

**Register a new user:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Password123!","role":"tech","job_type":"pump_service_technician"}'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -d "username=test@example.com&password=Password123!"
```

**Get user profile:**
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Upload logo (Manager only):**
```bash
curl -X POST http://localhost:8000/api/auth/logo \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "logo=@path/to/logo.png"
```

## End-to-End Testing

### User Registration Flow

**Tech Registration:**
1. Navigate to `/signup`
2. Select "Technician" role
3. Fill in name, email, password, and job type
4. Submit the form
5. Verify redirection to dashboard
6. Check user profile information in sidebar

**Manager Registration:**
1. Navigate to `/signup`
2. Select "Manager" role
3. Fill in name, email, password, and company name
4. Optionally upload a company logo
5. Submit the form
6. Verify redirection to dashboard
7. Check user profile and logo in sidebar

### Login Flow

1. Navigate to `/login`
2. Enter email and password
3. Submit the form
4. Verify redirection to dashboard
5. Check user profile information in sidebar

### Profile and Logo Management

1. Login as a user
2. Navigate to `/profile`
3. Verify profile information is displayed correctly
4. For managers, test logo upload functionality
5. Verify logo appears in profile and sidebar

---

For more detailed information about the authentication system architecture, see [README-AUTH.md](./frontend/README-AUTH.md).
