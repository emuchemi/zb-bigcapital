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
import { ZBComplianceApplication } from './ZBCompliance.application';
import {
  CompleteZBComplianceItemDto,
  CreateZBComplianceItemDto,
  EditZBComplianceItemDto,
} from './dtos/ZBComplianceItem.dto';

@Controller('zb/compliance')
@ApiTags('Z&B Compliance Calendar')
@ApiCommonHeaders()
@UseGuards(AuthorizationGuard)
export class ZBComplianceController {
  constructor(private readonly application: ZBComplianceApplication) {}

  @Get()
  @ApiOperation({ summary: 'Get all compliance items, ordered by due date.' })
  public getAll() {
    return this.application.getAll();
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get all upcoming compliance items.' })
  public getUpcoming() {
    return this.application.getUpcoming();
  }

  @Get('due-soon')
  @ApiOperation({ summary: 'Get compliance items due within the next N days.' })
  public getDueSoon(@Query('days') days?: string) {
    // NestJS query params arrive as strings; convert and default to 30
    return this.application.getDueWithinDays(days ? parseInt(days, 10) : 30);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get all overdue compliance items.' })
  public getOverdue() {
    return this.application.getOverdue();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single compliance item.' })
  public getOne(@Param('id') id: number) {
    return this.application.getOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new compliance item.' })
  public create(@Body() dto: CreateZBComplianceItemDto) {
    return this.application.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Edit a compliance item.' })
  public edit(@Param('id') id: number, @Body() dto: EditZBComplianceItemDto) {
    return this.application.edit(id, dto);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark a compliance item as completed.' })
  public complete(
    @Param('id') id: number,
    @Body() dto: CompleteZBComplianceItemDto,
  ) {
    return this.application.complete(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a compliance item.' })
  public delete(@Param('id') id: number) {
    return this.application.delete(id);
  }
}
