import { IsString, IsEmail, IsOptional, IsEnum, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ClientType } from '@prisma/client';

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
}
