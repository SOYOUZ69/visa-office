# Phone Call Client Workflow – Task Checklist

## Goal
Implement a special workflow for **Phone Call** clients where Client Info, Services, and Payment Configuration are filled in one go and saved simultaneously.

---

## Tasks

### 1. Backend
- [ ] Create a new transactional API endpoint: `POST /clients/phone-call`
  - Accepts payload including Client Info, Services, and Payment Configuration.
  - Validates all fields (sum of milestones = 100%, due dates required, transfer code required if due today and bank transfer).
  - Saves Client + Services + Payment in a single DB transaction.
- [ ] Ensure rollback if any part fails.
- [ ] Reuse existing validation logic from standard client creation.

### 2. Frontend
- [ ] Add a new workflow/wizard UI for Phone Call client creation.
  - Step 1: Client Information
  - Step 2: Services selection
  - Step 3: Payment Configuration
  - Final Step: Save All
- [ ] Ensure that the "Save All" button calls the new API endpoint.
- [ ] After saving, redirect to Client Detail page showing Payment History only.
- [ ] Add an **Edit Payment Configuration** button that reopens the form with prefilled data.

### 3. Database
- [ ] No new tables required; reuse existing schema for Clients, Services, and Payment Config.
- [ ] Ensure correct foreign keys are set when saving everything at once.

### 4. QA & Testing
- [ ] Test workflow for Phone Call client: create → save → view → edit payment.
- [ ] Verify that normal clients still follow the old flow (no regression).
- [ ] Add unit tests and integration tests for transactional API.
