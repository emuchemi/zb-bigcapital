import { Module } from '@nestjs/common';
import { ZBDashboardController } from './ZBDashboard.controller';
import { ZBDashboardService } from './ZBDashboard.service';
import { ZBComplianceModule } from '@/modules/ZBCompliance/ZBCompliance.module';

@Module({
  imports: [
    // Import ZBComplianceModule so ZBComplianceApplication is available for injection
    ZBComplianceModule,
  ],
  controllers: [ZBDashboardController],
  providers: [ZBDashboardService],
  exports: [ZBDashboardService],
})
export class ZBDashboardModule {}
