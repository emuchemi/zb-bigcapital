/**
 * Z&B Migration: create zb_hospitality_charges table.
 *
 * Stores configurable per-guest, per-night, and percentage-based hospitality
 * levies for Zanzibar/Tanzania compliance. All rates are admin-configurable —
 * nothing is hard-coded in business logic.
 *
 * charge_type values:
 *   'fixed_per_guest_night' — e.g. Infrastructure Tax: USD 10/guest/night
 *   'percentage_of_revenue' — e.g. Hotel Levy: 12% of accommodation revenue
 *   'fixed_per_booking'     — e.g. a fixed per-reservation fee
 *
 * guest_category values:
 *   'foreign'   — non-citizen, non-resident visitors
 *   'resident'  — Tanzanian residents (non-citizen)
 *   'citizen'   — Tanzanian citizens
 *   'all'       — applies regardless of guest type
 *
 * accounting_treatment values:
 *   'pass_through' — collected on behalf of authority, not our revenue
 *   'expense'      — an operating cost of the business
 *   'revenue'      — recognised as our own income
 */
exports.up = (knex) => {
  return knex.schema.createTable('zb_hospitality_charges', (table) => {
    table.increments('id');

    table.string('name').notNullable();
    table.string('authority').nullable();

    table
      .enu('charge_type', [
        'fixed_per_guest_night',
        'percentage_of_revenue',
        'fixed_per_booking',
      ])
      .notNullable();

    // For fixed types: the amount. For percentage types: the rate (e.g. 12 = 12%).
    table.decimal('rate', 13, 4).notNullable();

    // Currency for fixed-amount charges (e.g. 'USD' for Infrastructure Tax)
    table.string('currency', 3).notNullable().defaultTo('TZS');

    table
      .enu('guest_category', ['foreign', 'resident', 'citizen', 'all'])
      .notNullable()
      .defaultTo('all');

    table.date('effective_from').notNullable();
    table.date('effective_to').nullable();

    // GL account to credit when levy is collected (liability account)
    table
      .integer('liability_account_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('accounts');

    table
      .enu('remittance_frequency', ['monthly', 'quarterly', 'annually', 'per_booking'])
      .notNullable()
      .defaultTo('monthly');

    table
      .enu('accounting_treatment', ['pass_through', 'expense', 'revenue'])
      .notNullable()
      .defaultTo('pass_through');

    // 'pending_review' until accountant confirms; 'verified' after sign-off
    table
      .enu('confidence_status', ['pending_review', 'verified'])
      .notNullable()
      .defaultTo('pending_review');

    table.text('notes').nullable();

    table.boolean('active').notNullable().defaultTo(true);

    table.timestamps(true, true);
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('zb_hospitality_charges');
};
