import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { events } from '@/common/events/events';
import { Expense } from '../models/Expense.model';
import { TenantModelProxy } from '@/modules/System/models/TenantBaseModel';
import {
  IExpenseCreatedPayload,
  IExpenseEventPublishedPayload,
} from '../Expenses.types';

/**
 * Z&B: keeps the Expense Inbox workflow status (zb_status) in sync with
 * BigCapital's native publish action. When an expense is published (posted to
 * the ledger), its zb_status becomes 'posted' so it leaves the inbox — even if
 * it was published through the standard expense screen rather than the Z&B
 * "submit/approve" flow. Without this, the inbox would keep showing expenses
 * that are already posted.
 */
@Injectable()
export class ZBExpenseStatusSubscriber {
  constructor(
    @Inject(Expense.name)
    private readonly expenseModel: TenantModelProxy<typeof Expense>,
  ) {}

  /** Mark posted when an expense is published. */
  @OnEvent(events.expenses.onPublished)
  public async onPublished({
    expenseId,
    expense,
    trx,
  }: IExpenseEventPublishedPayload) {
    if (!expense.publishedAt) return;
    await this.expenseModel()
      .query(trx)
      .findById(expenseId)
      .patch({ zbStatus: 'posted' } as any);
  }

  /** Mark posted when an expense is created already-published. */
  @OnEvent(events.expenses.onCreated)
  public async onCreated({ expense, trx }: IExpenseCreatedPayload) {
    if (!expense.publishedAt) return;
    await this.expenseModel()
      .query(trx)
      .findById(expense.id)
      .patch({ zbStatus: 'posted' } as any);
  }
}
