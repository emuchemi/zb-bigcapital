/**
 * Z&B Migration: add hospitality expense fields to expenses_transactions table.
 *
 * Adds a `zb_status` workflow column plus operational metadata fields.
 * All columns are nullable or have defaults so existing rows are unaffected.
 *
 * zb_status workflow:
 *   'draft'          → expense saved but not yet reviewed
 *   'pending_review' → submitted to accountant for review
 *   'posted'         → accountant approved, locked for reporting
 *
 * NOTE: zb_status co-exists with the existing published_at column.
 * When an expense is published via the standard publish endpoint,
 * the ZBExpenseStatusSubscriber also sets zb_status = 'posted'.
 */
exports.up = (knex) => {
  return knex.schema.table('expenses_transactions', (table) => {
    // Workflow status — replaces relying on published_at alone for Z&B flows
    table
      .enu('zb_status', ['draft', 'pending_review', 'posted'])
      .notNullable()
      .defaultTo('draft')
      .index();

    // Project or cost centre tag
    table
      .enu('project_site', [
        'hotel_operations',
        'construction_renovation',
        'guest_service',
        'staff',
        'maintenance',
        'utilities',
        'permits_licences',
        'professional_services',
        'marketing',
        'technology',
        'transport',
        'food_beverage',
        'other',
      ])
      .nullable();

    // Payment method used for this expense
    table
      .enu('payment_method', [
        'cash',
        'mobile_money',
        'bank_transfer',
        'stripe',
        'card',
        'ota_payout',
        'other',
      ])
      .nullable();

    // Flag: was this from the petty cash float?
    table.boolean('is_petty_cash').notNullable().defaultTo(false);

    // Flag: should this be capitalised as a fixed asset?
    table.boolean('is_capex').notNullable().defaultTo(false);

    // Flag: is this reimbursable by a guest or third party?
    table.boolean('is_reimbursable').notNullable().defaultTo(false);

    // Gross amount before payment processing fees
    table.decimal('gross_amount', 13, 3).nullable();

    // Fee charged by bank, Stripe, mobile money, OTA, etc.
    table.decimal('fee_amount', 13, 3).nullable().defaultTo(0);

    // Account to debit the fee to (e.g. Stripe Fees account 5151)
    table
      .integer('fee_account_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('accounts');

    // Net amount received after fees (gross_amount - fee_amount)
    table.decimal('net_amount', 13, 3).nullable();

    // Extended notes field (separate from short description)
    table.text('zb_notes').nullable();
  });
};

exports.down = (knex) => {
  return knex.schema.table('expenses_transactions', (table) => {
    table.dropColumn('zb_status');
    table.dropColumn('project_site');
    table.dropColumn('payment_method');
    table.dropColumn('is_petty_cash');
    table.dropColumn('is_capex');
    table.dropColumn('is_reimbursable');
    table.dropColumn('gross_amount');
    table.dropColumn('fee_amount');
    table.dropColumn('fee_account_id');
    table.dropColumn('net_amount');
    table.dropColumn('zb_notes');
  });
};
