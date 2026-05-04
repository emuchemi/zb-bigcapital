import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { ZBComplianceItem } from './models/ZBComplianceItem.model';
import { TenantModelProxy } from '@/modules/System/models/TenantBaseModel';
import {
  CompleteZBComplianceItemDto,
  ComplianceStatus,
  CreateZBComplianceItemDto,
  EditZBComplianceItemDto,
} from './dtos/ZBComplianceItem.dto';
import { UnitOfWork } from '@/modules/Tenancy/TenancyDB/UnitOfWork.service';

@Injectable()
export class ZBComplianceApplication {
  constructor(
    private readonly uow: UnitOfWork,

    @Inject(ZBComplianceItem.name)
    private readonly itemModel: TenantModelProxy<typeof ZBComplianceItem>,
  ) {}

  /** All compliance items, ordered by due date. */
  public getAll(): Promise<ZBComplianceItem[]> {
    return this.itemModel().query().orderBy('due_date', 'asc');
  }

  /** All upcoming items. */
  public getUpcoming(): Promise<ZBComplianceItem[]> {
    return this.itemModel().query().modify('upcoming');
  }

  /** Items due within the next N days (default 30). Useful for the dashboard. */
  public getDueWithinDays(days = 30): Promise<ZBComplianceItem[]> {
    return this.itemModel().query().modify('dueWithinDays', days);
  }

  /** All overdue items (upcoming status but past due date). */
  public getOverdue(): Promise<ZBComplianceItem[]> {
    return this.itemModel().query().modify('overdue');
  }

  /** Single item. */
  public getOne(id: number): Promise<ZBComplianceItem> {
    return this.itemModel().query().findById(id).throwIfNotFound();
  }

  /** Creates a new compliance item. */
  public create(
    dto: CreateZBComplianceItemDto,
    trx?: Knex.Transaction,
  ): Promise<ZBComplianceItem> {
    return this.uow.withTransaction(async (trx: Knex.Transaction) => {
      return this.itemModel().query(trx).insertAndFetch({ ...dto });
    }, trx);
  }

  /** Edits a compliance item. */
  public edit(
    id: number,
    dto: EditZBComplianceItemDto,
    trx?: Knex.Transaction,
  ): Promise<ZBComplianceItem> {
    return this.uow.withTransaction(async (trx: Knex.Transaction) => {
      await this.itemModel().query().findById(id).throwIfNotFound();
      return this.itemModel().query(trx).patchAndFetchById(id, { ...dto });
    }, trx);
  }

  /** Marks a compliance item as completed. */
  public complete(
    id: number,
    dto: CompleteZBComplianceItemDto,
    trx?: Knex.Transaction,
  ): Promise<ZBComplianceItem> {
    const completedAt = dto.completedAt ?? new Date().toISOString().split('T')[0];
    return this.uow.withTransaction(async (trx: Knex.Transaction) => {
      await this.itemModel().query().findById(id).throwIfNotFound();
      return this.itemModel().query(trx).patchAndFetchById(id, {
        status: ComplianceStatus.Completed,
        completedAt,
        referenceNumber: dto.referenceNumber,
        notes: dto.notes,
      } as any);
    }, trx);
  }

  /** Deletes a compliance item. */
  public delete(id: number, trx?: Knex.Transaction): Promise<void> {
    return this.uow.withTransaction(async (trx: Knex.Transaction) => {
      await this.itemModel().query().findById(id).throwIfNotFound();
      await this.itemModel().query(trx).deleteById(id);
    }, trx);
  }
}
