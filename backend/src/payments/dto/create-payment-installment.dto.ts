import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, Max, IsDateString } from 'class-validator';

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
}

