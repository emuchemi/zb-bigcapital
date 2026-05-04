import { Module } from '@nestjs/common';
import { ZBHospitalityChargesController } from './ZBHospitalityCharges.controller';
import { ZBHospitalityChargesApplication } from './ZBHospitalityCharges.application';
import { RegisterTenancyModel } from '@/modules/Tenancy/TenancyModels/Tenancy.module';
import { ZBHospitalityCharge } from './models/ZBHospitalityCharge.model';

const models = [RegisterTenancyModel(ZBHospitalityCharge)];

@Module({
  imports: [...models],
  controllers: [ZBHospitalityChargesController],
  providers: [ZBHospitalityChargesApplication],
  exports: [ZBHospitalityChargesApplication, ...models],
})
export class ZBHospitalityChargesModule {}
