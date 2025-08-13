import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFamilyMemberDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'Spouse' })
  @IsString()
  relationship: string;

  @ApiPropertyOptional({ example: 30, minimum: 0, maximum: 120 })
  @IsNumber()
  @Min(0)
  @Max(120)
  @IsOptional()
  age?: number;
}
