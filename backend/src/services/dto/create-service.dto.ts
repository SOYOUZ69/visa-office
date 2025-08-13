import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsPositive, IsNumber, Min } from 'class-validator';
import { ServiceType } from '@prisma/client';

export class CreateServiceDto {
  @ApiProperty({
    enum: ServiceType,
    description: 'Type of service',
    example: 'TRANSLATION'
  })
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @ApiProperty({
    description: 'Quantity of the service',
    minimum: 1,
    example: 2
  })
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiProperty({
    description: 'Unit price of the service',
    minimum: 0,
    example: 50.00
  })
  @IsNumber()
  @Min(0)
  unitPrice: number;
}
