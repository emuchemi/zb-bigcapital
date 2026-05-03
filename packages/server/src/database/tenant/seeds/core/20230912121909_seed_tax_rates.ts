import { TenantSeeder } from '@/libs/migration-seed/TenantSeeder';
import { ZBTaxRates as InitialTaxRates } from '../data/zb-tax-rates'; // Z&B: replaced default with Zanzibar-specific rates

export default class SeedTaxRates extends TenantSeeder {
  /**
   * Seeds initial tax rates to the organization.
   */
  up(knex) {
    return knex('tax_rates').then(async () => {
      // Inserts seed entries.
      return knex('tax_rates').insert(InitialTaxRates);
    });
  }
}
