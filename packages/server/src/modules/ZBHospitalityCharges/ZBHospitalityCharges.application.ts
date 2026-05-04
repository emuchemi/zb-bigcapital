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

  /** Returns all hospitality charges. */
  public getAll(): Promise<ZBHospitalityCharge[]> {
    return this.chargeModel().query().orderBy('name', 'asc');
  }

  /** Returns only active charges effective on a given date. */
  public getActiveOnDate(date: string): Promise<ZBHospitalityCharge[]> {
    return this.chargeModel()
      .query()
      .modify('active')
      .modify('effectiveOn', date)
      .orderBy('name', 'asc');
  }

  /** Returns a single charge by id. */
  public getOne(id: number): Promise<ZBHospitalityCharge> {
    return this.chargeModel().query().findById(id).throwIfNotFound();
  }

  /** Creates a new hospitality charge rule. */
  public create(
    dto: CreateZBHospitalityChargeDto,
    trx?: Knex.Transaction,
  ): Promise<ZBHospitalityCharge> {
    return this.uow.withTransaction(async (trx: Knex.Transaction) => {
      return this.chargeModel().query(trx).insertAndFetch({ ...dto });
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
      return this.chargeModel().query(trx).patchAndFetchById(id, { ...dto });
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
