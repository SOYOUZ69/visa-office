import {
  IsString,
  IsEmail,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsBoolean,
  ValidateNested,
  ArrayMinSize,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ClientType, ServiceType, PaymentOption, PaymentModality } from '@prisma/client';

class PhoneNumberDto {
  @ApiProperty({ example: '+212612345678' })
  @IsString()
  @IsNotEmpty()
  number: string;
}

class EmployerDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Manager', required: false })
  @IsString()
  @IsOptional()
  position?: string;
}

class ServiceItemDto {
  @ApiProperty({ enum: ServiceType })
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 100.00 })
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

class PaymentInstallmentDto {
  @ApiProperty({ example: 'Premier versement' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 60 })
  @IsNumber()
  @Min(0)
  percentage: number;

  @ApiProperty({ example: 600.00 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: '2024-12-31' })
  @IsDateString()
  dueDate: string;
}

class PaymentConfigDto {
  @ApiProperty({ example: 1000.00 })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiProperty({ enum: PaymentOption })
  @IsEnum(PaymentOption)
  paymentOption: PaymentOption;

  @ApiProperty({ enum: PaymentModality })
  @IsEnum(PaymentModality)
  paymentModality: PaymentModality;

  @ApiProperty({ example: 'TRF123456', required: false })
  @IsString()
  @IsOptional()
  transferCode?: string;

  @ApiProperty({ type: [PaymentInstallmentDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PaymentInstallmentDto)
  installments: PaymentInstallmentDto[];
}

export class CreatePhoneCallClientDto {
  @ApiProperty({ enum: ['PHONE_CALL'], default: 'PHONE_CALL' })
  @IsEnum(ClientType)
  clientType: 'PHONE_CALL';

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '123 Main Street, City' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Software Engineer', required: false })
  @IsString()
  @IsOptional()
  jobTitle?: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'France' })
  @IsString()
  @IsNotEmpty()
  destination: string;

  @ApiProperty({ example: 'Tourist' })
  @IsString()
  @IsNotEmpty()
  visaType: string;

  @ApiProperty({ example: 'Urgent processing needed', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: false, required: false, description: 'Indicates if the client is a minor' })
  @IsBoolean()
  @IsOptional()
  isMinor?: boolean;

  @ApiProperty({ example: 'Jane Doe', required: false, description: 'Guardian full name (required if isMinor=true)' })
  @ValidateIf(o => o.isMinor === true)
  @IsString()
  @IsNotEmpty()
  guardianFullName?: string;

  @ApiProperty({ example: 'AB123456', required: false, description: 'Guardian CIN (required if isMinor=true)' })
  @ValidateIf(o => o.isMinor === true)
  @IsString()
  @IsNotEmpty()
  guardianCIN?: string;

  @ApiProperty({ example: 'Mother', required: false, description: 'Guardian relationship (required if isMinor=true)' })
  @ValidateIf(o => o.isMinor === true)
  @IsString()
  @IsNotEmpty()
  guardianRelationship?: string;

  @ApiProperty({ type: [PhoneNumberDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PhoneNumberDto)
  phoneNumbers: PhoneNumberDto[];

  @ApiProperty({ type: [EmployerDto], required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EmployerDto)
  employers?: EmployerDto[];

  @ApiProperty({ type: [ServiceItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ServiceItemDto)
  services: ServiceItemDto[];

  @ApiProperty({ type: PaymentConfigDto })
  @ValidateNested()
  @Type(() => PaymentConfigDto)
  paymentConfig: PaymentConfigDto;
}