/**
 * Zahir and Batin Limited — Zanzibar Tax and Levy Seed Data
 * ==========================================================
 * Stone Town boutique hotel, 5 suites.
 *
 * IMPORTANT — READ BEFORE EDITING:
 * All rates below are working assumptions based on publicly available
 * Zanzibar/Tanzania regulations. They have NOT been independently verified
 * by a qualified Zanzibar accountant or legal adviser.
 *
 * Rates, applicability, and remittance frequencies MUST be confirmed before
 * filing any returns. Never edit these rates by changing this file alone —
 * update them through the Tax Rates screen in BigCapital so changes are logged.
 *
 * Confidence levels:
 *   HIGH   — Strong public evidence, likely correct, still needs accountant sign-off
 *   MEDIUM — Likely applicable but category or rate uncertain
 *   REVIEW — Specifically needs accountant or legal confirmation before applying
 *
 * Schema: tax_rates table
 *   name             — Display name shown in invoices and reports
 *   code             — Short internal reference code
 *   rate             — Percentage rate (e.g. 15 = 15%). Fixed per-night charges
 *                      are recorded as 0% here — they require the hospitality
 *                      charge engine (Sprint 4) for correct per-guest handling.
 *   description      — Full details including authority, remittance, and confidence
 *   is_non_recoverable — true = cannot reclaim as input tax (most hospitality levies)
 *   is_compound      — true = applied on top of other taxes (none here)
 *   active           — 0 = disabled by default (enable after accountant confirms)
 */

