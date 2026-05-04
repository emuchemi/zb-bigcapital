/**
 * Zahir and Batin — Initial Compliance Calendar Seed Data
 * =========================================================
 * Opening month: May 2026.
 * Stone Town, Zanzibar. 5-suite BnB/apartment. 3 staff.
 *
 * This seed provides the first year of recurring compliance obligations.
 * All items start as 'upcoming'. Mark completed via the UI after each filing.
 *
 * Dates are based on:
 *   - PAYE: remit by 7th of following month
 *   - ZSSF: remit by 15th of following month (confirm with accountant)
 *   - WCF:  remit monthly (deadline TBC with accountant)
 *   - Hotel Levy / Tourism Levy: remit by 20th of following month (TBC)
 *   - ZCT Licence: annual, assumed January renewal
 *
 * Update due dates after accountant confirms exact filing deadlines.
 */

const UPCOMING = 'upcoming';

export const ZBComplianceItemsSeedData = [

  // ── PAYE — monthly ─────────────────────────────────────────────────────────
  // Due by 7th of the following month.
  { name: 'PAYE — May 2026', item_type: 'payroll_remittance', due_date: '2026-06-07', currency: 'TZS', status: UPCOMING, recurrence: 'monthly', notes: 'Remit to TRA/ZRB by 7th of following month.' },
  { name: 'PAYE — June 2026', item_type: 'payroll_remittance', due_date: '2026-07-07', currency: 'TZS', status: UPCOMING, recurrence: 'monthly', notes: 'Remit to TRA/ZRB by 7th of following month.' },
  { name: 'PAYE — July 2026', item_type: 'payroll_remittance', due_date: '2026-08-07', currency: 'TZS', status: UPCOMING, recurrence: 'monthly', notes: 'Remit to TRA/ZRB by 7th of following month.' },
  { name: 'PAYE — August 2026', item_type: 'payroll_remittance', due_date: '2026-09-07', currency: 'TZS', status: UPCOMING, recurrence: 'monthly', notes: 'Remit to TRA/ZRB by 7th of following month.' },
  { name: 'PAYE — September 2026', item_type: 'payroll_remittance', due_date: '2026-10-07', currency: 'TZS', status: UPCOMING, recurrence: 'monthly', notes: 'Remit to TRA/ZRB by 7th of following month.' },
  { name: 'PAYE — October 2026', item_type: 'payroll_remittance', due_date: '2026-11-07', currency: 'TZS', status: UPCOMING, recurrence: 'monthly', notes: 'Remit to TRA/ZRB by 7th of following month.' },
  { name: 'PAYE — November 2026', item_type: 'payroll_remittance', due_date: '2026-12-07', currency: 'TZS', status: UPCOMING, recurrence: 'monthly', notes: 'Remit to TRA/ZRB by 7th of following month.' },
  { name: 'PAYE — December 2026', item_type: 'payroll_remittance', due_date: '2027-01-07', currency: 'TZS', status: UPCOMING, recurrence: 'monthly', notes: 'Remit to TRA/ZRB by 7th of following month.' },

  // ── ZSSF — monthly ─────────────────────────────────────────────────────────
  // Employer 14% + Employee 7%. Deadline TBC — assuming 15th of following month.
  { name: 'ZSSF — May 2026', item_type: 'payroll_remittance', due_date: '2026-06-15', currency: 'TZS', status: UPCOMING, recurrence: 'monthly', notes: 'Employer 14% + Employee 7%. Confirm exact deadline with accountant.' },
  { name: 'ZSSF — June 2026', item_type: 'payroll_remittance', due_date: '2026-07-15', currency: 'TZS', status: UPCOMING, recurrence: 'monthly' },
  { name: 'ZSSF — July 2026', item_type: 'payroll_remittance', due_date: '2026-08-15', currency: 'TZS', status: UPCOMING, recurrence: 'monthly' },
  { name: 'ZSSF — August 2026', item_type: 'payroll_remittance', due_date: '2026-09-15', currency: 'TZS', status: UPCOMING, recurrence: 'monthly' },
  { name: 'ZSSF — September 2026', item_type: 'payroll_remittance', due_date: '2026-10-15', currency: 'TZS', status: UPCOMING, recurrence: 'monthly' },
  { name: 'ZSSF — October 2026', item_type: 'payroll_remittance', due_date: '2026-11-15', currency: 'TZS', status: UPCOMING, recurrence: 'monthly' },
  { name: 'ZSSF — November 2026', item_type: 'payroll_remittance', due_date: '2026-12-15', currency: 'TZS', status: UPCOMING, recurrence: 'monthly' },
  { name: 'ZSSF — December 2026', item_type: 'payroll_remittance', due_date: '2027-01-15', currency: 'TZS', status: UPCOMING, recurrence: 'monthly' },

  // ── Workers Compensation Fund — monthly ─────────────────────────────────────
  { name: 'WCF — May 2026', item_type: 'payroll_remittance', due_date: '2026-06-15', currency: 'TZS', status: UPCOMING, recurrence: 'monthly', notes: '0.5% of payroll. Confirm deadline with accountant.' },
  { name: 'WCF — June 2026', item_type: 'payroll_remittance', due_date: '2026-07-15', currency: 'TZS', status: UPCOMING, recurrence: 'monthly' },
  { name: 'WCF — July 2026', item_type: 'payroll_remittance', due_date: '2026-08-15', currency: 'TZS', status: UPCOMING, recurrence: 'monthly' },
  { name: 'WCF — August 2026', item_type: 'payroll_remittance', due_date: '2026-09-15', currency: 'TZS', status: UPCOMING, recurrence: 'monthly' },
  { name: 'WCF — September 2026', item_type: 'payroll_remittance', due_date: '2026-10-15', currency: 'TZS', status: UPCOMING, recurrence: 'monthly' },
  { name: 'WCF — October 2026', item_type: 'payroll_remittance', due_date: '2026-11-15', currency: 'TZS', status: UPCOMING, recurrence: 'monthly' },
  { name: 'WCF — November 2026', item_type: 'payroll_remittance', due_date: '2026-12-15', currency: 'TZS', status: UPCOMING, recurrence: 'monthly' },
  { name: 'WCF — December 2026', item_type: 'payroll_remittance', due_date: '2027-01-15', currency: 'TZS', status: UPCOMING, recurrence: 'monthly' },

  // ── Hotel Levy — monthly ────────────────────────────────────────────────────
  // 12% of accommodation revenue. Due by 20th of following month (TBC).
  { name: 'Hotel Levy — May 2026', item_type: 'levy_remittance', due_date: '2026-06-20', currency: 'TZS', status: UPCOMING, recurrence: 'monthly', notes: '12% of accommodation revenue. Confirm deadline. Pending accountant verification of applicability.' },
  { name: 'Hotel Levy — June 2026', item_type: 'levy_remittance', due_date: '2026-07-20', currency: 'TZS', status: UPCOMING, recurrence: 'monthly' },
  { name: 'Hotel Levy — July 2026', item_type: 'levy_remittance', due_date: '2026-08-20', currency: 'TZS', status: UPCOMING, recurrence: 'monthly' },
  { name: 'Hotel Levy — August 2026', item_type: 'levy_remittance', due_date: '2026-09-20', currency: 'TZS', status: UPCOMING, recurrence: 'monthly' },
  { name: 'Hotel Levy — September 2026', item_type: 'levy_remittance', due_date: '2026-10-20', currency: 'TZS', status: UPCOMING, recurrence: 'monthly' },
  { name: 'Hotel Levy — October 2026', item_type: 'levy_remittance', due_date: '2026-11-20', currency: 'TZS', status: UPCOMING, recurrence: 'monthly' },
  { name: 'Hotel Levy — November 2026', item_type: 'levy_remittance', due_date: '2026-12-20', currency: 'TZS', status: UPCOMING, recurrence: 'monthly' },
  { name: 'Hotel Levy — December 2026', item_type: 'levy_remittance', due_date: '2027-01-20', currency: 'TZS', status: UPCOMING, recurrence: 'monthly' },

  // ── Infrastructure Tax — monthly ────────────────────────────────────────────
  // USD 10/guest/night. Due monthly (deadline TBC).
  { name: 'Infrastructure Tax Remittance — May 2026', item_type: 'levy_remittance', due_date: '2026-06-20', currency: 'USD', status: UPCOMING, recurrence: 'monthly', notes: 'USD 10 per guest per night collected in May. Confirm deadline with ZRB.' },
  { name: 'Infrastructure Tax Remittance — June 2026', item_type: 'levy_remittance', due_date: '2026-07-20', currency: 'USD', status: UPCOMING, recurrence: 'monthly' },
  { name: 'Infrastructure Tax Remittance — July 2026', item_type: 'levy_remittance', due_date: '2026-08-20', currency: 'USD', status: UPCOMING, recurrence: 'monthly' },
  { name: 'Infrastructure Tax Remittance — August 2026', item_type: 'levy_remittance', due_date: '2026-09-20', currency: 'USD', status: UPCOMING, recurrence: 'monthly' },
  { name: 'Infrastructure Tax Remittance — September 2026', item_type: 'levy_remittance', due_date: '2026-10-20', currency: 'USD', status: UPCOMING, recurrence: 'monthly' },
  { name: 'Infrastructure Tax Remittance — October 2026', item_type: 'levy_remittance', due_date: '2026-11-20', currency: 'USD', status: UPCOMING, recurrence: 'monthly' },
  { name: 'Infrastructure Tax Remittance — November 2026', item_type: 'levy_remittance', due_date: '2026-12-20', currency: 'USD', status: UPCOMING, recurrence: 'monthly' },
  { name: 'Infrastructure Tax Remittance — December 2026', item_type: 'levy_remittance', due_date: '2027-01-20', currency: 'USD', status: UPCOMING, recurrence: 'monthly' },

  // ── Corporate Income Tax — annual ───────────────────────────────────────────
  // Filed within 6 months of year end (Jan–Dec year end → by June 30).
  {
    name: 'Corporate Income Tax — Year End 31 Dec 2026',
    item_type: 'tax_return',
    due_date: '2027-06-30',
    currency: 'TZS',
    status: UPCOMING,
    recurrence: 'annually',
    notes: '30% on taxable profits. File within 6 months of 31 Dec year-end. Confirm with accountant.',
  },

  // ── Licence Renewals — annual ───────────────────────────────────────────────
  {
    name: 'ZCT Tourism Business Licence Renewal',
    item_type: 'licence_renewal',
    due_date: '2027-01-31',
    currency: 'USD',
    status: UPCOMING,
    recurrence: 'annually',
    notes: 'Zanzibar Commission for Tourism. Confirm exact renewal deadline and fee. Attach certificate when renewed.',
  },
  {
    name: 'Accommodation Licence Renewal',
    item_type: 'licence_renewal',
    due_date: '2027-01-31',
    currency: 'USD',
    status: UPCOMING,
    recurrence: 'annually',
    notes: 'BnB/apartment category. Fee depends on ZCT licence grade. Confirm with ZCT.',
  },

  // ── Permit Renewals — annual ────────────────────────────────────────────────
  {
    name: 'Fire and Rescue Certificate Renewal',
    item_type: 'permit_renewal',
    due_date: '2027-01-31',
    currency: 'TZS',
    status: UPCOMING,
    recurrence: 'annually',
    notes: 'Annual fire safety compliance certificate. Contact Zanzibar Fire and Rescue.',
  },
  {
    name: 'OSHA Certificate Renewal',
    item_type: 'permit_renewal',
    due_date: '2027-01-31',
    currency: 'TZS',
    status: UPCOMING,
    recurrence: 'annually',
    notes: 'Annual workplace safety and health compliance. Contact OSHA Zanzibar.',
  },
  {
    name: 'Staff Health Certificates — Annual Renewal',
    item_type: 'permit_renewal',
    due_date: '2027-05-31',
    currency: 'TZS',
    status: UPCOMING,
    recurrence: 'annually',
    notes: 'Health certificates for housekeeping staff handling rooms. Ministry of Health. Renew annually.',
  },
];
