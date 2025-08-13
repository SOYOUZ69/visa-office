import { ApiProperty } from '@nestjs/swagger';
import { ServiceType } from '@prisma/client';

export class ServiceResponseDto {
  @ApiProperty({
    description: 'Service ID',
    example: 'cuid123456789'
  })
  id: string;

  @ApiProperty({
    description: 'Client ID',
    example: 'cuid123456789'
  })
  clientId: string;

  @ApiProperty({
    enum: ServiceType,
    description: 'Type of service',
    example: 'TRANSLATION'
  })
  serviceType: ServiceType;

  @ApiProperty({
    description: 'Quantity of the service',
    example: 2
  })
  quantity: number;

  @ApiProperty({
    description: 'Unit price of the service',
    example: '50.00'
  })
  unitPrice: string;

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
