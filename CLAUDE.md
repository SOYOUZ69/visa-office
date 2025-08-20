# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack visa office management application with a **dossier-based system** for managing client visa applications. Built with NestJS + Prisma + PostgreSQL backend and Next.js + Tailwind + shadcn/ui frontend.

## Critical Architecture Concepts

### Dossier System (IMPORTANT)
The application uses a **dossier-based architecture** where:
- Each client can have multiple dossiers (folders) for different visa applications
- Services and payments are linked to **dossiers**, not directly to clients
- When creating a new client, a primary dossier is automatically created
- Each dossier maintains its own isolated services, payments, and status

**Key Relations:**
```
Client (1) → (N) Dossiers (1) → (N) Services
                           (1) → (N) Payments → (N) Installments
```

### SWR Cache Keys
The frontend uses specific cache keys for data synchronization:
- `/dossiers/${clientId}` - List of client's dossiers with counters
- `/dossiers/${dossierId}/services` - Services for specific dossier
- `/dossiers/${dossierId}/payments` - Payments for specific dossier
- `/dossier/${dossierId}` - Single dossier details

**IMPORTANT**: After mutations (create/update/delete), invalidate relevant caches using `mutate()` to update counters and lists.

## Development Commands

### Initial Setup
```bash
# Start database
docker-compose up -d

# Backend setup
cd backend
npm install
npx prisma migrate dev
npm run db:seed

# Frontend setup
cd ../frontend
npm install
```

### Running the Application
```bash
# Backend (port 3001)
cd backend
npm run start:dev

# Frontend (port 3000)
cd frontend
npm run dev
```

### Database Operations
```bash
cd backend
npx prisma migrate dev              # Run migrations
npx prisma migrate dev --name <name> # Create new migration
npx prisma generate                  # Regenerate Prisma client
npx prisma studio                    # Open Prisma Studio GUI
npm run db:seed                      # Seed test data
```

### Testing
```bash
# Backend
cd backend
npm run test                 # Unit tests
npm run test:watch           # Watch mode
npm run test:e2e            # E2E tests
npm run test:cov            # Coverage

# Run single test
npm test -- --testNamePattern="should create"
npm test -- clients.service.spec.ts
```

### Linting & Formatting
```bash
# Backend
npm run lint                # Lint and auto-fix

# Frontend  
npm run lint                # ESLint check
```

## Key Technical Patterns

### Backend Patterns

1. **Service Layer Pattern**: All business logic in services, controllers only handle HTTP
2. **DTO Validation**: Use class-validator decorators for request validation
3. **Prisma Transactions**: Use `$transaction` for operations affecting multiple tables
4. **Guards**: JWT auth guard on all routes except login, RolesGuard for admin-only operations

### Frontend Patterns

1. **SWR for Data Fetching**: 
   ```typescript
   const { data, mutate } = useSWR(key, fetcher, { revalidateOnFocus: false })
   ```

2. **Form Handling**: react-hook-form with zod schemas
   ```typescript
   const form = useForm<FormData>({
     resolver: zodResolver(schema),
     defaultValues: { ... }
   })
   ```

3. **Cache Invalidation After Mutations**:
   ```typescript
   // After creating/updating/deleting
   mutate(`/dossiers/${dossierId}/services`)
   mutate(`/dossiers/${clientId}`) // Update counters
   ```

## API Response Patterns

### Success Response
```typescript
// Single entity
{ id, ...data }

// List with pagination
{
  data: [...],
  total: number,
  page: number,
  limit: number
}
```

### Error Response
```typescript
{
  statusCode: number,
  message: string | string[],
  error: string
}
```

## Authentication Flow

1. Login: `POST /auth/login` → Returns JWT token
2. Store token in localStorage: `auth_token`
3. Include in headers: `Authorization: Bearer ${token}`
4. Roles: `ADMIN` (full access), `USER` (read-only)

Default accounts:
- Admin: admin@visa-office.com / admin123
- User: user@visa-office.com / user123

## Common Development Tasks

### Adding a New API Endpoint
1. Create DTO in module's `dto/` folder
2. Add method to service
3. Add route to controller with appropriate guards
4. Update frontend API client in `/frontend/src/lib/api.ts`
5. Add types in `/frontend/src/types/index.ts`

### Adding a New Database Field
1. Update Prisma schema in `/backend/prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name add_field_name`
3. Update relevant DTOs
4. Update frontend types

### Debugging Tips

**Backend Debugging:**
- Check logs in terminal running `npm run start:dev`
- Use Prisma Studio to inspect database: `npx prisma studio`
- Test endpoints directly: `http://localhost:3001/api/v1/...`

**Frontend Debugging:**
- Check browser console for API errors
- Use React DevTools for component state
- Check Network tab for API calls and responses
- SWR cache issues: Check cache keys match exactly

## Critical Files to Understand

### Backend
- `/backend/prisma/schema.prisma` - Database schema and relations
- `/backend/src/main.ts` - Application bootstrap and global config
- `/backend/src/auth/strategies/jwt.strategy.ts` - JWT validation
- `/backend/src/dossiers/` - Dossier system implementation

### Frontend
- `/frontend/src/lib/api.ts` - API client and interceptors
- `/frontend/src/components/clients/DossiersList.tsx` - Dossier selection logic
- `/frontend/src/components/clients/ServicesSection.tsx` - Service management with SWR
- `/frontend/src/components/clients/PaymentSection.tsx` - Payment configuration
- `/frontend/src/contexts/AuthContext.tsx` - Authentication state

## Known Issues & Solutions

1. **Port 3001 in use**: Kill existing process: `lsof -ti:3001 | xargs kill -9`
2. **Prisma client out of sync**: Run `npx prisma generate`
3. **Migration pending**: Run `npx prisma migrate dev`
4. **SWR cache not updating**: Ensure exact cache key match in mutate() calls