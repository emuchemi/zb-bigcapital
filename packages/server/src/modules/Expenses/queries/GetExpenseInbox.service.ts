import { Inject, Injectable } from '@nestjs/common';
import { Expense } from '../models/Expense.model';
import { TenantModelProxy } from '@/modules/System/models/TenantBaseModel';

export interface ExpenseInboxItem {
  id: number;
  paymentDate: Date;
  zbStatus: string;
  projectSite?: string;
  paymentMethod?: string;
  currencyCode: string;
  totalAmount: number;
  grossAmount?: number;
  feeAmount?: number;
  netAmount?: number;
  isPettyCash: boolean;
  isCapex: boolean;
  isReimbursable: boolean;
  description?: string;
  zbNotes?: string;
  referenceNo?: string;
  createdAt: Date;
}

/**
 * Returns all expenses in the draft or pending_review state —
 * the "expense inbox" that the accountant reviews before posting.
 */
@Injectable()
export class GetExpenseInboxService {
  constructor(
    @Inject(Expense.name)
    private readonly expenseModel: TenantModelProxy<typeof Expense>,
  ) {}

  public async getExpenseInbox(): Promise<ExpenseInboxItem[]> {
    return this.expenseModel()
      .query()
      .whereIn('zb_status', ['draft', 'pending_review'])
      .orderBy('created_at', 'desc')
      .withGraphFetched('categories')
      .withGraphFetched('paymentAccount');
  }

  public async getExpenseInboxCount(): Promise<number> {
    const result = await this.expenseModel()
      .query()
      .whereIn('zb_status', ['draft', 'pending_review'])
      .count('id as count')
      .first();
    return Number((result as any)?.count ?? 0);
  }
}
