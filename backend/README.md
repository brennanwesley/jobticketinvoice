# JobTicketInvoice Backend API

A secure, modular backend using FastAPI that supports user authentication, role-based access, and RESTful API routes for job tickets and invoices.

## Features

- **User Authentication**: Secure JWT-based authentication with password hashing
- **Role-Based Access Control**: Different permissions for Tech, Manager, and Admin roles
- **RESTful API**: Full CRUD operations for job tickets and invoices
- **Database**: SQLite for development with easy migration to PostgreSQL for production
- **API Documentation**: Auto-generated Swagger UI at `/docs`

## Tech Stack

- **Language**: Python 3.11+
- **Framework**: FastAPI
- **Authentication**: OAuth2 with Password (JWT-based)
- **ORM**: SQLAlchemy
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Password Hashing**: Passlib (bcrypt)
- **JWT Handling**: python-jose
- **Environment Config**: python-dotenv

## Setup

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
DATABASE_URL=sqlite:///./app.db
SECRET_KEY=your-very-secure-key
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### Installation

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Run the application:

```bash
uvicorn main:app --reload
```

### Docker

To run with Docker:

```bash
docker compose up backend
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register`: Register a new user
- `POST /api/v1/auth/login`: Login and get access token

### Users

- `GET /api/v1/users/me`: Get current user info
- `GET /api/v1/users/`: Get all users (admin only)
- `GET /api/v1/users/{user_id}`: Get user by ID (admin only)

### Job Tickets

- `POST /api/v1/job-tickets/`: Create a new job ticket
- `GET /api/v1/job-tickets/`: List job tickets (filtered by user role)
- `GET /api/v1/job-tickets/{id}`: Get job ticket by ID
- `PUT /api/v1/job-tickets/{id}`: Update job ticket
- `DELETE /api/v1/job-tickets/{id}`: Delete job ticket

### Invoices

- `POST /api/v1/invoices/`: Create a new invoice
- `GET /api/v1/invoices/`: List invoices (filtered by user role)
- `GET /api/v1/invoices/{id}`: Get invoice by ID
- `PUT /api/v1/invoices/{id}`: Update invoice
- `DELETE /api/v1/invoices/{id}`: Delete invoice

## Role-Based Access Control

- **Tech**: Can only view and modify their own job tickets and invoices
- **Manager**: Can view all job tickets and invoices
- **Admin**: Has unrestricted access to all resources

## Database Schema

### User
- `id`: Primary key
- `email`: Unique email
- `hashed_password`: Bcrypt hashed password
- `role`: "tech", "manager", or "admin"
- `created_at`: Timestamp

### Job Ticket
- `id`: Primary key
- `user_id`: Foreign key to User
- `job_number`: Unique identifier
- `company_name`: Client company
- `customer_name`: Contact person
- `location`: Job location
- `work_type`: Type of work
- `equipment`: Equipment details
- `work_start_time`: Start time
- `work_end_time`: End time
- `work_total_hours`: Total hours worked
- `drive_start_time`: Start time of travel
- `drive_end_time`: End time of travel
- `drive_total_hours`: Total travel hours
- `travel_type`: "one_way" or "round_trip"
- `parts_used`: JSON string of parts
- `work_description`: Description of work
- `submitted_by`: Name of submitter
- `status`: "draft", "submitted", or "complete"
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Invoice
- `id`: Primary key
- `user_id`: Foreign key to User
- `job_ticket_id`: Foreign key to JobTicket
- `amount`: Invoice amount
- `status`: "draft", "sent", or "paid"
- `line_items`: JSON string of line items
- `created_at`: Timestamp
- `updated_at`: Timestamp
