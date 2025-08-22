# Visa Office MVP

A full-stack application for managing visa office clients, built with NestJS + Prisma + PostgreSQL (backend) and Next.js + Tailwind + shadcn/ui (frontend).

## Architecture

```
├── backend/          # NestJS API with Prisma ORM
├── frontend/         # Next.js App Router frontend
├── docker-compose.yml # PostgreSQL database
└── uploads/          # Local file storage (MVP)
```

## Features

- **Client Portal**: Create and manage visa applications (Individual, Family, Group, Phone Call)
- **Financial System**: Create and manage Caisses(Cash, Bank Accounts), Transactions (Payments, Expenses, etc...)
- **Employee Interface**: Create and manage Employees and manage their attendance/salaires.
- **Role-based Access**: Admin (full access) vs User (read-only)
- **File Management**: Local upload system for documents
- **Visa Types**: Tourist, Spouse, Family Reunion, Study, Professional Internship, Student Internship, Work, Medical, Other

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (via Docker)

### Setup Database

```bash
docker-compose up -d
```

### Backend Setup

```bash
cd backend
npm install
npm run db:migrate
npm run db:seed
npm run start:dev
```

Backend available at: http://localhost:3001
API Documentation: http://localhost:3001/docs

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend available at: http://localhost:3000

## Development Commands

### Backend

- `npm run start:dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run e2e tests
- `npm run lint` - Lint code
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with test data

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Lint code

## Authentication

Default accounts (created by seed):

- **Admin**: admin@visa-office.com / admin123
- **User**: user@visa-office.com / user123

## Project Structure

### Backend (`/backend`)

- **Modules**: Auth, Clients, Attachments, Meta
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with role-based guards
- **File Upload**: Local storage with validation

### Frontend (`/frontend`)

- **Routing**: Next.js App Router
- **UI**: Tailwind CSS + shadcn/ui components
- **State**: SWR for data fetching
- **Forms**: react-hook-form + zod validation

## API Endpoints

### Authentication

- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Meta

- `GET /api/v1/meta/client-statuses` - Get available client statuses
- `GET /api/v1/meta/visa-types` - Get available visa types

### Clients

- `GET /api/v1/clients` - List clients (with pagination & filters)
- `POST /api/v1/clients` - Create new client
- `GET /api/v1/clients/:id` - Get client details
- `PATCH /api/v1/clients/:id` - Update client
- `DELETE /api/v1/clients/:id` - Delete client

### Attachments

- `POST /api/v1/clients/:id/attachments` - Upload file
- `GET /api/v1/clients/:id/attachments` - List client attachments
- `DELETE /api/v1/attachments/:id` - Delete attachment

### Family Members

- `POST /api/v1/clients/:id/family-members` - Add family member
- `DELETE /api/v1/family-members/:id` - Remove family member

### Payments

- 'GET /api/v1/clients/{id}/payments' List all payments for a client
- 'POST /api/v1/clients/{id}/payments' Create a payment for a client
- 'PATCH /api/v1/clients/{id}/payments' Update a payment for a client
- 'DELETE /api/v1/payments/{paymentId}' Delete a payment
- 'POST /api/v1/installments/{installmentId}/mark-paid' Mark an installment as paid and create transaction
- 'GET /api/v1/payments/statistics' Get payment statistics

### Financial

- 'POST /api/v1/financial/caisses' Create a new caisse
- 'GET /api/v1/financial/caisses' Get all caisses
- 'GET /api/v1/financial/caisses/{id}' Get caisse by ID
- 'POST /api/v1/financial/transactions' Create a new transaction
- 'GET /api/v1/financial/transactions' Get transactions with filters
- 'POST /api/v1/financial/reports/generate' Generate financial report
- 'GET /api/v1/financial/reports' Get all financial reports
- 'GET /api/v1/financial/statistics' Get financial statistics
- 'GET /api/v1/financial/tax-calculation/{amount}'' Calculate tax for an amount
- 'GET /api/v1/financial/transactions/pending' Get all pending transactions for approval
- 'POST /api/v1/financial/transactions/{id}/approve' Approve a pending transaction
- 'POST /api/v1/financial/transactions/{id}/reject' Reject a pending transaction
- 'GET /api/v1/financial/transactions/{id}' Get transaction by ID

### Employees

- 'POST/api/v1/employees Create a new employee
- 'GET/api/v1/employees' Get all employees
- 'GET/api/v1/employees/{id}' Get an employee by ID
- 'PATCH/api/v1/employees/{id}' Update an employee
- 'DELETE/api/v1/employees/{id}' Delete an employee
- 'POST/api/v1/employees/{id}/attendance' Mark employee attendance
- 'GET/api/v1/employees/{id}/attendance' Get employee attendance
- 'GET/api/v1/employees/{id}/commission' Calculate employee commission
- 'POST/api/v1/employees/{id}/calculate-solde' Calculate monthly solde coungiee
- 'GET/api/v1/employees/stats/overview' Get all employees with statistics

## Environment Variables

See `.env.example` files in each directory for required configuration.
