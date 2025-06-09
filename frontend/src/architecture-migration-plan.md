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

## Navigation Structure and Page-Component Mapping

### Core Navigation Flows

1. **Create New Job Ticket Flow**
   - Entry Point: Sidebar "Create New Job Ticket" button
   - Landing Page (`/landing`, `LandingPage.js`): Presents options for "By Hand" or "By Voice"
   - Manual Form (`/job-ticket-form`, `JobTicketFormPage.js`): For manual ticket creation
   - Voice Recorder (`/voice-recorder`, `VoiceRecorderPage.js`): For voice-based ticket creation

2. **Submitted Tickets Flow**
   - Entry Point: Sidebar "Submitted Tickets" link
   - List Page (`/submitted`, `tickets/SubmittedTicketList.js`): Displays all submitted tickets
   - API Integration: Fetches from `/api/job-tickets?status=submitted`

3. **Draft Tickets Flow**
   - Entry Point: Sidebar "Draft Tickets" link
   - List Page (`/drafts`, `tickets/DraftTicketList.js`): Displays all draft tickets
   - Data Source: Uses `draftTickets` from TicketContext

### Form Selection Logic

The application uses `JobTicketFormSelector.js` to dynamically select the appropriate form based on:
- User's job type (from AuthContext)
- Ticket mode (manual vs. voice)
- Selected draft ticket (when editing)

Forms are organized by job type in the `tickets/forms` directory with specialized forms for different roles.

### Protected Routes

All ticket-related routes are protected and require authentication:
- `/landing`
- `/job-ticket-form`
- `/job-ticket-selector`
- `/voice-recorder`
- `/submitted`
- `/drafts`

See `AppRoutes.js` for the complete route configuration.

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
