/**
 * Z&B Migration: add `auto_recur` flag to zb_compliance_items.
 *
 * When auto_recur is true AND recurrence is not 'once', completing an item
 * automatically creates the next occurrence (due date advanced by the
 * recurrence interval). When false, recurrence is just a label and the user
 * adds the next item manually. Default false so existing rows are unaffected.
 */
exports.up = (knex) => {
  return knex.schema.table('zb_compliance_items', (table) => {
    table.boolean('auto_recur').notNullable().defaultTo(false);
  });
};

exports.down = (knex) => {
  return knex.schema.table('zb_compliance_items', (table) => {
    table.dropColumn('auto_recur');
  });
};
