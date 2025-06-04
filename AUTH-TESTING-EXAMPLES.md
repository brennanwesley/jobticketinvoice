# Authentication Testing Examples

This document provides practical examples for testing the JobTicketInvoice authentication system using the provided utilities.

## Frontend Testing Examples

### Browser Console Testing

Open your browser's developer console (F12) and try these examples:

```javascript
// Test registration with a tech account
testRegister({
  name: "John Tech",
  email: "john.tech@example.com",
  password: "SecurePass123!",
  role: "tech",
  job_type: "pump_service_technician"
})

// Test registration with a manager account
testRegister({
  name: "Jane Manager",
  email: "jane.manager@example.com",
  password: "SecurePass123!",
  role: "manager",
  company_name: "Acme Pumps Inc."
})

// Test login with existing credentials
testLogin("john.tech@example.com", "SecurePass123!")

// Test retrieving the current user's profile
testGetProfile()

// Test logout
testLogout()
```

### Using the Auth Test Page

1. Start the development server:
   ```
   npm run dev:auth
   ```

2. Navigate to `/auth-test` in your browser or click the "Auth Test Page" link in the sidebar

3. Test the registration form:
   - Fill in a unique email (the form generates a random one by default)
   - Enter "Test User" as the name
   - Enter "Password123!" as the password
   - Select either "Tech" or "Manager" role
   - For Tech: Select a job type
   - For Manager: Enter a company name
   - Click "Run Register Test"

4. Test the login form:
   - The email field will be pre-filled with the email from successful registration
   - Enter the password you used
   - Click "Run Login Test"

5. Test logo upload (Manager only):
   - After logging in as a manager
   - Use the file input to select a logo image
   - The upload will start automatically

## Backend Testing Examples

### Using the Command-Line Test Script (Windows)

Open a command prompt in the backend directory and run:

```batch
REM Register a tech user
test_auth.bat register --name "Test Tech" --email "tech@example.com" --password "Password123!" --role "tech" --job-type "pump_service_technician" --save-token

REM Register a manager user
test_auth.bat register --name "Test Manager" --email "manager@example.com" --password "Password123!" --role "manager" --company-name "Test Company" --save-token

REM Login with existing credentials
test_auth.bat login --email "tech@example.com" --password "Password123!" --save-token

REM Get the current user's profile
test_auth.bat profile

REM Upload a logo (manager only)
test_auth.bat logo --logo-file "path\to\logo.png"
```

### Using the Command-Line Test Script (Linux/Mac)

Open a terminal in the backend directory and run:

```bash
# Register a tech user
python test_auth_api.py register --name "Test Tech" --email "tech@example.com" --password "Password123!" --role "tech" --job-type "pump_service_technician" --save-token

# Register a manager user
python test_auth_api.py register --name "Test Manager" --email "manager@example.com" --password "Password123!" --role "manager" --company-name "Test Company" --save-token

# Login with existing credentials
python test_auth_api.py login --email "tech@example.com" --password "Password123!" --save-token

# Get the current user's profile
python test_auth_api.py profile

# Upload a logo (manager only)
python test_auth_api.py logo --logo-file "path/to/logo.png"
```

## Testing Bilingual Support

The authentication system fully supports both English and Spanish. To test this:

1. Toggle the language using the language switcher in the header
2. Verify that all authentication-related UI elements change language:
   - Form labels and placeholders
   - Error messages
   - Success messages
   - Navigation items
   - User profile information

3. Test the complete registration and login flows in both languages

## Common Test Scenarios

### Password Validation

Test password validation by attempting to register with:
- Short password (less than 8 characters)
- Password without uppercase letters
- Password without numbers
- Password without special characters

### Email Validation

Test email validation by attempting to register with:
- Invalid email format (missing @ symbol)
- Invalid email format (missing domain)
- Already registered email

### Role-Specific Fields

Test role-specific validation:
- Tech registration without selecting a job type
- Manager registration without entering a company name

### Logo Upload Validation

Test logo upload validation:
- Upload a file larger than 2MB
- Upload a non-image file
- Upload an image with invalid format (not JPG, PNG, or GIF)

## Troubleshooting

If you encounter issues during testing:

1. **Backend Connection Issues**:
   - Ensure the backend server is running on the expected port (default: 8000)
   - Check the API URL in the frontend environment variables

2. **Token Issues**:
   - Clear localStorage in your browser
   - Try logging in again to get a fresh token

3. **CORS Issues**:
   - Ensure the backend CORS settings allow requests from your frontend URL

4. **Database Issues**:
   - Check the database connection in the backend
   - Verify that the tables are properly created

For more detailed information, refer to [TESTING-AUTH.md](./TESTING-AUTH.md) and [README-AUTH.md](./frontend/README-AUTH.md).
