import { SalaryType } from '@prisma/client';
export declare class CreateEmployeeDto {
    fullName: string;
    salaryType: SalaryType;
    salaryAmount: number;
    commissionPercentage: string;
    soldeCoungiee: number;
}
