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

  // ── Read methods ────────────────────────────────────────────────────────────
  // QueryBuilder implements PromiseLike, not the full Promise interface, so
  // returning one from a Promise<T>-annotated method fails TS2739.
  // Making each method async and awaiting the builder resolves PromiseLike → T,
  // allowing TypeScript to wrap it in a real Promise<T>.

  /** All compliance items, ordered by due date. */
  public async getAll(): Promise<ZBComplianceItem[]> {
    return await this.itemModel().query().orderBy('due_date', 'asc');
  }

  /** All upcoming items. */
  public async getUpcoming(): Promise<ZBComplianceItem[]> {
    return await this.itemModel().query().modify('upcoming');
  }

  /** Items due within the next N days (default 30). Useful for the dashboard. */
  public async getDueWithinDays(days = 30): Promise<ZBComplianceItem[]> {
    return await this.itemModel().query().modify('dueWithinDays', days);
  }

  /** All overdue items (upcoming status but past due date). */
  public async getOverdue(): Promise<ZBComplianceItem[]> {
    return await this.itemModel().query().modify('overdue');
  }

  /** Single item. */
  public async getOne(id: number): Promise<ZBComplianceItem> {
    return await this.itemModel().query().findById(id).throwIfNotFound();
  }

  // ── Write methods ───────────────────────────────────────────────────────────
  // Two fixes applied inside withTransaction callbacks:
  //
  // 1. `{ ...dto } as any` — DTO date fields are string (@IsDateString) but the
  //    model declares them Date, so PartialModelObject<T> expects Expression<Date>.
  //    MariaDB stores and returns date columns as strings at runtime, so the cast
  //    is safe.
  //
  // 2. `await` before each query builder — resolves PromiseLike to a concrete T
  //    so TypeScript doesn't chase the deep QueryBuilder generic chain (TS2589).

  /** Creates a new compliance item. */
  public create(
    dto: CreateZBComplianceItemDto,
    trx?: Knex.Transaction,
  ): Promise<ZBComplianceItem> {
    return this.uow.withTransaction(async (trx: Knex.Transaction) => {
      return await this.itemModel().query(trx).insertAndFetch({ ...dto } as any);
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
      return await this.itemModel().query(trx).patchAndFetchById(id, { ...dto } as any);
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
      return await this.itemModel().query(trx).patchAndFetchById(id, {
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
