
# Invoices & Payment Receipts – Feature Spec

> Goal: Generate **Invoice** (for all services in a dossier) and **Payment Receipt** (for a single paid payment) as PDFs from the client dossier view. Use the provided PDF templates as visual guides. Leave missing fields (e.g., MF) blank.

Templates (reference only):
- Invoice layout: *Invoice - Google Sheets.pdf*
- Receipt layout: *Invoice - Google Sheets1.pdf*

---

## 1) Scope & Triggers

### 1.1 Invoice (per Dossier)
- **Where:** Dossier page (`/dossiers/[id]`), button **Generate Invoice**.
- **What:** PDF listing **all services** of the dossier, totals (subtotal, TVA, stamp), and company/client info.
- **Data:** Dossier → services, client profile, company config.

### 1.2 Payment Receipt (per Payment)
- **Where:** Payment History, next to each payment marked **PAID** → **Generate Receipt**.
- **What:** PDF confirming **that single payment**, with method, date, amount, and remaining balance for the dossier.

---

## 2) Data Model (optional but recommended for audit)

### 2.1 CompanyConfig (env or DB)
- `companyName`, `legalType?`, `mf?`, `address`, `city`, `zip`, `phone?`, `email?`, `logoUrl?`

### 2.2 Invoice
- `id`, `number` (`INV-YYYY-xxxxx`), `dossierId`, `issuedAt`, `currency`,
- `subtotal`, `tvaAmount`, `stampDuty?`, `total`, `notes?`, `pdfStorageKey?`

### 2.3 Receipt
- `id`, `number` (`RCPT-YYYY-xxxxx`), `paymentId`, `issuedAt`, `amount`, `method`, `remainingBalance`, `currency`, `pdfStorageKey?`

> Keep a small `Sequence` table for year-based counters (INV/RCPT).

---

## 3) API (NestJS)

### 3.1 Invoice
- `POST /api/v1/dossiers/:id/invoices`
  - Body: `{ currency?: "TND"|"EUR"|"USD", includeStamp?: boolean, tvaRate?: number (default 0.19), notes?: string }`
  - Server steps:
    1) Load dossier, client, services.
    2) Compute `lineTotal = qty * unitPrice`, `subtotal = Σ lineTotal`.
    3) Compute `tvaAmount = subtotal * tvaRate`, `stampDuty` if enabled.
    4) `total = subtotal + tvaAmount + (stampDuty||0)`.
    5) Generate `invoiceNumber`, (optionally) persist `Invoice`, **render PDF**, return URL/stream.
  - Response: `{ invoiceId, invoiceNumber, url }`

- `GET /api/v1/invoices/:id.pdf` → stream/download the PDF.

### 3.2 Receipt
- `POST /api/v1/payments/:paymentId/receipt`
  - Preconditions: payment **PAID**.
  - Server steps:
    1) Load payment + dossier totals (Σ services).
    2) `remainingBalance = dossierTotal - sum(paidPayments)` (after this payment).
    3) Generate `receiptNumber`, persist (optional), **render PDF**, return URL/stream.
  - Response: `{ receiptId, receiptNumber, url }`

> Permissions: `admin` create; `user` view/download only.

---

## 4) PDF Rendering (Server)

Choose one engine and stick to it:
- **Puppeteer (HTML → PDF)** with EJS/Handlebars templates (recommended for fidelity).
- or **pdfmake / @react-pdf/renderer** (JS-driven layout).

**Naming & Storage:**
- Invoice: `uploads/invoices/{YYYY}/{invoiceNumber}.pdf`
- Receipt: `uploads/receipts/{YYYY}/{receiptNumber}.pdf`
- MVP storage is local; use protected download routes (JWT).

**i18n & fonts:**
- Embed fonts supporting FR/AR if needed. Format currency to 2 decimals.

---

## 5) Field Mapping

### 5.1 Invoice (from template)
- Header: company (name, MF?), address/contact, invoice number, date.
- Customer: client name + address (MF optional).
- Table columns: Description (serviceType label), Quantity, Unit Price, Line Total.
- Totals: Subtotal, TVA, Stamp, Total.
- Footer: Notes + Signature. Show dossier reference (caseNumber).

### 5.2 Receipt (from template)
- Title: Payment Receipt.
- Body: client + dossier, **payment amount**, **method** (Bank Transfer/Cheque/Post/Cash), **date**, **remaining balance**.
- Footer: Notes + Signature.

---

## 6) Frontend (Next.js)

- **Dossier view**:
  - Button **Generate Invoice** → calls `POST /dossiers/:id/invoices`.
  - After success: toast + download link; (optional) list previous invoices with numbers & dates.

- **Payments History**:
  - For each **PAID** payment, show **Generate Receipt** action.
  - After success: toast + download link; (optional) list previous receipts.

- Hide "create" actions for `user` role; allow downloads if URLs exist.

---

## 7) Validation & Edge Cases
- Block invoice if dossier has **no services**.
- Block receipt if payment is **not PAID**.
- Compute totals server-side only; keep snapshot in DB if persisting Invoice/Receipt.
- Graceful rendering if MF or company fields are missing (blank spaces).
- Decimal precision: `Decimal(12,2)`. Avoid floating errors.

---

## 8) Tests

**Backend**
- Invoice math: multiple lines, TVA & stamp correctness.
- Receipt remaining balance math across several payments.
- Permissions on create endpoints.
- PDF endpoints return valid PDF (content-type + non-empty body).

**Frontend**
- Buttons show only where expected.
- Error states (no services / unpaid payment).
- Toasts + download links work.

---

## 9) Tasks Checklist

- [ ] CompanyConfig (env/DB) available to templates.
- [ ] Helper to compute dossier totals from services.
- [ ] API: `POST /dossiers/:id/invoices` + `GET /invoices/:id.pdf`.
- [ ] API: `POST /payments/:paymentId/receipt` + `GET /receipts/:id.pdf`.
- [ ] PDF engine + base templates created (HTML/EJS + Puppeteer or pdfmake).
- [ ] Frontend actions (buttons, toasts, history lists).
- [ ] Permissions enforced.
- [ ] Tests (backend + frontend).

---

## 10) Example payloads

**Create Invoice**
```json
POST /api/v1/dossiers/DO123/invoices
{
  "currency": "TND",
  "includeStamp": true,
  "tvaRate": 0.19,
  "notes": "Merci pour votre confiance."
}
```

**Create Receipt**
```json
POST /api/v1/payments/PAY456/receipt
{}
```

---

## 11) Commit Plan
- `feat(pdf): add invoice/receipt models & sequences`
- `feat(api): dossier invoice generation + download`
- `feat(api): payment receipt generation + download`
- `feat(ui): buttons & history lists for invoices/receipts`
- `test(pdf): invoice/receipt calculations & endpoints`
- `docs(pdf): configuration & templates`
