import { Module } from '@nestjs/common';
import { ZBComplianceController } from './ZBCompliance.controller';
import { ZBComplianceApplication } from './ZBCompliance.application';
import { RegisterTenancyModel } from '@/modules/Tenancy/TenancyModels/Tenancy.module';
import { ZBComplianceItem } from './models/ZBComplianceItem.model';

const models = [RegisterTenancyModel(ZBComplianceItem)];

@Module({
  imports: [...models],
  controllers: [ZBComplianceController],
  providers: [ZBComplianceApplication],
  exports: [ZBComplianceApplication, ...models],
})
export class ZBComplianceModule {}
