import { TenantBaseModel } from '@/modules/System/models/TenantBaseModel';

export class ZBComplianceItem extends TenantBaseModel {
  id!: number;
  name!: string;
  itemType!: 'tax_return' | 'levy_remittance' | 'payroll_remittance' | 'licence_renewal' | 'permit_renewal' | 'other';
  dueDate!: Date;
  amountDue?: number;
  currency!: string;
  status!: 'upcoming' | 'overdue' | 'completed' | 'waived';
  responsiblePerson?: string;
  linkedAccountId?: number;
  notes?: string;
  completedAt?: Date;
  referenceNumber?: string;
  recurrence!: 'once' | 'monthly' | 'quarterly' | 'annually';
  autoRecur!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  static get tableName() {
    return 'zb_compliance_items';
  }

  get timestamps() {
    return ['createdAt', 'updatedAt'];
  }

  static get modifiers() {
    return {
      upcoming(query) {
        query.where('status', 'upcoming').orderBy('due_date', 'asc');
      },
      overdue(query) {
        const today = new Date().toISOString().split('T')[0];
        query
          .where('status', 'upcoming')
          .where('due_date', '<', today);
      },
      dueWithinDays(query, days: number) {
        const today = new Date();
        const future = new Date();
        future.setDate(today.getDate() + days);
        query
          .where('status', 'upcoming')
          .where('due_date', '>=', today.toISOString().split('T')[0])
          .where('due_date', '<=', future.toISOString().split('T')[0])
          .orderBy('due_date', 'asc');
      },
    };
  }
}
