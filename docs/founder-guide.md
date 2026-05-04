# Z&B Finance System — Founder Guide

**Zahir and Batin Limited | Stone Town, Zanzibar**

This guide is written for you — the founder — not for your accountant. It explains what you need to do day to day without requiring any accounting knowledge.

---

## What this system does for you

BigCapital is the financial backbone of Zahir and Batin Limited. Everything that happens with money — expenses, guest payments, taxes, bank accounts — gets recorded here. Your accountant reviews and posts the entries. You focus on recording what happened and attaching receipts.

---

## Your daily workflow

### Recording an expense

You spent money. Record it immediately — don't let it pile up.

1. Go to **Expenses** in the left menu
2. Click **New Expense**
3. Fill in:
   - **Payment date** — the date you paid (not today, not when you get the receipt — the actual payment date)
   - **Payment account** — which account the money came from (Bank TZS, Petty Cash TZS, Stripe, etc.)
   - **Currency** — TZS or USD etc.
   - **Amount** — what you paid
   - **Category** — choose the most appropriate expense account (Cleaning and Laundry, Guest Services, Maintenance, etc.)
   - **Project site** — choose the area this belongs to (Hotel Operations, Construction, etc.)
   - **Payment method** — Cash, Mobile Money, Bank Transfer, Stripe, etc.
   - **Notes** — a brief plain-English description. Be specific. "Paid Mohamed TZS 45,000 for laundry supplies, 3 May" is better than "supplies".
4. Attach the receipt photo (tap the paperclip icon, or take a photo)
5. **Save as Draft** — it goes into the Expense Inbox for your accountant to review

**Important:** Do not press Publish. That is the accountant's job.

---

### Attaching a receipt

Always attach a receipt. If you don't have a paper receipt:
- Screenshot a mobile money confirmation
- Screenshot a WhatsApp payment confirmation
- Type a note in the Notes field explaining why there is no receipt

No receipt + no explanation = your accountant will return the expense to you.

---

### Checking the Expense Inbox

Go to **Expenses → Inbox** to see:
- **Draft** — you saved it but haven't submitted it yet
- **Pending Review** — submitted to accountant, waiting for their check
- **Posted** — accountant approved and locked it

If an expense appears back in **Draft** after being in Pending Review, it means your accountant returned it for a correction. Check the notes field for what needs fixing.

---

### Submitting expenses for review

Once you're satisfied with an expense entry:
1. Open the expense
2. Click **Submit for Review**
3. It moves from Draft to Pending Review

You can submit them individually or batch-submit several at once at the end of the week.

---

### Petty cash

Petty cash is the cash kept on-site for small day-to-day payments.

When you pay for something from petty cash:
- Set Payment Account to **Petty Cash — TZS**
- Tick the **Petty Cash** checkbox
- Record as normal

When you top up the petty cash float from the bank:
- This is a **Transfer**, not an Expense
- Go to **Banking** and record a transfer from Bank TZS to Petty Cash TZS

---

### Recording guest payments

Guest payments (room revenue) come in through SabeeApp. For now, until the SabeeApp integration is live:

1. Go to **Sales → Invoices**
2. Create a new invoice for the guest stay
3. Set the amount, currency, and due date
4. When payment is received, mark it as paid and record which account received it

---

### Currencies

Your accounts are:
- **Bank Account — TZS** — local TZS bank account
- **Bank Account — USD** — USD account for international transfers
- **Stripe Settlement Clearing** — where Stripe card payments land

When a guest pays in USD cash, record the expense or receipt in USD. BigCapital will ask for the exchange rate — use the rate you actually received (check your bank app or the rate you agreed with the guest).

---

## Reading the dashboard

The dashboard (coming in the next update) will show you:

| Widget | What it means |
|---|---|
| Cash Position | Current balance in each bank/cash account |
| Petty Cash | How much cash is in the float |
| Unpaid Bills | What you owe suppliers |
| Expense Inbox | How many expenses are waiting for review |
| Monthly Burn | Total spending this month |
| Monthly Revenue | Income received this month |
| Upcoming Compliance | Tax and licence deadlines in the next 30 days |

---

## What NOT to do

- **Do not publish/post expenses yourself.** That is the accountant's role. Posting creates permanent accounting entries.
- **Do not delete expenses** once they are in Pending Review. Contact your accountant first.
- **Do not change the chart of accounts** (the account list). This requires accountant sign-off.
- **Do not change tax rates or levy settings** without your accountant's approval.
- **Do not record salaries or payroll** yourself. Your accountant handles payroll entries.

---

## Common questions

**I made a mistake in an expense I already submitted.**
Contact your accountant. They will return it to Draft so you can edit it.

**I don't know which category to use.**
Use **Office Expenses** or **Other Expenses** and leave a note explaining what it was. Your accountant will reclassify it.

**The guest paid in a mix of USD cash and mobile money.**
Record two separate expenses/receipts — one for each payment method. This keeps your records clean.

**I lost the receipt.**
Note it clearly in the Notes field: "Receipt lost. Paid TZS 20,000 to [name] for [what]. Confirmed via WhatsApp — see screenshot in notes." Then attach the WhatsApp screenshot.

**The system is slow or not loading.**
Check that your homelab server is on and that you're connected to the right network. Contact whoever manages the server (your IT support).

---

## Getting help

For questions about how to record something: contact your accountant.
For questions about how the software works: refer to this guide or raise with the system administrator.

Do not guess. If you're unsure, record what happened in plain English in the Notes field and let your accountant sort it out.
