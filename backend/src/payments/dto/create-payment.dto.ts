import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, Min, IsOptional, IsString, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentOption, PaymentModality } from '@prisma/client';
import { CreatePaymentInstallmentDto } from './create-payment-installment.dto';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'ID of the dossier this payment belongs to',
    example: 'clxxxxx'
  })
  @IsString()
  dossierId: string;
  @ApiProperty({
    description: 'Total amount for all services',
    minimum: 0,
    example: 400.00
  })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiProperty({
    enum: PaymentOption,
    description: 'Payment option chosen by client (required for FULL_PAYMENT, optional for others)',
    example: 'BANK_TRANSFER',
    required: false
  })
  @IsOptional()
  @IsEnum(PaymentOption)
  paymentOption?: PaymentOption;

  @ApiProperty({
    enum: PaymentModality,
    description: 'Payment modality (full, 60-40, or milestone)',
    example: 'SIXTY_FORTY'
  })
  @IsEnum(PaymentModality)
  paymentModality: PaymentModality;

  @ApiProperty({
    description: 'Transfer code (required for bank transfers on due date)',
    required: false,
    example: 'TRF123456789'
  })
  @IsOptional()
  @IsString()
  transferCode?: string;

  @ApiProperty({
    type: [CreatePaymentInstallmentDto],
    description: 'Payment installments',
    example: [
      {
        description: 'First payment - 60%',
        percentage: 60.00,
        amount: 240.00,
        dueDate: '2024-12-31'
      },
      {
        description: 'Second payment - 40%',
        percentage: 40.00,
        amount: 160.00,
        dueDate: '2025-01-31'
      }
    ]
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one installment is required' })
  @ValidateNested({ each: true })
  @Type(() => CreatePaymentInstallmentDto)
  installments: CreatePaymentInstallmentDto[];
}

