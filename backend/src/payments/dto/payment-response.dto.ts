import { ApiProperty } from '@nestjs/swagger';
import { PaymentOption, PaymentModality } from '@prisma/client';

export class PaymentInstallmentResponseDto {
  @ApiProperty({
    description: 'Installment ID',
    example: 'cuid123456789'
  })
  id: string;

  @ApiProperty({
    description: 'Description of the payment installment',
    example: 'First payment - 60%'
  })
  description: string;

  @ApiProperty({
    description: 'Percentage of total amount for this installment',
    example: 60.00
  })
  percentage: string;

  @ApiProperty({
    description: 'Amount for this installment',
    example: '240.00'
  })
  amount: string;

  @ApiProperty({
    description: 'Due date for this installment',
    example: '2024-12-31T00:00:00.000Z'
  })
  dueDate: Date;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z'
  })
  updatedAt: Date;
}

export class PaymentResponseDto {
  @ApiProperty({
    description: 'Payment ID',
    example: 'cuid123456789'
  })
  id: string;

  @ApiProperty({
    description: 'Client ID',
    example: 'cuid123456789'
  })
  clientId: string;

  @ApiProperty({
    description: 'Total amount for all services',
    example: '400.00'
  })
  totalAmount: string;

  @ApiProperty({
    enum: PaymentOption,
    description: 'Payment option chosen by client',
    example: 'BANK_TRANSFER'
  })
  paymentOption: PaymentOption;

  @ApiProperty({
    enum: PaymentModality,
    description: 'Payment modality (full, 60-40, or milestone)',
    example: 'SIXTY_FORTY'
  })
  paymentModality: PaymentModality;

  @ApiProperty({
    description: 'Transfer code (for bank transfers)',
    example: 'TRF123456789',
    required: false
  })
  transferCode?: string;

  @ApiProperty({
    type: [PaymentInstallmentResponseDto],
    description: 'Payment installments'
  })
  installments: PaymentInstallmentResponseDto[];

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z'
  })
  updatedAt: Date;
}

