import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, Max, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { PaymentOption, InstallmentStatus } from '@prisma/client';

export class CreatePaymentInstallmentDto {
  @ApiProperty({
    description: 'Description of the payment installment',
    example: 'First payment - 60%'
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Percentage of total amount for this installment',
    minimum: 0,
    maximum: 100,
    example: 60.00
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;

  @ApiProperty({
    description: 'Amount for this installment (calculated from percentage)',
    minimum: 0,
    example: 240.00
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Due date for this installment',
    example: '2024-12-31'
  })
  @IsDateString()
  dueDate: string;

  @ApiProperty({
    description: 'Payment option for this installment (for non-FULL_PAYMENT modalities)',
    enum: PaymentOption,
    example: PaymentOption.CASH,
    required: false
  })
  @IsOptional()
  @IsEnum(PaymentOption)
  paymentOption?: PaymentOption;

  @ApiProperty({
    description: 'Transfer code for this installment (required if paymentOption is BANK_TRANSFER and due today)',
    example: 'TRF123456',
    required: false
  })
  @IsOptional()
  @IsString()
  transferCode?: string;

  @ApiProperty({
    description: 'Payment status for this installment',
    enum: InstallmentStatus,
    example: InstallmentStatus.PENDING,
    required: false
  })
  @IsOptional()
  @IsEnum(InstallmentStatus)
  status?: InstallmentStatus;
}

