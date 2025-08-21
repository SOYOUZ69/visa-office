import { SalaryType, Prisma } from '@prisma/client';
export declare class Employee {
    id: string;
    salaryType: SalaryType;
    salaryAmount: Prisma.Decimal | number | string;
    commissionPercentage: string;
    soldeCoungiee: Prisma.Decimal | number | string;
    createdAt: Date;
    updatedAt: Date;
    constructor(partial: Partial<Employee>);
}
