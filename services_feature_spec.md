# Services Section – Feature Spec (Add to Client Portal)

This spec extends the current MVP to add a **Services** section for each client.  
Goal: allow agents to **add one or multiple services** (type + quantity + unit price) and **save** either individually or in bulk.

---

## 1) Data Model (Prisma)

```prisma
enum ServiceType {
  TRANSLATION
  DOSSIER_TREATMENT
  ASSURANCE
  VISA_APPLICATION
  CONSULTATION
  OTHER
}

model ServiceItem {
  id         String      @id @default(uuid())
  clientId   String
  client     Client      @relation(fields: [clientId], references: [id], onDelete: Cascade)
  serviceType ServiceType
  quantity   Int         @default(1) // must be >= 1
  unitPrice  Decimal     @db.Decimal(10,2) // currency-agnostic number
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
}
```

- Run migration: `npx prisma migrate dev -n add_service_items`
- Add `serviceItems ServiceItem[]` relation in `Client` model.

---

## 2) API (NestJS) – `/api/v1`

### 2.1 List services for a client
- `GET /clients/:id/services`
- **Role**: `admin` or `user`
- **Response**
```json
[
  {"id":"...","serviceType":"TRANSLATION","quantity":2,"unitPrice":"50.00"}
]
```

### 2.2 Create **one** service
- `POST /clients/:id/service`
- **Role**: `admin`
- **Body**
```json
{"serviceType":"TRANSLATION","quantity":2,"unitPrice":50.00}
```
- **Rules**: `quantity >= 1`; `unitPrice >= 0`

### 2.3 Create **many** services (bulk)
- `POST /clients/:id/services`
- **Role**: `admin`
- **Body**
```json
{
  "items": [
    {"serviceType":"DOSSIER_TREATMENT","quantity":1,"unitPrice":120.00},
    {"serviceType":"ASSURANCE","quantity":3,"unitPrice":15.50}
  ]
}
```

### 2.4 Update a service
- `PATCH /services/:serviceId`
- **Role**: `admin`
- **Body** (partial)
```json
{"quantity":3,"unitPrice":18.00}
```

### 2.5 Delete a service
- `DELETE /services/:serviceId`
- **Role**: `admin`

### 2.6 Meta endpoint (dropdown values)
- `GET /meta/service-types` →
```json
["Translation","Dossier Treatment","Assurance","Visa Application","Consultation","Other"]
```
> Map UI → enum:  
> Translation→TRANSLATION, Dossier Treatment→DOSSIER_TREATMENT, Assurance→ASSURANCE, Visa Application→VISA_APPLICATION, Consultation→CONSULTATION, Other→OTHER

---

## 3) DTO & Validation (Nest)

- `CreateServiceDto`: `serviceType` (enum), `quantity` (int >=1), `unitPrice` (number >=0)  
- `CreateManyServicesDto`: `{ items: CreateServiceDto[] }` with min 1 item  
- `UpdateServiceDto`: all optional, same constraints
- Enforcer in controller/service for roles.

---

## 4) Frontend (Next.js) – Client Detail & New Client Flow

### 4.1 UI – Services Section
- Location: **Client Detail** page `/clients/[id]` (and optionally shown right after creating a new client).
- Elements per row:
  - **Service Type**: dropdown (values: Translation, Dossier Treatment, Assurance, Visa Application, Consultation, Other)
  - **Quantity**: numeric input (min 1)
  - **Unit Price**: numeric input (currency-agnostic; 2 decimals)
  - **Subtotal**: read-only = `quantity * unitPrice`
  - Buttons: **Save** (one), **Delete**
- Above the list:
  - Button **+ Add Service Row** (creates a client-side row)
  - Button **Save Services** (bulk save all **unsaved** rows)

### 4.2 Behavior
- User can add **multiple rows** and then click **Save Services** to persist all at once (calls `POST /clients/:id/services`).
- Or **save a single row** individually (calls `POST /clients/:id/service`).
- After successful save, refresh list from `GET /clients/:id/services`.
- Role `user`: form controls **disabled** (read-only).

### 4.3 Validation (client-side with Zod)
```ts
const ServiceRowSchema = z.object({
  serviceType: z.enum([
    "Translation","Dossier Treatment","Assurance","Visa Application","Consultation","Other"
  ]),
  quantity: z.coerce.number().int().min(1),
  unitPrice: z.coerce.number().min(0)
});
```
- Show inline errors; format unit price with 2 decimals.

### 4.4 UX details
- Totals bar (optional): **Total = Σ (qty * price)**.
- Toast on success/error.
- Loading/disabled states on buttons during API calls.

---

## 5) Tests

### Backend
- Unit: service creation (one & many), update, delete, list.
- e2e: `POST /clients/:id/services` rejects when `user` role; accepts for `admin`.

### Frontend
- Rendering: dropdown options present.
- Validation: qty < 1 or price < 0 shows error.
- Bulk save makes **one** API call with array length matching pending rows.

---

## 6) Git Workflow (commit examples)
- `git commit -m "5.0: Add Prisma model ServiceItem + migration"`
- `git commit -m "8.3: UI Services section with add/save one/bulk"`
- `git commit -m "API: POST /clients/:id/services (bulk) + tests"`

---

## 7) Prompt (give to Cursor)

> Implement the **Services Section** exactly as specified in this file.  
> Do it incrementally:
> 1) Add Prisma model + migration + relation in Client.  
> 2) Implement all API endpoints with DTO validation and role guards.  
> 3) Add UI on `/clients/[id]`: dynamic rows (type/quantity/unit price), Save (one) and Save Services (bulk), Delete, read-only for role `user`.  
> 4) Add `/meta/service-types` and wire the dropdown.  
> 5) Write unit/e2e tests described above.  
> After each subtask: run a quick test, then **tick the corresponding checkbox** in the main `cursor_task_checklist.md`, and commit with the task number.

### New Feature: Services Section

- [ ] **Create Backend API Endpoints for Services**
    - [ ] Define `Service` entity/model with fields: `id`, `type`, `quantity`, `unit_price`, `client_id`
    - [ ] Create `POST /clients/:id/services` endpoint to add one or multiple services
    - [ ] Create `GET /clients/:id/services` endpoint to retrieve all services for a client
    - [ ] Create `PUT /services/:id` endpoint to update a service
    - [ ] Create `DELETE /services/:id` endpoint to remove a service
    - [ ] Ensure data validation for `quantity` (must be > 0) and `unit_price` (must be >= 0)

- [ ] **Update Frontend UI for Client Portal (Services Section)**
    - [ ] Add a **"Services"** section under `Client Details` view
    - [ ] Create form with:
        - [ ] Dropdown for "Type of Service" (values from provided list in screenshot)
        - [ ] Input for "Quantity" (numeric)
        - [ ] Input for "Unit Price" (numeric, currency formatted)
    - [ ] Add button **"Add Service"** that allows adding multiple service rows before saving
    - [ ] Add button **"Save Services"** that sends all new services in a single request
    - [ ] Add inline delete button for each service row (before save)
    - [ ] Display existing services list below form

- [ ] **Frontend-Backend Integration for Services**
    - [ ] Connect "Save Services" button to backend `POST` API
    - [ ] On load, fetch and display services from backend `GET` API
    - [ ] On edit or delete, call respective `PUT` or `DELETE` APIs
    - [ ] Ensure optimistic UI updates with rollback on error

- [ ] **Testing**
    - [ ] Unit test backend service creation, update, deletion
    - [ ] Unit test frontend form behavior
    - [ ] Integration test for API calls