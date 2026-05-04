import { TenantSeeder } from '@/libs/migration-seed/TenantSeeder';
import { ZBHospitalityChargesSeedData } from '../data/zb-hospitality-charges';

export default class SeedZBHospitalityCharges extends TenantSeeder {
  /**
   * Seeds initial Zanzibar hospitality charge rules.
   * All charges are inactive by default and marked pending_review.
   * Activate after accountant verification.
   */
  up(knex) {
    return knex('zb_hospitality_charges').then(() => {
      return knex('zb_hospitality_charges').insert(
        ZBHospitalityChargesSeedData.map((charge) => ({
          ...charge,
          created_at: new Date(),
          updated_at: new Date(),
        })),
      );
    });
  }
}
