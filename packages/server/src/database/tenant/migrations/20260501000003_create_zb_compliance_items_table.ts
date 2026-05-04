/**
 * Z&B Migration: create zb_compliance_items table.
 *
 * Tracks Zanzibar/Tanzania tax filing deadlines, levy remittances,
 * licence renewals, and permit expiry dates.
 *
 * item_type values:
 *   'tax_return'          — e.g. VAT monthly return
 *   'levy_remittance'     — e.g. Hotel Levy monthly payment
 *   'payroll_remittance'  — e.g. PAYE, ZSSF monthly
 *   'licence_renewal'     — e.g. ZCT tourism licence annual renewal
 *   'permit_renewal'      — e.g. fire certificate, OSHA annual renewal
 *   'other'               — any other compliance obligation
 *
 * status values:
 *   'upcoming'   — due date is in the future
 *   'overdue'    — past due date, not yet completed
 *   'completed'  — filed/paid/renewed
 *   'waived'     — formally waived or not applicable this period
 *
 * recurrence values:
 *   'once'       — one-time obligation
 *   'monthly'    — repeat every month (new rows created automatically)
 *   'quarterly'  — repeat every quarter
 *   'annually'   — repeat every year
 */
exports.up = (knex) => {
  return knex.schema.createTable('zb_compliance_items', (table) => {
    table.increments('id');

    table.string('name').notNullable();

    table
      .enu('item_type', [
        'tax_return',
        'levy_remittance',
        'payroll_remittance',
        'licence_renewal',
        'permit_renewal',
        'other',
      ])
      .notNullable();

    table.date('due_date').notNullable().index();

    // Optional: amount to be paid (null for filings with no payment)
    table.decimal('amount_due', 13, 3).nullable();
    table.string('currency', 3).notNullable().defaultTo('TZS');

    table
      .enu('status', ['upcoming', 'overdue', 'completed', 'waived'])
      .notNullable()
      .defaultTo('upcoming')
      .index();

    table.string('responsible_person').nullable();

    // Link to the GL liability account (e.g. PAYE Payable)
    table
      .integer('linked_account_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('accounts');

    table.text('notes').nullable();

    // Date completed (when status set to 'completed')
    table.date('completed_at').nullable();

    // Reference number for the filing or payment receipt
    table.string('reference_number').nullable();

    table
      .enu('recurrence', ['once', 'monthly', 'quarterly', 'annually'])
      .notNullable()
      .defaultTo('once');

    table.timestamps(true, true);
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('zb_compliance_items');
};
