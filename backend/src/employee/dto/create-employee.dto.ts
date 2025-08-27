import {
  IsEnum,
  IsNumber,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { SalaryType } from '@prisma/client';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @IsEnum(SalaryType)
  salaryType: SalaryType;

  @IsNumber()
  salaryAmount: number;

  @IsString()
  commissionPercentage: string;

  @IsNumber()
  soldeCoungiee: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
