# Z&B Finance System — Accountant Guide

**Zahir and Batin Limited | Stone Town, Zanzibar**
**Financial year:** January – December
**Base currency:** TZS
**Operating currencies:** TZS, USD, EUR, GBP

This guide is for the reviewing accountant or auditor accessing BigCapital remotely.

---

## Access

The system is self-hosted on a Proxmox homelab in Zanzibar. Remote access is via Cloudflare Tunnel at the URL provided separately. Log in with the accountant credentials issued by the administrator.

If you cannot connect, contact the system administrator — the homelab may need to be restarted or the Cloudflare Tunnel reconnected.

---

## Architecture and data flow

BigCapital uses **double-entry bookkeeping**. Every transaction creates debit and credit entries in the General Ledger. The system prevents unbalanced entries.

**Z&B custom workflow (Sprints 3–6):**
- Founder records expenses as **Draft**
- Founder submits for review → status becomes **Pending Review**
- Accountant reviews, adjusts if necessary, and **Posts** → status becomes **Posted**
- Posted entries create GL journal entries and are locked

**Note:** The standard BigCapital publish mechanism is still available and works as before. The Z&B status field (`zb_status`) is additive — it does not replace the existing publish/draft logic.

---

## Monthly review workflow

### Step 1 — Review the Expense Inbox

Navigate to **Expenses** and filter by status **Pending Review**.

For each expense:
1. Verify the category (account) is correct. Reclassify if needed.
2. Verify the currency and amount match the receipt.
3. Verify the payment account (bank/petty cash/card) is correct.
4. Check the receipt attachment is present and legible.
5. If correct → click **Publish** (this posts the GL entries and sets status to Posted).
6. If incorrect → click **Return to Draft** and add a note explaining what needs fixing.

### Step 2 — Review the trial balance

**Reports → Trial Balance**

Check for:
- Any unexpected debit/credit imbalances
- Large unexplained entries
- Accounts with unusual movements

### Step 3 — Reconcile bank accounts

**Banking → Bank Accounts**

Match each transaction in BigCapital against the bank statement. Flag any discrepancies.

### Step 4 — Check levy and tax liability accounts

Review balances in:
- VAT Output Payable (2100)
- Infrastructure Tax Payable (2101)
- Tourism Development Levy Payable (2102)
- Blue Economy Levy Payable (2103)
- Hotel Levy Payable (2104)
- PAYE Payable (2200)
- ZSSF Payable (2201)
- WCF Payable (2203)
- Withholding Tax Payable (2210)

Any balance indicates a remittance is due. Cross-check against the Compliance Calendar.

### Step 5 — Review the Compliance Calendar

Navigate to **GET /zb/compliance/upcoming** (or via the dashboard when the UI is complete).

Mark items as completed once filed/paid. Record the reference number from ZRB/TRA.

### Step 6 — Export accountant pack

Export monthly:
- **Reports → Trial Balance** (PDF/Excel)
- **Reports → General Ledger** (filtered by month)
- **Expenses** list (filtered by month, status: Posted) with receipts index
- Levy liability account movements

---

## Chart of accounts

Full chart in `docs/chart-of-accounts.md`. Key accounts for Z&B:

**Assets (1000–1199)**
- 1001 Bank Account — TZS
- 1002 Bank Account — USD
- 1003 Petty Cash — TZS
- 1040 Accounts Receivable

**Liability — Levy accounts (2100–2210)**
All levy accounts are initially zero. They are credited when levies are collected (via invoice line items) and debited when remittances are made.

**Important:** All Zanzibar levy rates are seeded as **inactive** and marked `pending_review`. You must review each rate, confirm it against current ZRB/TRA publications, and activate applicable rates. Do not activate rates you cannot verify.

To activate a levy:
1. Go to **Settings → Tax Rates**
2. Find the rate (e.g. "Hotel Levy 12%")
3. Verify the rate and applicability
4. Click **Activate**
5. Update the confidence status and add a verification note

Similarly, hospitality charges (Infrastructure Tax, Blue Economy Levy) must be activated via the API endpoint `PUT /zb/hospitality-charges/:id` after verifying the current rates with ZRB.

