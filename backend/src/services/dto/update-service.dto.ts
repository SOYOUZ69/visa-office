import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsInt, IsPositive, IsNumber, Min } from 'class-validator';
import { ServiceType } from '@prisma/client';

export class UpdateServiceDto {
  @ApiProperty({
    enum: ServiceType,
    description: 'Type of service',
    example: 'TRANSLATION',
    required: false
  })
  @IsOptional()
  @IsEnum(ServiceType)
  serviceType?: ServiceType;

  @ApiProperty({
    description: 'Quantity of the service',
    minimum: 1,
    example: 3,
    required: false
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  quantity?: number;

  @ApiProperty({
    description: 'Unit price of the service',
    minimum: 0,
    example: 18.00,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;
}
