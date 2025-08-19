import { IsString, IsEmail, IsOptional, IsEnum, IsArray, ValidateNested, IsNotEmpty, IsBoolean, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ClientType } from '@prisma/client';
import { CreateFamilyMemberDto } from './create-family-member.dto';

export class PhoneNumberDto {
  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  number: string;
}

export class EmployerDto {
  @ApiProperty({ example: 'Tech Corp' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Software Engineer', required: false })
  @IsString()
  @IsOptional()
  position?: string;
}

export class CreateClientDto {
  @ApiProperty({ enum: ClientType, example: ClientType.INDIVIDUAL })
  @IsEnum(ClientType)
  clientType: ClientType;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '123 Main St, City, Country' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Software Engineer', required: false })
  @IsString()
  @IsOptional()
  jobTitle?: string;

  @ApiProperty({ example: 'AB1234567', required: false })
  @IsString()
  @IsOptional()
  passportNumber?: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'United States' })
  @IsString()
  @IsNotEmpty()
  destination: string;

  @ApiProperty({ example: 'Tourist' })
  @IsString()
  @IsNotEmpty()
  visaType: string;

  @ApiProperty({ example: 'Additional notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: false, required: false, description: 'Indicates if the client is a minor' })
  @IsBoolean()
  @IsOptional()
  isMinor?: boolean;

  @ApiProperty({ example: 'Jane Doe', required: false, description: 'Guardian full name (required if clientType=INDIVIDUAL and isMinor=true)' })
  @ValidateIf(o => o.clientType === ClientType.INDIVIDUAL && o.isMinor === true)
  @IsString()
  @IsNotEmpty()
  guardianFullName?: string;

  @ApiProperty({ example: 'AB123456', required: false, description: 'Guardian CIN (required if clientType=INDIVIDUAL and isMinor=true)' })
  @ValidateIf(o => o.clientType === ClientType.INDIVIDUAL && o.isMinor === true)
  @IsString()
  @IsNotEmpty()
  guardianCIN?: string;

  @ApiProperty({ example: 'Mother', required: false, description: 'Guardian relationship (required if clientType=INDIVIDUAL and isMinor=true)' })
  @ValidateIf(o => o.clientType === ClientType.INDIVIDUAL && o.isMinor === true)
  @IsString()
  @IsNotEmpty()
  guardianRelationship?: string;

  @ApiProperty({ type: [PhoneNumberDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhoneNumberDto)
  @IsOptional()
  phoneNumbers?: PhoneNumberDto[];

  @ApiProperty({ type: [EmployerDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmployerDto)
  @IsOptional()
  employers?: EmployerDto[];

  @ApiProperty({ 
    type: [CreateFamilyMemberDto], 
    required: false,
    description: 'Family members (required for FAMILY and GROUP client types)' 
  })
  @ValidateIf(o => o.clientType === ClientType.FAMILY || o.clientType === ClientType.GROUP)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFamilyMemberDto)
  familyMembers?: CreateFamilyMemberDto[];
}