---

## Expense field reference

Z&B custom fields on every expense:

| Field | Values | Notes |
|---|---|---|
| `zb_status` | draft, pending_review, posted | Workflow state |
| `project_site` | hotel_operations, construction_renovation, guest_service, staff, maintenance, utilities, permits_licences, professional_services, marketing, technology, transport, food_beverage, other | Cost centre |
| `payment_method` | cash, mobile_money, bank_transfer, stripe, card, ota_payout, other | |
| `is_petty_cash` | true/false | From petty cash float |
| `is_capex` | true/false | Capitalise vs expense |
| `is_reimbursable` | true/false | Guest/third-party reimbursable |
| `gross_amount` | decimal | Before fees |
| `fee_amount` | decimal | Processing/bank fee |
| `net_amount` | decimal | gross minus fee |
| `zb_notes` | text | Extended narrative |

**Capital expenditure:** If `is_capex` is true, do not post to an expense account. Create a manual journal entry debiting the appropriate fixed asset account (1100–1110) and crediting the payment account. Confirm with the founder what asset category applies.

---

## Foreign currency transactions

Every transaction has a `currency_code` and `exchange_rate` field. The system stores both the original currency amount and the TZS equivalent at the recorded rate.

**Exchange gain/loss** is posted automatically to account 5850 (Exchange Gain or Loss) when:
- A USD payment is received and the TZS equivalent at settlement differs from the recorded rate
- A foreign currency account balance changes due to rate movements

Review account 5850 monthly and ensure the amounts are reasonable.

**Manual rate correction:** If the founder recorded an incorrect exchange rate, you can edit the expense and adjust the rate. The GL will update automatically when re-posted.

---

## Hospitality charges

The system tracks per-guest levies via the `zb_hospitality_charges` table. This is a configurable rules engine — not hard-coded.

API endpoints:
- `GET /zb/hospitality-charges` — all rules
- `GET /zb/hospitality-charges/active?date=YYYY-MM-DD` — rules effective on date
- `PUT /zb/hospitality-charges/:id` — update a rule (change rate, activate, add notes)

For each booking cycle, the founder or system should:
1. Record the number of guests, nationality category, and nights
2. Calculate the applicable levies using the active charge rules
3. Collect from guests (add to invoice)
4. Credit the appropriate liability account (2101–2104)
5. Remit to ZRB/TRA on the due date
6. Mark the compliance item as completed with the reference number

Until the SabeeApp integration is live, this calculation is manual. A future sprint will automate it.

---

## Compliance calendar

The system has 44 pre-seeded compliance items covering the first year from opening (May 2026). These cover:
- PAYE (monthly, due 7th of following month)
- ZSSF (monthly, due 15th of following month — confirm deadline)
- WCF (monthly — confirm deadline)
- Hotel Levy (monthly, due 20th of following month — pending verification)
- Infrastructure Tax (monthly — pending verification)
- Annual ZCT licence renewal
- Annual fire/OSHA/health certificate renewals

**Important:** Due dates are working assumptions. Before the first filing, confirm all deadlines with ZRB, TRA, and ZSSF directly. Update due dates via `PUT /zb/compliance/:id`.

---

## Multi-entity considerations

This system covers **Zahir and Batin Limited (Zanzibar)** only. The US and Kenya entities are outside scope for now. Do not co-mingle transactions from other entities in this installation.

---

## Data integrity notes

- The system uses BigCapital's standard double-entry engine. All posted entries are balanced.
- The Z&B custom tables (`zb_hospitality_charges`, `zb_compliance_items`) are linked to the main accounting database but do not directly post GL entries (except where levy collections are coded to the liability accounts on invoices).
- Migrations are version-controlled. Any schema changes go through the migration system.
- Do not run direct SQL `UPDATE` or `DELETE` on production data without a full database backup.

---

## Backup and restore

Database backups run nightly via cron (`docker/backup/backup.sh`). Backups are stored on TrueNAS.

Before any major restructuring:
```bash
/opt/zb-bigcapital/docker/backup/backup.sh
```

Restore instructions are in `DEPLOYMENT.md`.
