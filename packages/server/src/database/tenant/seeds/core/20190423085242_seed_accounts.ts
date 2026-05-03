import { TenantSeeder } from '@/libs/migration-seed/TenantSeeder';
import { AccountsData } from '../data/zb-accounts'; // Z&B: replaced default with Z&B chart of accounts

export default class SeedAccounts extends TenantSeeder {
  /**
   * Seeds initial accounts to the organization.
   */
  up(knex) {
    const data = AccountsData.map((account) => ({
      ...account,
      name: this.i18n.t(account.name),
      description: account.description ? this.i18n.t(account.description) : '',
      currencyCode: this.tenant.metadata.baseCurrency,
      seededAt: new Date(),
    }));
    return knex('accounts').then(async () => {
      // Inserts seed entries.
      return knex('accounts').insert(data);
    });
  }
}
