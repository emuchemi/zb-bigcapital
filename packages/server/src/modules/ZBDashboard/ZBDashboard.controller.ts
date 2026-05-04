import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonHeaders } from '@/common/decorators/ApiCommonHeaders';
import { AuthorizationGuard } from '@/modules/Roles/Authorization.guard';
import { ZBDashboardService } from './ZBDashboard.service';

@Controller('zb/dashboard')
@ApiTags('Z&B Dashboard')
@ApiCommonHeaders()
@UseGuards(AuthorizationGuard)
export class ZBDashboardController {
  constructor(private readonly dashboardService: ZBDashboardService) {}

  /**
   * Returns the complete Z&B founder dashboard in a single response.
   *
   * Includes: cash position, petty cash, unpaid bills, accounts receivable,
   * expense inbox counts, recent expenses, monthly revenue by currency,
   * monthly burn, and upcoming compliance obligations.
   */
  @Get()
  @ApiOperation({
    summary: 'Z&B Founder Dashboard — all financial widgets in one call.',
  })
  public getDashboard() {
    return this.dashboardService.getDashboard();
  }
}
