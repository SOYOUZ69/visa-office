import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayMinSize, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateServiceItemDto } from './create-service-item.dto';

export class CreateManyServicesDto {
  @ApiProperty({
    description: 'ID of the dossier these services belong to',
    example: 'clxxxxx'
  })
  @IsString()
  dossierId: string;
  @ApiProperty({
    type: [CreateServiceItemDto],
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
  @Type(() => CreateServiceItemDto)
  items: CreateServiceItemDto[];
}
