## New Section: Services and Payments

### Services
- **Service Type**: Dropdown with options:  
  - Translation  
  - Dossier Treatment  
  - Assurance  
  - Visa Application  
  - Consultation  
  - Other  
- **Quantity**: Numeric input.
- **Unit Price**: Numeric input.
- Possibility to **add multiple services**:
  - Fill the 3 inputs (Service Type, Quantity, Unit Price) → Add service to list.
  - Option to **Save All Services at Once** OR save **one by one**.

---

### Payments
- **Total Amount**: Automatically calculated from the sum of all services.
- **Payment Option** (Radio buttons):  
  - Bank Transfer  
  - Cheque  
  - Post  
  - Cash

- **Payment Modalities** (Radio buttons):  
  1. **Full Payment**: User specifies only **Due Date**.  
  2. **60%-40%**: User specifies **Due Date for each tranche** (60% tranche + 40% tranche).  
  3. **Milestone Payments**: User chooses **number of tranches**, specifies **percentage** for each tranche and its **Due Date**.  
  4. **80%-20%**: Same as 60%-40% but with 80% and 20% split.

- **Special Rule for Bank Transfer**:  
  If the **Due Date** (or a tranche's Due Date) is **today's date**, the user must fill an extra input field **Transfer Code**.

---

### Example Workflow:
1. Add all services to the list.
2. Review total amount.
3. Select payment option and payment modality.
4. Fill required dates and amounts depending on modality.
5. If payment option is Bank Transfer and due today → fill Transfer Code.
6. Save payment schedule.
