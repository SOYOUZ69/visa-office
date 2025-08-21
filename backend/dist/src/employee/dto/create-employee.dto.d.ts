import { SalaryType } from '@prisma/client';
export declare class CreateEmployeeDto {
    salaryType: SalaryType;
    salaryAmount: number;
    commissionPercentage: string;
    soldeCoungiee: number;
}
