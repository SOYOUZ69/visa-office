import { IsEnum, IsNumber, IsString, IsNotEmpty } from 'class-validator';
import { SalaryType } from '@prisma/client';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEnum(SalaryType)
  salaryType: SalaryType;

  @IsNumber()
  salaryAmount: number;

  @IsString()
  commissionPercentage: string;

  @IsNumber()
  soldeCoungiee: number;
}
