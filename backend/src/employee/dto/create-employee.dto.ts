import { IsEnum, IsNumber, IsString } from 'class-validator';
import { SalaryType } from '@prisma/client';

export class CreateEmployeeDto {
  @IsEnum(SalaryType)
  salaryType: SalaryType;

  @IsNumber()
  salaryAmount: number;

  @IsString()
  commissionPercentage: string;

  @IsNumber()
  soldeCoungiee: number;
}
