/**
 * Zahir and Batin Limited — Zanzibar Tax and Levy Seed Data
 * ==========================================================
 * All rates are working assumptions pending accountant verification.
 * All rates are inactive by default — enable individually after sign-off.
 *
 * IMPORTANT: description column is VARCHAR(255). Keep values under 200 chars.
 * Full compliance detail belongs in docs/accountant-guide.md, not here.
 */

export const ZBTaxRates = [

  // ── System placeholder ─────────────────────────────────────────────────────

  {
    name: 'Tax Exempt',
    code: 'TAX-EXEMPT',
    description: 'No tax applies to this transaction.',
    rate: 0,
    is_non_recoverable: false,
    is_compound: false,
    active: 1,
  },

  // ── VAT ────────────────────────────────────────────────────────────────────

  {
    name: 'VAT — Standard (15%)',
    code: 'VAT-15',
    description: 'Tanzania/Zanzibar VAT at 15%. Authority: ZRB. File by 20th of following month. Inactive — Z&B below threshold; enable on accountant confirmation.',
    rate: 15,
    is_non_recoverable: false,
    is_compound: false,
    active: 0,
  },

  // ── Hotel and Accommodation Levies ─────────────────────────────────────────

  {
    name: 'Hotel Levy (12%)',
    code: 'HOTEL-LEVY-12',
    description: '12% of chargeable accommodation value. Authority: ZRB. Inactive — confirm BnB/apartment applicability with accountant before enabling.',
    rate: 12,
    is_non_recoverable: true,
    is_compound: false,
    active: 0,
  },

  // ── Infrastructure Tax ─────────────────────────────────────────────────────
  // Fixed USD 10/guest/night — NOT a percentage. Rate 0 is a placeholder.
  // Use the hospitality charge engine for correct per-guest calculation.

  {
    name: 'Infrastructure Tax (Fixed — see notes)',
    code: 'INFRA-TAX',
    description: 'Fixed USD 10/guest/night (not a %). Authority: ZRB. Use hospitality charge engine for calculation. Inactive — pending accountant verification.',
    rate: 0,
    is_non_recoverable: true,
    is_compound: false,
    active: 0,
  },

  // ── Tourism Development Levy ───────────────────────────────────────────────

  {
    name: 'Tourism Development Levy (1%)',
    code: 'TDL-1',
    description: '1% of room rate per guest/night. Authority: TRA. Pass-through liability (acct 2102). Inactive — confirm remittance deadline with accountant.',
    rate: 1,
    is_non_recoverable: true,
    is_compound: false,
    active: 0,
  },

  // ── Blue Economy Levy ──────────────────────────────────────────────────────
  // Fixed amounts by nationality — not a percentage. Rate 0 is a placeholder.
  // Use the hospitality charge engine for correct per-guest calculation.

  {
    name: 'Blue Economy Levy (Fixed — see notes)',
    code: 'BLUE-ECO',
    description: 'Fixed/guest: USD 25 foreign, USD 12 resident, USD 10 citizen. Authority: Ministry of Blue Economy. Use hospitality charge engine. Inactive — pending verification.',
    rate: 0,
    is_non_recoverable: true,
    is_compound: false,
    active: 0,
  },

  // ── Withholding Tax ────────────────────────────────────────────────────────

  {
    name: 'Withholding Tax — Resident Services (10%)',
    code: 'WHT-RESIDENT-10',
    description: '10% WHT on payments to resident consultants/professionals. Deduct at source; remit to TRA/ZRB. Inactive — confirm current rate with accountant.',
    rate: 10,
    is_non_recoverable: true,
    is_compound: false,
    active: 0,
  },
  {
    name: 'Withholding Tax — Non-Resident Services (15%)',
    code: 'WHT-NONRESIDENT-15',
    description: '15% WHT on payments to non-resident service providers. Deduct at source; remit to TRA. Inactive — confirm current rate with accountant.',
    rate: 15,
    is_non_recoverable: true,
    is_compound: false,
    active: 0,
  },

  // ── Local Service Levy ─────────────────────────────────────────────────────

  {
    name: 'Local Service Levy (0.3%)',
    code: 'LOCAL-LEVY-03',
    description: 'Local authority levy on turnover, up to 0.3%. Authority: Zanzibar Municipal Council. Inactive — MEDIUM confidence; confirm Stone Town applicability.',
    rate: 0.3,
    is_non_recoverable: true,
    is_compound: false,
    active: 0,
  },

  // ── Generic placeholder ────────────────────────────────────────────────────

  {
    name: 'Tax on Purchases',
    code: 'TAX-PURCHASES',
    description: 'Generic purchase tax placeholder. Use specific WHT codes for supplier payments.',
    rate: 0,
    is_non_recoverable: false,
    is_compound: false,
    active: 0,
  },
];
