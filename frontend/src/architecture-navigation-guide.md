# Job Ticket Invoice Navigation Architecture

## Overview

This document outlines the navigation structure and page-component mapping for the Job Ticket Invoice application. It serves as a guide for developers to understand how the sidebar navigation works, which components are rendered for each route, and how the application flow is structured.

## Navigation Components

### Main Navigation Structure

The application uses React Router for navigation with the following key components:

1. **AppRoutes.js** - Central routing configuration that defines all routes and their corresponding components
2. **Sidebar.js** - Main navigation sidebar that provides links to all major sections
3. **ProtectedRoute.js** - Route wrapper that ensures authentication before accessing protected routes

### Lazy Loading Strategy

All page components are lazy-loaded using a custom `enhancedLazy` function in AppRoutes.js, which provides:

- Chunk naming for better debugging
- Error resilience with automatic retry
- Performance tracking for route changes

## Page-Component Mapping

### Core Screens

| Sidebar Label | Route | Component | Purpose |
|---------------|-------|-----------|---------|
| Create New Job Ticket | `/landing` | `LandingPage.js` | Entry point for ticket creation with options for manual or voice input |
| Submitted Tickets | `/submitted` | `tickets/SubmittedTicketList.js` | Displays all submitted job tickets |
| Draft Tickets | `/drafts` | `tickets/DraftTicketList.js` | Displays all draft job tickets |

### Job Ticket Creation Flow

1. **Landing Page** (`/landing`, `LandingPage.js`)
   - Presents two options: "By Hand" or "By Voice"
   - Sets the appropriate ticket mode in context

2. **Manual Form Entry** (`/job-ticket-form`, `JobTicketFormPage.js`)
   - Loads when "By Hand" is selected
   - Contains the job-type specific form

3. **Voice Recording** (`/voice-recorder`, `VoiceRecorderPage.js`)
   - Loads when "By Voice" is selected
   - Contains the voice recording interface

4. **Form Selector** (`/job-ticket-selector`, `tickets/JobTicketFormSelector.js`)
   - Dynamically selects the appropriate form based on user's job type
   - Used when editing draft tickets or when job type needs to be determined

### Form Components

Forms are organized by job type in the `tickets/forms` directory:

- `BaseJobTicketForm.js` - Base form with common fields
- `GenericJobTicketForm.js` - Default form for all job types
- `PumpTechTicketForm.js` - Specialized form for pump technicians
- `DriverTicketForm.js` - Specialized form for drivers
- Additional specialized forms for other job types

## Navigation Flow

### Create New Job Ticket Flow

1. User clicks "Create New Job Ticket" in sidebar
2. User is directed to `/landing` (LandingPage)
3. User selects "By Hand" or "By Voice"
4. Based on selection, user is directed to either:
   - `/job-ticket-form` (JobTicketFormPage) for manual entry
   - `/voice-recorder` (VoiceRecorderPage) for voice entry

### Ticket List Flows

1. **Submitted Tickets**
   - User clicks "Submitted Tickets" in sidebar
   - User is directed to `/submitted` (SubmittedTicketList)
   - Component fetches submitted tickets from API with status filter

2. **Draft Tickets**
   - User clicks "Draft Tickets" in sidebar
   - User is directed to `/drafts` (DraftTicketList)
   - Component displays draft tickets from context
   - User can view, edit, or delete draft tickets

## Error Handling

Each page component implements error handling for:

1. **Loading states** - Shows loading spinners during data fetching
2. **Error states** - Displays error messages when API calls fail
3. **Empty states** - Shows appropriate messages when no data is available

The application uses ErrorBoundary components to catch and display errors at the page level.

## Best Practices

1. Always use the route constants defined in AppRoutes.js
2. Use the Link component from react-router-dom for navigation
3. Set appropriate context values before navigation when needed
4. Ensure all routes that require authentication are wrapped in ProtectedRoute
5. Use lazy loading for all page components to improve performance