export const ZBTaxRates = [

  // ── Standard placeholder rates (keep for system compatibility) ──────────────

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
    description:
      'Tanzania/Zanzibar standard VAT rate. Apply to taxable supplies once VAT-registered. ' +
      'Filing deadline: 20th of the following month. ' +
      'Authority: Zanzibar Revenue Board (ZRB). ' +
      'NOTE: Z&B is currently below the VAT registration threshold. ' +
      'Enable this rate when the accountant confirms VAT registration is required ' +
      '(expected year 4-5). Confidence: HIGH.',
    rate: 15,
    is_non_recoverable: false,
    is_compound: false,
    active: 0, // disabled until VAT registration is confirmed
  },

  // ── Hotel and Accommodation Levies ─────────────────────────────────────────

  {
    name: 'Hotel Levy (12%)',
    code: 'HOTEL-LEVY-12',
    description:
      '12% of the chargeable value of accommodation services. ' +
      'Applies to hotels, guesthouses, and similar accommodation providers. ' +
      'Collected by the hotel and remitted to ZRB. ' +
      'Z&B classification (BnB/apartment) should be confirmed with ZCT and ZRB ' +
      'to verify that this levy applies at this rate. ' +
      'Authority: Zanzibar Revenue Board. ' +
      'Confidence: HIGH — pending accountant verification of applicability to BnB category.',
    rate: 12,
    is_non_recoverable: true,
    is_compound: false,
    active: 0, // enable after accountant confirms
  },

  // ── Infrastructure Tax ─────────────────────────────────────────────────────
  // This is a fixed USD 10 per guest per night — NOT a percentage.
  // Rate is set to 0 here as a placeholder. Correct handling requires the
  // hospitality charge engine (Sprint 4) which supports fixed-per-guest charges.

  {
    name: 'Infrastructure Tax (Fixed — see notes)',
    code: 'INFRA-TAX',
    description:
      'Fixed charge of USD 10 per guest per night. Effective 1 August 2024. ' +
      'Collected from overnight guests and remitted to Zanzibar Revenue Board. ' +
      'Accounting treatment: pass-through liability (credit Infrastructure Tax Payable, account 2101). ' +
      'IMPORTANT: This is a fixed per-guest charge, not a percentage. ' +
      'Rate shown here (0%) is a placeholder — use the hospitality charge engine for correct calculation. ' +
      'Authority: Zanzibar Revenue Board. ' +
      'Confidence: HIGH — pending accountant verification of remittance frequency.',
    rate: 0,
    is_non_recoverable: true,
    is_compound: false,
    active: 0,
  },

  // ── Tourism Development Levy ───────────────────────────────────────────────

  {
    name: 'Tourism Development Levy (1%)',
    code: 'TDL-1',
    description:
      '1% of room rate per guest per night. ' +
      'Collected by the hotel on behalf of Tanzania Revenue Authority. ' +
      'Accounting treatment: pass-through liability (credit Tourism Development Levy Payable, account 2102). ' +
      'Authority: Tanzania Revenue Authority (TRA). ' +
      'Confirm remittance frequency and filing deadline with accountant. ' +
      'Confidence: HIGH — pending accountant verification.',
    rate: 1,
    is_non_recoverable: true,
    is_compound: false,
    active: 0,
  },

  // ── Blue Economy Levy ──────────────────────────────────────────────────────
  // Per-guest fixed amounts vary by nationality — not a simple percentage.
  // Recorded here at 0% as a placeholder. Full handling in Sprint 4.

  {
    name: 'Blue Economy Levy (Fixed — see notes)',
    code: 'BLUE-ECO',
    description:
      'Per-guest levy collected by hotels and remitted to Ministry of Blue Economy and Fisheries. ' +
      'Working rates: USD 25 per foreign adult, USD 12 per Tanzanian resident, USD 10 per citizen. ' +
      '50% rate may apply for day-trippers. ' +
      'Accounting treatment: pass-through liability (credit Blue Economy Levy Payable, account 2103). ' +
      'IMPORTANT: Varies by guest nationality — not a percentage. ' +
      'Rate shown here (0%) is a placeholder — use the hospitality charge engine for correct per-guest calculation. ' +
      'Authority: Ministry of Blue Economy and Fisheries. ' +
      'Confidence: HIGH — pending accountant verification of current rates.',
    rate: 0,
    is_non_recoverable: true,
    is_compound: false,
    active: 0,
  },

  // ── Withholding Tax ────────────────────────────────────────────────────────

  {
    name: 'Withholding Tax — Resident Services (10%)',
    code: 'WHT-RESIDENT-10',
    description:
      '10% withholding tax deducted from payments to resident consultants and professionals. ' +
      'Deduct at source and remit to TRA/ZRB. ' +
      'Apply when paying: accountants, legal advisers, architects, IT consultants, etc. ' +
      'Authority: Tanzania Revenue Authority / Zanzibar Revenue Board. ' +
      'Confidence: HIGH — pending accountant confirmation of current rate.',
    rate: 10,
    is_non_recoverable: true,
    is_compound: false,
    active: 0,
  },
  {
    name: 'Withholding Tax — Non-Resident Services (15%)',
    code: 'WHT-NONRESIDENT-15',
    description:
      '15% withholding tax deducted from payments to non-resident service providers. ' +
      'Apply when paying foreign consultants, overseas software vendors, etc. ' +
      'Authority: Tanzania Revenue Authority. ' +
      'Confidence: HIGH — pending accountant confirmation.',
    rate: 15,
    is_non_recoverable: true,
    is_compound: false,
    active: 0,
  },

  // ── Local Service Levy ─────────────────────────────────────────────────────

  {
    name: 'Local Service Levy (0.3%)',
    code: 'LOCAL-LEVY-03',
    description:
      'Local authority levy on turnover. Working assumption: up to 0.3% (may be standardised at 0.25% under 2025 Finance Act). ' +
      'Zanzibar municipal council applicability must be verified — may not apply to Stone Town businesses. ' +
      'Authority: Zanzibar Municipal Council. ' +
      'Confidence: MEDIUM — confirm with accountant before applying.',
    rate: 0.3,
    is_non_recoverable: true,
    is_compound: false,
    active: 0,
  },

  // ── Tax Exempt placeholder for zero-rated items ────────────────────────────

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
