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

### Client Management
- **Client Portal**: Create and manage visa applications (Individual, Family, Group, Phone Call)
- **Client Types**: Adults and minors with guardian information support
- **Family Members**: Add and manage family members for group applications
- **Phone Call Workflow**: Quick client creation from phone calls

### Dossier System
- **Multiple Dossiers**: Each client can have multiple dossiers (folders) for different visa applications
- **Dossier Status**: Track dossier status (En cours, Terminé, Annulé)
- **Isolated Services & Payments**: Each dossier maintains its own services and payments
- **Smart Selection**: Automatic dossier selection with manual override capability

### Services Management
- **Service Items**: Add multiple services per dossier with quantity and unit price
- **Price History**: Automatic price prefilling based on last used prices
- **Bulk Operations**: Add multiple services at once
- **Real-time Calculations**: Automatic subtotal and total calculations

### Payment System
- **Payment Modalities**: Full payment, 60/40 split, or milestone-based payments
- **Payment Options**: Bank transfer, Cheque, Post, Cash
- **Installment Tracking**: Track payment installments with due dates and status
- **Payment History**: Complete payment history per dossier

### Other Features
- **Role-based Access**: Admin (full access) vs User (read-only)
- **File Management**: Local upload system for documents with type validation
- **Real-time Updates**: Automatic UI updates with SWR caching
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
- **Modules**: Auth, Clients, Attachments, Meta, Services, Payments, Dossiers
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with role-based guards
- **File Upload**: Local storage with validation
- **Data Relations**: Complex relations between clients, dossiers, services, and payments

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
- `GET /api/v1/meta/attachment-types` - Get available attachment types
- `GET /api/v1/meta/service-types` - Get available service types
- `GET /api/v1/meta/payment-options` - Get available payment options
- `GET /api/v1/meta/payment-modalities` - Get available payment modalities

### Clients
- `GET /api/v1/clients` - List clients (with pagination & filters)
- `POST /api/v1/clients` - Create new client
- `POST /api/v1/clients/phone-call` - Create client from phone call
- `GET /api/v1/clients/:id` - Get client details
- `PATCH /api/v1/clients/:id` - Update client
- `DELETE /api/v1/clients/:id` - Delete client

### Dossiers
- `GET /api/v1/dossiers` - List all dossiers
- `GET /api/v1/dossiers?clientId=:id` - List client dossiers
- `GET /api/v1/dossiers/:id` - Get dossier details
- `POST /api/v1/dossiers` - Create new dossier
- `PATCH /api/v1/dossiers/:id` - Update dossier status
- `DELETE /api/v1/dossiers/:id` - Delete dossier

### Services
- `GET /api/v1/clients/:id/services` - List all client services (legacy)
- `GET /api/v1/dossiers/:id/services` - List dossier services
- `POST /api/v1/services` - Create single service
- `POST /api/v1/services/bulk` - Create multiple services
- `PATCH /api/v1/services/:id` - Update service
- `DELETE /api/v1/services/:id` - Delete service
- `GET /api/v1/services/last-price?serviceType=:type` - Get last used price
- `POST /api/v1/services/last-prices` - Get multiple last prices

### Payments
- `GET /api/v1/clients/:id/payments` - List all client payments (legacy)
- `GET /api/v1/dossiers/:id/payments` - List dossier payments
- `POST /api/v1/payments` - Create payment with installments
- `PATCH /api/v1/payments/:id` - Update payment
- `DELETE /api/v1/payments/:id` - Delete payment

### Attachments
- `POST /api/v1/clients/:id/attachments` - Upload file
- `GET /api/v1/clients/:id/attachments` - List client attachments
- `GET /api/v1/attachments/:id/file` - Download attachment
- `DELETE /api/v1/attachments/:id` - Delete attachment

### Family Members
- `POST /api/v1/clients/:id/family-members` - Add family member
- `DELETE /api/v1/family-members/:id` - Remove family member

## Database Schema

### Main Models

#### Client
- Personal information (name, email, address, passport)
- Client type (INDIVIDUAL, FAMILY, GROUP)
- Status tracking (PENDING_DOCS, IN_REVIEW, APPROVED, REJECTED)
- Support for minors with guardian information
- Relations: Dossiers, Phone Numbers, Employers, Family Members, Attachments

#### Dossier
- Belongs to a client (one-to-many)
- Status: EN_COURS, TERMINE, ANNULE
- Contains services and payments
- Automatic primary dossier creation on client creation
- Tracks creation and update timestamps

#### ServiceItem
- Belongs to a dossier
- Service type, quantity, unit price
- Automatic total calculation
- Price history tracking for prefilling

#### Payment
- Belongs to a dossier
- Payment modality (FULL_PAYMENT, SIXTY_FORTY, MILESTONE_PAYMENTS)
- Payment option (BANK_TRANSFER, CHEQUE, POST, CASH)
- Contains multiple installments with tracking

#### PaymentInstallment
- Belongs to a payment
- Description, percentage, amount, due date
- Status tracking (PENDING, PAID)
- Individual payment options per installment

## Key Workflows

### Client Creation Workflow
1. Create client with basic information
2. Automatic primary dossier creation (EN_COURS status)
3. Add family members if needed
4. Upload required documents
5. Add services to the dossier
6. Configure payment plan

### Dossier Management Workflow
1. Client can have multiple dossiers for different applications
2. Each dossier maintains its own services and payments
3. Automatic selection of single/most recent dossier
4. Manual selection available when multiple dossiers exist
5. Services and payments sections sync with selected dossier

### Service Addition Workflow
1. Select service type from predefined list
2. Automatic price prefilling from history
3. Manual price override capability
4. Bulk addition with save all option
5. Real-time total calculation
6. Automatic cache invalidation for counter updates

### Payment Configuration Workflow
1. Choose payment modality (Full, 60/40, Milestones)
2. Configure installments with percentages
3. Set due dates for each installment
4. Track payment status (PENDING/PAID)
5. Edit existing payment configurations
6. Automatic synchronization with service totals

## Technical Features

### Frontend
- **SWR Caching**: Optimistic updates with automatic revalidation
- **Form Validation**: Zod schemas with react-hook-form
- **Real-time Updates**: Automatic UI refresh on data changes
- **Responsive Design**: Mobile-first with Tailwind CSS
- **Type Safety**: Full TypeScript coverage

### Backend
- **Prisma ORM**: Type-safe database queries
- **Transaction Support**: Atomic operations for data consistency
- **JWT Authentication**: Secure role-based access control
- **DTO Validation**: Class-validator for request/response validation
- **File Handling**: Multer for secure file uploads

## Environment Variables

See `.env.example` files in each directory for required configuration.
