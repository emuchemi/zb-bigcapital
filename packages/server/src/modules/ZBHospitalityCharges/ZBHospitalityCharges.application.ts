import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { ZBHospitalityCharge } from './models/ZBHospitalityCharge.model';
import { TenantModelProxy } from '@/modules/System/models/TenantBaseModel';
import {
  CreateZBHospitalityChargeDto,
  EditZBHospitalityChargeDto,
} from './dtos/ZBHospitalityCharge.dto';
import { UnitOfWork } from '@/modules/Tenancy/TenancyDB/UnitOfWork.service';

@Injectable()
export class ZBHospitalityChargesApplication {
  constructor(
    private readonly uow: UnitOfWork,

    @Inject(ZBHospitalityCharge.name)
    private readonly chargeModel: TenantModelProxy<typeof ZBHospitalityCharge>,
  ) {}

  // ── Read methods ────────────────────────────────────────────────────────────
  // QueryBuilder implements PromiseLike, not the full Promise interface, so
  // returning one from a Promise<T>-annotated method fails TS2739.
  // Making each method async and awaiting the builder resolves PromiseLike → T,
  // allowing TypeScript to wrap it in a real Promise<T>.

  /** Returns all hospitality charges. */
  public async getAll(): Promise<ZBHospitalityCharge[]> {
    return await this.chargeModel().query().orderBy('name', 'asc');
  }

  /** Returns only active charges effective on a given date. */
  public async getActiveOnDate(date: string): Promise<ZBHospitalityCharge[]> {
    return await this.chargeModel()
      .query()
      .modify('active')
      .modify('effectiveOn', date)
      .orderBy('name', 'asc');
  }

  /** Returns a single charge by id. */
  public async getOne(id: number): Promise<ZBHospitalityCharge> {
    return await this.chargeModel().query().findById(id).throwIfNotFound();
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

  /** Creates a new hospitality charge rule. */
  public create(
    dto: CreateZBHospitalityChargeDto,
    trx?: Knex.Transaction,
  ): Promise<ZBHospitalityCharge> {
    return this.uow.withTransaction(async (trx: Knex.Transaction) => {
      return await this.chargeModel().query(trx).insertAndFetch({ ...dto } as any);
    }, trx);
  }

  /** Edits an existing hospitality charge rule. */
  public edit(
    id: number,
    dto: EditZBHospitalityChargeDto,
    trx?: Knex.Transaction,
  ): Promise<ZBHospitalityCharge> {
    return this.uow.withTransaction(async (trx: Knex.Transaction) => {
      await this.chargeModel().query().findById(id).throwIfNotFound();
      return await this.chargeModel().query(trx).patchAndFetchById(id, { ...dto } as any);
    }, trx);
  }

  /** Deletes a hospitality charge rule. */
  public delete(id: number, trx?: Knex.Transaction): Promise<void> {
    return this.uow.withTransaction(async (trx: Knex.Transaction) => {
      await this.chargeModel().query().findById(id).throwIfNotFound();
      await this.chargeModel().query(trx).deleteById(id);
    }, trx);
  }
}
