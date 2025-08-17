import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber, Min, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentOption, PaymentModality } from '@prisma/client';
import { CreatePaymentInstallmentDto } from './create-payment-installment.dto';

export class UpdatePaymentDto {
  @ApiProperty({
    description: 'Total amount for all services',
    minimum: 0,
    example: 400.00,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @ApiProperty({
    enum: PaymentOption,
    description: 'Payment option chosen by client',
    example: 'BANK_TRANSFER',
    required: false
  })
  @IsOptional()
  @IsEnum(PaymentOption)
  paymentOption?: PaymentOption;

  @ApiProperty({
    enum: PaymentModality,
    description: 'Payment modality (full, 60-40, or milestone)',
    example: 'SIXTY_FORTY',
    required: false
  })
  @IsOptional()
  @IsEnum(PaymentModality)
  paymentModality?: PaymentModality;

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
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePaymentInstallmentDto)
  installments?: CreatePaymentInstallmentDto[];
}

