import { ApiProperty } from '@nestjs/swagger';
import { ToNumber } from '@/common/decorators/Validators';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export enum ComplianceItemType {
  TaxReturn = 'tax_return',
  LevyRemittance = 'levy_remittance',
  PayrollRemittance = 'payroll_remittance',
  LicenceRenewal = 'licence_renewal',
  PermitRenewal = 'permit_renewal',
  Other = 'other',
}

export enum ComplianceStatus {
  Upcoming = 'upcoming',
  Overdue = 'overdue',
  Completed = 'completed',
  Waived = 'waived',
}

export enum ComplianceRecurrence {
  Once = 'once',
  Monthly = 'monthly',
  Quarterly = 'quarterly',
  Annually = 'annually',
}

export class CommandZBComplianceItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({ example: 'PAYE Remittance — May 2026' })
  name: string;

  @IsEnum(ComplianceItemType)
  @IsNotEmpty()
  @ApiProperty({ enum: ComplianceItemType, example: ComplianceItemType.PayrollRemittance })
  itemType: ComplianceItemType;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ example: '2026-06-07', description: 'Filing or payment due date.' })
  dueDate: string;

  @ToNumber()
  @IsNumber()
  @IsOptional()
  @ApiProperty({ example: 150000, description: 'Amount due in the given currency.', required: false })
  amountDue?: number;

  @IsString()
  @IsOptional()
  @MaxLength(3)
  @ApiProperty({ example: 'TZS', required: false })
  currency?: string;

  @IsEnum(ComplianceStatus)
  @IsOptional()
  @ApiProperty({ enum: ComplianceStatus, example: ComplianceStatus.Upcoming, required: false })
  status?: ComplianceStatus;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  @ApiProperty({ required: false, example: 'Accountant Name' })
  responsiblePerson?: string;

  @ToNumber()
  @IsInt()
  @IsOptional()
  @ApiProperty({ required: false, description: 'Linked GL liability account ID.' })
  linkedAccountId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  @ApiProperty({ required: false })
  notes?: string;

  @IsDateString()
  @IsOptional()
  @ApiProperty({ required: false, description: 'Date filed/paid. Set when marking complete.' })
  completedAt?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  @ApiProperty({ required: false, example: 'ZRB/2026/05/0042' })
  referenceNumber?: string;

  @IsEnum(ComplianceRecurrence)
  @IsOptional()
  @ApiProperty({ enum: ComplianceRecurrence, example: ComplianceRecurrence.Monthly, required: false })
  recurrence?: ComplianceRecurrence;
}

export class CreateZBComplianceItemDto extends CommandZBComplianceItemDto {}
export class EditZBComplianceItemDto extends CommandZBComplianceItemDto {}

export class CompleteZBComplianceItemDto {
  @IsDateString()
  @IsOptional()
  @ApiProperty({ required: false, description: 'Date of completion. Defaults to today.' })
  completedAt?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  @ApiProperty({ required: false })
  referenceNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  @ApiProperty({ required: false })
  notes?: string;
}
