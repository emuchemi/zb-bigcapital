import { Inject, Injectable } from '@nestjs/common';
import { Expense } from '../models/Expense.model';
import { TenantModelProxy } from '@/modules/System/models/TenantBaseModel';
import { ServiceError } from '@/modules/Items/ServiceError';

const ERRORS = {
  EXPENSE_ALREADY_POSTED: 'EXPENSE_ALREADY_POSTED',
};

/**
 * Moves an expense from 'draft' status to 'pending_review'.
 * This signals to the accountant that the expense is ready for review.
 * Only draft expenses can be submitted; posted expenses are locked.
 */
@Injectable()
export class SubmitExpenseForReviewService {
  constructor(
    @Inject(Expense.name)
    private readonly expenseModel: TenantModelProxy<typeof Expense>,
  ) {}

  public async submitForReview(expenseId: number): Promise<void> {
    const expense = await this.expenseModel()
      .query()
      .findById(expenseId)
      .throwIfNotFound();

    if (expense.zbStatus === 'posted') {
      throw new ServiceError(ERRORS.EXPENSE_ALREADY_POSTED);
    }

    await this.expenseModel()
      .query()
      .patchAndFetchById(expenseId, { zbStatus: 'pending_review' } as any);
  }

  /**
   * Moves an expense back from pending_review to draft.
   * Used when the accountant returns an expense with corrections needed.
   */
  public async returnToDraft(expenseId: number): Promise<void> {
    const expense = await this.expenseModel()
      .query()
      .findById(expenseId)
      .throwIfNotFound();

    if (expense.zbStatus === 'posted') {
      throw new ServiceError(ERRORS.EXPENSE_ALREADY_POSTED);
    }

    await this.expenseModel()
      .query()
      .patchAndFetchById(expenseId, { zbStatus: 'draft' } as any);
  }
}
