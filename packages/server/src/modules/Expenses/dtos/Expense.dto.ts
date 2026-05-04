import { ToNumber } from '@/common/decorators/Validators';
import { parseBoolean } from '@/utils/parse-boolean';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsISO4217CurrencyCode,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

// ── Z&B enums ────────────────────────────────────────────────────────────────

export enum ZBExpenseStatus {
  Draft = 'draft',
  PendingReview = 'pending_review',
  Posted = 'posted',
}

export enum ZBProjectSite {
  HotelOperations = 'hotel_operations',
  ConstructionRenovation = 'construction_renovation',
  GuestService = 'guest_service',
  Staff = 'staff',
  Maintenance = 'maintenance',
  Utilities = 'utilities',
  PermitsLicences = 'permits_licences',
  ProfessionalServices = 'professional_services',
  Marketing = 'marketing',
  Technology = 'technology',
  Transport = 'transport',
  FoodBeverage = 'food_beverage',
  Other = 'other',
}

export enum ZBPaymentMethod {
  Cash = 'cash',
  MobileMoney = 'mobile_money',
  BankTransfer = 'bank_transfer',
  Stripe = 'stripe',
  Card = 'card',
  OtaPayout = 'ota_payout',
  Other = 'other',
}

class AttachmentDto {
  @IsString()
  key: string;
}

export class ExpenseCategoryDto {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ example: 1, description: 'The index of the expense category' })
  index: number;

  @IsNotEmpty()
  @ToNumber()
  @IsInt()
  @ApiProperty({
    example: 1,
    description: 'The expense account id of the expense category',
  })
  expenseAccountId: number;

  @ToNumber()
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    example: 100,
    description: 'The amount of the expense category',
  })
  amount?: number;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  @ApiProperty({
    example: 'This is a description',
    description: 'The description of the expense category',
  })
  description?: string;

  @IsBoolean()
  @Transform(({ value }) => parseBoolean(value, false))
  @IsOptional()
  @ApiProperty({
    example: true,
    description: 'The landed cost of the expense category',
  })
  landedCost?: boolean;

  @ToNumber()
  @IsInt()
  @IsOptional()
  @ApiProperty({
    example: 1,
    description: 'The project id of the expense category',
  })
  projectId?: number;
}

export class CommandExpenseDto {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  @ApiProperty({
    description: 'The reference number of the expense',
    example: 'INV-123456',
  })
  referenceNo?: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The payment date of the expense',
    example: '2021-01-01',
  })
  paymentDate: Date;

  @IsNotEmpty()
  @ToNumber()
  @IsInt()
  @ApiProperty({
    description: 'The payment account id of the expense',
    example: 1,
  })
  paymentAccountId: number;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  @ApiProperty({
    description: 'The description of the expense',
    example: 'This is a description',
  })
  description?: string;

  @ToNumber()
  @IsNumber()
  @IsOptional()
  @ApiProperty({ description: 'The exchange rate of the expense', example: 1 })
  exchangeRate?: number;

  @IsString()
  @MaxLength(3)
  @IsOptional()
  @IsISO4217CurrencyCode()
  @ApiProperty({
    description: 'The currency code of the expense',
    example: 'USD',
  })
  currencyCode?: string;

  @IsBoolean()
  @Transform(({ value }) => parseBoolean(value, false))
  @IsOptional()
  @ApiProperty({
    description: 'The publish status of the expense',
    example: true,
  })
  publish?: boolean;

  @IsOptional()
  @ToNumber()
  @IsInt()
  @ApiProperty({
    description: 'The payee id of the expense',
    example: 1,
  })
  payeeId?: number;

  @ToNumber()
  @IsInt()
  @IsOptional()
  @ApiProperty({
    description: 'The branch id of the expense',
    example: 1,
  })
  branchId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpenseCategoryDto)
  @ApiProperty({
    description: 'The categories of the expense',
    example: [
      {
        index: 1,
        expenseAccountId: 1,
        amount: 100,
        description: 'This is a description',
        landedCost: true,
        projectId: 1,
      },
    ],
  })
  categories: ExpenseCategoryDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  @IsOptional()
  @ApiProperty({
    description: 'The attachments of the expense',
    example: [{ key: '123456' }],
  })
  attachments?: AttachmentDto[];

  // ── Z&B fields ─────────────────────────────────────────────────────────────

  @IsEnum(ZBExpenseStatus)
  @IsOptional()
  @ApiProperty({
    description: 'Z&B workflow status. Defaults to draft on creation.',
    enum: ZBExpenseStatus,
    example: ZBExpenseStatus.Draft,
  })
  zbStatus?: ZBExpenseStatus;

  @IsEnum(ZBProjectSite)
  @IsOptional()
  @ApiProperty({
    description: 'Project or cost centre this expense belongs to.',
    enum: ZBProjectSite,
    example: ZBProjectSite.HotelOperations,
  })
  projectSite?: ZBProjectSite;

  @IsEnum(ZBPaymentMethod)
  @IsOptional()
  @ApiProperty({
    description: 'Payment method used for this expense.',
    enum: ZBPaymentMethod,
    example: ZBPaymentMethod.Cash,
  })
  paymentMethod?: ZBPaymentMethod;

  @IsBoolean()
  @Transform(({ value }) => parseBoolean(value, false))
  @IsOptional()
  @ApiProperty({
    description: 'True if this expense came from the petty cash float.',
    example: false,
  })
  isPettyCash?: boolean;

  @IsBoolean()
  @Transform(({ value }) => parseBoolean(value, false))
  @IsOptional()
  @ApiProperty({
    description: 'True if this should be capitalised as a fixed asset (capex).',
    example: false,
  })
  isCapex?: boolean;

  @IsBoolean()
  @Transform(({ value }) => parseBoolean(value, false))
  @IsOptional()
  @ApiProperty({
    description: 'True if this expense is reimbursable by a guest or third party.',
    example: false,
  })
  isReimbursable?: boolean;

  @ToNumber()
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: 'Gross amount before payment processing fees.',
    example: 100.0,
  })
  grossAmount?: number;

  @ToNumber()
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: 'Fee charged by bank, Stripe, mobile money, or OTA.',
    example: 2.9,
  })
  feeAmount?: number;

  @ToNumber()
  @IsInt()
  @IsOptional()
  @ApiProperty({
    description: 'Account ID to debit fees to (e.g. Stripe Fees account).',
    example: 1,
  })
  feeAccountId?: number;

  @ToNumber()
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: 'Net amount after fees (grossAmount - feeAmount).',
    example: 97.1,
  })
  netAmount?: number;

  @IsString()
  @MaxLength(2000)
  @IsOptional()
  @ApiProperty({
    description: 'Extended notes for the accountant or reviewer.',
    example: 'Paid in cash to Mohamed for daily cleaning supplies.',
  })
  zbNotes?: string;
}

export class CreateExpenseDto extends CommandExpenseDto {}
export class EditExpenseDto extends CommandExpenseDto {}

export class SubmitExpenseDto {
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  @ApiProperty({
    description: 'Optional note to the accountant when submitting for review.',
    example: 'Please verify the category for this purchase.',
  })
  note?: string;
}
