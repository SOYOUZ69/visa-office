import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { TransactionType, ExpenseCategory, TransactionStatus } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'ID of the caisse',
    example: 'clx123456789'
  })
  @IsString()
  caisseId: string;

  @ApiProperty({
    enum: TransactionType,
    description: 'Type of transaction',
    example: 'INCOME'
  })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({
    enum: ExpenseCategory,
    description: 'Category for expenses',
    required: false,
    example: 'OFFICE_RENT'
  })
  @IsOptional()
  @IsEnum(ExpenseCategory)
  category?: ExpenseCategory;

  @ApiProperty({
    description: 'Transaction amount',
    minimum: 0,
    example: 150.00
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Transaction description',
    example: 'Payment for visa application services'
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Reference (payment ID, client name, etc.)',
    required: false,
    example: 'Payment for John Doe'
  })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({
    enum: TransactionStatus,
    description: 'Transaction status',
    default: 'PENDING'
  })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiProperty({
    description: 'Transaction date',
    required: false
  })
  @IsOptional()
  @IsDateString()
  transactionDate?: string;

  @ApiProperty({
    description: 'Related payment ID',
    required: false
  })
  @IsOptional()
  @IsString()
  paymentId?: string;
}
