import { IsString, IsEmail, IsOptional, IsBoolean, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { SalaryType } from '@prisma/client';

export class CreateEmployeeDataDto {
  @IsString()
  fullName: string;

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
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  roleId?: string;

  @IsOptional()
  employeeData?: CreateEmployeeDataDto;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  roleId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AssignRoleDto {
  @IsString()
  roleId: string;
}