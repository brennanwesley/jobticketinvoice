# Architecture Migration Plan

## Component Reorganization

### Auth Components
Move to `src/components/auth/`:
- LoginForm.js
- LoginPage.js
- ManagerSignupForm.js
- TechSignupForm.js
- SignupPage.js
- RoleSelection.js
- ProtectedRoute.js
- AuthTestPage.js

### Tickets Components
Move to `src/components/tickets/`:
- JobTicketForm.js
- JobTicketFormSelector.js
- DraftTicketList.js
- DraftTicketView.js
- SubmittedTicketList.js
- VoiceRecorder.js
- ManualForm.js
- Move the entire jobTicketForms directory content into tickets/forms/

### Layout Components
Move to `src/components/layout/`:
- Sidebar.js
- AppDashboard.js
- AppRoutes.js
- LandingPage.js
- PublicLandingPage.js

### Profile Components
Move to `src/components/profile/`:
- UserProfile.js
- UserProfilePage.js

### UI Components
Move to `src/components/ui/`:
- LanguageToggle.js

Create new shared UI components:
- Button.js
- Input.js
- Card.js
- Modal.js
- Form.js

## Implementation Steps

1. Create all necessary directories
2. Move files to their new locations
3. Update import paths in all files
4. Create shared UI components
5. Test the application to ensure everything works correctly

## Import Path Updates

After moving files, we'll need to update import paths in all affected files. For example:

```javascript
// Before
import LoginForm from '../components/LoginForm';

// After
import LoginForm from '../components/auth/LoginForm';
```

This will require careful tracking of all imports across the application.
