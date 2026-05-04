import { TenantSeeder } from '@/libs/migration-seed/TenantSeeder';
import { ZBComplianceItemsSeedData } from '../data/zb-compliance-items';

export default class SeedZBComplianceItems extends TenantSeeder {
  /**
   * Seeds the initial Zanzibar compliance calendar for Zahir and Batin Limited.
   * Covers PAYE, ZSSF, WCF, Hotel Levy, Infrastructure Tax, CIT, and licence renewals.
   */
  up(knex) {
    return knex('zb_compliance_items').then(() => {
      return knex('zb_compliance_items').insert(
        ZBComplianceItemsSeedData.map((item) => ({
          name: item.name,
          item_type: item.item_type,
          due_date: item.due_date,
          currency: item.currency ?? 'TZS',
          status: item.status,
          recurrence: item.recurrence,
          notes: (item as any).notes ?? null,
          created_at: new Date(),
          updated_at: new Date(),
        })),
      );
    });
  }
}
