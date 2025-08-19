import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateFamilyMemberDto {
  @ApiProperty({
    description: 'Full name of the family member',
    example: 'John Doe'
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'Passport number of the family member',
    example: 'AB1234567'
  })
  @IsString()
  @IsNotEmpty()
  passportNumber: string;

  @ApiProperty({
    description: 'Relationship to the main client',
    example: 'Spouse',
    required: false
  })
  @IsOptional()
  @IsString()
  relationship?: string;

  @ApiProperty({
    description: 'Age of the family member',
    minimum: 0,
    example: 35,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  age?: number;
}