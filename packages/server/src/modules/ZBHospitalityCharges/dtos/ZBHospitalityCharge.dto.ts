import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ToNumber } from '@/common/decorators/Validators';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { parseBoolean } from '@/utils/parse-boolean';

export enum ChargeType {
  FixedPerGuestNight = 'fixed_per_guest_night',
  PercentageOfRevenue = 'percentage_of_revenue',
  FixedPerBooking = 'fixed_per_booking',
}

export enum GuestCategory {
  Foreign = 'foreign',
  Resident = 'resident',
  Citizen = 'citizen',
  All = 'all',
}

export enum RemittanceFrequency {
  Monthly = 'monthly',
  Quarterly = 'quarterly',
  Annually = 'annually',
  PerBooking = 'per_booking',
}

export enum AccountingTreatment {
  PassThrough = 'pass_through',
  Expense = 'expense',
  Revenue = 'revenue',
}

export enum ConfidenceStatus {
  PendingReview = 'pending_review',
  Verified = 'verified',
}

export class CommandZBHospitalityChargeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({ example: 'Infrastructure Tax', description: 'Display name of the charge.' })
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  @ApiProperty({ example: 'Zanzibar Revenue Board', required: false })
  authority?: string;

  @IsEnum(ChargeType)
  @IsNotEmpty()
  @ApiProperty({ enum: ChargeType, example: ChargeType.FixedPerGuestNight })
  chargeType: ChargeType;

  @ToNumber()
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 10,
    description: 'Amount (for fixed types) or percentage rate (for percentage types).',
  })
  rate: number;

  @IsString()
  @IsOptional()
  @MaxLength(3)
  @ApiProperty({ example: 'USD', description: 'Currency for fixed-amount charges.', required: false })
  currency?: string;

  @IsEnum(GuestCategory)
  @IsOptional()
  @ApiProperty({ enum: GuestCategory, example: GuestCategory.Foreign, required: false })
  guestCategory?: GuestCategory;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ example: '2024-08-01', description: 'Date this rate took effect.' })
  effectiveFrom: string;

  @IsDateString()
  @IsOptional()
  @ApiProperty({ example: null, description: 'Date this rate expires (null = no expiry).', required: false })
  effectiveTo?: string;

  @ToNumber()
  @IsInt()
  @IsOptional()
  @ApiProperty({ example: 1, description: 'Liability account ID to credit when levy is collected.', required: false })
  liabilityAccountId?: number;

  @IsEnum(RemittanceFrequency)
  @IsOptional()
  @ApiProperty({ enum: RemittanceFrequency, example: RemittanceFrequency.Monthly, required: false })
  remittanceFrequency?: RemittanceFrequency;

  @IsEnum(AccountingTreatment)
  @IsOptional()
  @ApiProperty({ enum: AccountingTreatment, example: AccountingTreatment.PassThrough, required: false })
  accountingTreatment?: AccountingTreatment;

  @IsEnum(ConfidenceStatus)
  @IsOptional()
  @ApiProperty({ enum: ConfidenceStatus, example: ConfidenceStatus.PendingReview, required: false })
  confidenceStatus?: ConfidenceStatus;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  @ApiProperty({ required: false, description: 'Accountant notes, caveats, or legal references.' })
  notes?: string;

  @IsBoolean()
  @Transform(({ value }) => parseBoolean(value, true))
  @IsOptional()
  @ApiProperty({ example: true, required: false })
  active?: boolean;
}

export class CreateZBHospitalityChargeDto extends CommandZBHospitalityChargeDto {}
export class EditZBHospitalityChargeDto extends CommandZBHospitalityChargeDto {}
