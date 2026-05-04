/**
 * Zahir and Batin — Zanzibar Hospitality Charge Seed Data
 * =========================================================
 * All charges are seeded with confidence_status = 'pending_review'.
 * A qualified Zanzibar accountant must confirm rates before activating.
 *
 * Fixed per-guest charges (Infrastructure Tax, Blue Economy Levy) are stored
 * here with their correct rates. The API endpoint GET /zb/hospitality-charges/active
 * returns the applicable charges for a given booking date and guest category.
 *
 * Rates are as of 2024. Update through the admin UI — do not change this file.
 */

export const ZBHospitalityChargesSeedData = [
  // ── Infrastructure Tax ─────────────────────────────────────────────────────
  // Fixed USD 10 per foreign/resident/citizen guest per night.
  // Effective 1 August 2024.
  {
    name: 'Infrastructure Tax — Foreign Guests',
    authority: 'Zanzibar Revenue Board',
    charge_type: 'fixed_per_guest_night',
    rate: 10,
    currency: 'USD',
    guest_category: 'foreign',
    effective_from: '2024-08-01',
    effective_to: null,
    remittance_frequency: 'monthly',
    accounting_treatment: 'pass_through',
    confidence_status: 'pending_review',
    active: false,
    notes:
      'USD 10 per foreign guest per night. Collect from guest, remit to ZRB monthly. ' +
      'Pending accountant confirmation of current rate and remittance deadline.',
  },
  {
    name: 'Infrastructure Tax — Tanzanian Residents',
    authority: 'Zanzibar Revenue Board',
    charge_type: 'fixed_per_guest_night',
    rate: 10,
    currency: 'USD',
    guest_category: 'resident',
    effective_from: '2024-08-01',
    effective_to: null,
    remittance_frequency: 'monthly',
    accounting_treatment: 'pass_through',
    confidence_status: 'pending_review',
    active: false,
    notes:
      'USD 10 per Tanzanian resident guest per night. Confirm whether residents pay same rate as foreigners.',
  },
  {
    name: 'Infrastructure Tax — Tanzanian Citizens',
    authority: 'Zanzibar Revenue Board',
    charge_type: 'fixed_per_guest_night',
    rate: 10,
    currency: 'USD',
    guest_category: 'citizen',
    effective_from: '2024-08-01',
    effective_to: null,
    remittance_frequency: 'monthly',
    accounting_treatment: 'pass_through',
    confidence_status: 'pending_review',
    active: false,
    notes:
      'USD 10 per Tanzanian citizen per night. Confirm whether citizens pay same rate or a reduced rate.',
  },

  // ── Blue Economy Levy ──────────────────────────────────────────────────────
  // Per-guest levy by nationality.
  {
    name: 'Blue Economy Levy — Foreign Adults',
    authority: 'Ministry of Blue Economy and Fisheries',
    charge_type: 'fixed_per_guest_night',
    rate: 25,
    currency: 'USD',
    guest_category: 'foreign',
    effective_from: '2024-01-01',
    effective_to: null,
    remittance_frequency: 'monthly',
    accounting_treatment: 'pass_through',
    confidence_status: 'pending_review',
    active: false,
    notes:
      'USD 25 per foreign adult per night. Confirm current rate and whether it is per-night or per-stay.',
  },
  {
    name: 'Blue Economy Levy — Tanzanian Residents',
    authority: 'Ministry of Blue Economy and Fisheries',
    charge_type: 'fixed_per_guest_night',
    rate: 12,
    currency: 'USD',
    guest_category: 'resident',
    effective_from: '2024-01-01',
    effective_to: null,
    remittance_frequency: 'monthly',
    accounting_treatment: 'pass_through',
    confidence_status: 'pending_review',
    active: false,
    notes: 'USD 12 per Tanzanian resident per night. Pending accountant verification.',
  },
  {
    name: 'Blue Economy Levy — Tanzanian Citizens',
    authority: 'Ministry of Blue Economy and Fisheries',
    charge_type: 'fixed_per_guest_night',
    rate: 10,
    currency: 'USD',
    guest_category: 'citizen',
    effective_from: '2024-01-01',
    effective_to: null,
    remittance_frequency: 'monthly',
    accounting_treatment: 'pass_through',
    confidence_status: 'pending_review',
    active: false,
    notes: 'USD 10 per Tanzanian citizen per night. Pending accountant verification.',
  },

  // ── Tourism Development Levy ───────────────────────────────────────────────
  {
    name: 'Tourism Development Levy',
    authority: 'Tanzania Revenue Authority',
    charge_type: 'percentage_of_revenue',
    rate: 1,
    currency: 'TZS',
    guest_category: 'all',
    effective_from: '2024-01-01',
    effective_to: null,
    remittance_frequency: 'monthly',
    accounting_treatment: 'pass_through',
    confidence_status: 'pending_review',
    active: false,
    notes:
      '1% of room rate per guest per night. Collected for TRA. ' +
      'Pending accountant confirmation of filing deadline.',
  },

  // ── Hotel Levy ─────────────────────────────────────────────────────────────
  {
    name: 'Hotel Levy',
    authority: 'Zanzibar Revenue Board',
    charge_type: 'percentage_of_revenue',
    rate: 12,
    currency: 'TZS',
    guest_category: 'all',
    effective_from: '2024-01-01',
    effective_to: null,
    remittance_frequency: 'monthly',
    accounting_treatment: 'pass_through',
    confidence_status: 'pending_review',
    active: false,
    notes:
      '12% of chargeable accommodation value. Confirm that BnB/apartment category applies at this rate. ' +
      'Pending accountant sign-off.',
  },
];
