import { TenantBaseModel } from '@/modules/System/models/TenantBaseModel';

export class ZBHospitalityCharge extends TenantBaseModel {
  id!: number;
  name!: string;
  authority?: string;
  chargeType!: 'fixed_per_guest_night' | 'percentage_of_revenue' | 'fixed_per_booking';
  rate!: number;
  currency!: string;
  guestCategory!: 'foreign' | 'resident' | 'citizen' | 'all';
  effectiveFrom!: Date;
  effectiveTo?: Date;
  liabilityAccountId?: number;
  remittanceFrequency!: 'monthly' | 'quarterly' | 'annually' | 'per_booking';
  accountingTreatment!: 'pass_through' | 'expense' | 'revenue';
  confidenceStatus!: 'pending_review' | 'verified';
  notes?: string;
  active!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  static get tableName() {
    return 'zb_hospitality_charges';
  }

  get timestamps() {
    return ['createdAt', 'updatedAt'];
  }

  static get modifiers() {
    return {
      active(query) {
        query.where('active', true);
      },
      effectiveOn(query, date: string) {
        query
          .where('effective_from', '<=', date)
          .where(function () {
            this.whereNull('effective_to').orWhere('effective_to', '>=', date);
          });
      },
    };
  }
}
