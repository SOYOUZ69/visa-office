import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { CaisseType } from '@prisma/client';

export class CreateCaisseDto {
  @ApiProperty({
    description: 'Name of the caisse',
    example: 'Caisse Principale'
  })
  @IsString()
  name: string;

  @ApiProperty({
    enum: CaisseType,
    description: 'Type of caisse',
    example: 'CASH'
  })
  @IsEnum(CaisseType)
  type: CaisseType;

  @ApiProperty({
    description: 'Description of the caisse',
    required: false,
    example: 'Main cash register for daily operations'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Whether the caisse is active',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
