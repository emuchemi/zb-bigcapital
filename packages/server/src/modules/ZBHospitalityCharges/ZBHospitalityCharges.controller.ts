import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonHeaders } from '@/common/decorators/ApiCommonHeaders';
import { AuthorizationGuard } from '@/modules/Roles/Authorization.guard';
import { ZBHospitalityChargesApplication } from './ZBHospitalityCharges.application';
import {
  CreateZBHospitalityChargeDto,
  EditZBHospitalityChargeDto,
} from './dtos/ZBHospitalityCharge.dto';

@Controller('zb/hospitality-charges')
@ApiTags('Z&B Hospitality Charges')
@ApiCommonHeaders()
@UseGuards(AuthorizationGuard)
export class ZBHospitalityChargesController {
  constructor(
    private readonly application: ZBHospitalityChargesApplication,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all hospitality charge rules.' })
  public getAll() {
    return this.application.getAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get charges active on a given date (YYYY-MM-DD).' })
  public getActiveOnDate(@Query('date') date: string) {
    const effectiveDate = date ?? new Date().toISOString().split('T')[0];
    return this.application.getActiveOnDate(effectiveDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single hospitality charge rule.' })
  public getOne(@Param('id') id: number) {
    return this.application.getOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new hospitality charge rule.' })
  public create(@Body() dto: CreateZBHospitalityChargeDto) {
    return this.application.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Edit a hospitality charge rule.' })
  public edit(
    @Param('id') id: number,
    @Body() dto: EditZBHospitalityChargeDto,
  ) {
    return this.application.edit(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a hospitality charge rule.' })
  public delete(@Param('id') id: number) {
    return this.application.delete(id);
  }
}
