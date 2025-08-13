import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateServiceDto } from './create-service.dto';

export class CreateManyServicesDto {
  @ApiProperty({
    type: [CreateServiceDto],
    description: 'Array of services to create',
    example: [
      {
        serviceType: 'TRANSLATION',
        quantity: 2,
        unitPrice: 50.00
      },
      {
        serviceType: 'DOSSIER_TREATMENT',
        quantity: 1,
        unitPrice: 120.00
      }
    ]
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one service item is required' })
  @ValidateNested({ each: true })
  @Type(() => CreateServiceDto)
  items: CreateServiceDto[];
}
