# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack visa office management application with a NestJS + Prisma + PostgreSQL backend and Next.js + Tailwind + shadcn/ui frontend. The system manages visa applications for different client types (Individual, Family, Group, Phone Call) with role-based access control.

## Architecture

- **Backend** (`/backend`): NestJS API with modular architecture
  - Core modules: Auth, Clients, Attachments, Meta, Services, Payments
  - Database: PostgreSQL with Prisma ORM
  - Authentication: JWT with role-based guards (Admin/User)
  - File handling: Local upload system with multer
- **Frontend** (`/frontend`): Next.js App Router application
  - UI: Tailwind CSS + shadcn/ui components
  - State management: SWR for data fetching
  - Forms: react-hook-form + zod validation
  - Authentication: Context-based auth with JWT

## Development Commands

### Backend (`/backend`)
```bash
npm run start:dev        # Start development server (port 3001)
npm run build           # Build for production
npm run test            # Run unit tests
npm run test:e2e        # Run end-to-end tests
npm run lint            # Lint and fix code
npm run db:migrate      # Run Prisma migrations
npm run db:seed         # Seed database with test data
npm run db:generate     # Generate Prisma client
```

### Frontend (`/frontend`)
```bash
npm run dev             # Start development server (port 3000, turbopack enabled)
npm run build           # Build for production
npm run lint            # Lint code
```

### Database Setup
```bash
docker-compose up -d    # Start PostgreSQL container
```

## Key Database Models

The Prisma schema defines several core entities:
- **Client**: Main entity with different types (Individual, Family, Group, Phone Call)
- **FamilyMember**: Related family members for family applications
- **ServiceItem**: Services provided to clients with pricing
- **Payment**: Payment tracking with multiple modalities and installments
- **Attachment**: File uploads associated with clients
- **User**: Authentication with role-based access

## Authentication

Default accounts (created by seed):
- Admin: admin@visa-office.com / admin123
- User: user@visa-office.com / user123

## API Structure

Base URL: http://localhost:3001
- `/auth/*` - Authentication endpoints
- `/api/v1/clients/*` - Client management
- `/api/v1/meta/*` - Metadata (statuses, visa types)
- `/api/v1/services/*` - Service management
- `/api/v1/payments/*` - Payment processing

## Frontend Structure

- Pages in `/src/app/*` using App Router
- Reusable components in `/src/components/*`
- UI components from shadcn/ui in `/src/components/ui/*`
- Client-specific components in `/src/components/clients/*`
- Type definitions in `/src/types/*`

## Testing

Backend uses Jest for unit tests and e2e tests. Run tests before committing changes.

## Environment Setup

Both backend and frontend have `.env.example` files. Copy and configure these before running the application.