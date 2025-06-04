# JobTicketInvoice MVP

A full-stack job ticket and invoicing web application for small oilfield service companies.

## Tech Stack

- Frontend: React.js with TypeScript
- Backend: FastAPI
- Database: PostgreSQL
- Authentication: JWT

## Project Structure

```
├── backend/            # FastAPI backend
├── frontend/          # React frontend
├── docker/           # Docker configuration
├── .env.example      # Environment variables template
├── docker-compose.yml # Docker compose configuration
└── README.md         # Project documentation
```

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 16+
- Docker and Docker Compose
- PostgreSQL

### Installation

1. Clone the repository
2. Copy `.env.example` to `.env` and configure your environment variables
3. Run `docker-compose up --build` to start the development environment

## Features

- Technician mobile interface for job ticket submission
- Manager desktop interface for ticket management and invoicing
- GPT-4 integration for natural language processing
- Role-based authentication and user onboarding
- Multi-language support (English/Spanish)
- Secure company logo upload for managers
- User profile management
- Protected routes with authentication checks
- Mobile-responsive design

## User Onboarding Flow

### Authentication

- **Public Landing Page**: Entry point for unauthenticated users with sign-up and login options
- **Role-Based Signup**: Different forms for Technicians and Managers
  - Technicians: Name, Email, Password, Job Type
  - Managers: Name, Email, Password, Company Name, Company Logo (optional)
- **Login**: Email and password authentication with JWT token
- **User Profile**: View and manage user information
- **Protected Routes**: Authenticated access to dashboard and profile pages

### Testing Authentication

Use the included test scripts to verify authentication functionality:

1. Open browser console
2. Run `testAuth()` to test registration, login, and profile retrieval
3. Run `testRoutes()` to verify route protection and navigation

## License

MIT License
