import { SalaryType, Prisma } from '@prisma/client';

export class Employee {
  id: string;
  fullName: string;
  salaryType: SalaryType;
  salaryAmount: Prisma.Decimal | number | string;
  commissionPercentage: string;
  soldeCoungiee: Prisma.Decimal | number | string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Employee>) {
    Object.assign(this, partial);

    // Convert string or number to Decimal if needed
    if (this.salaryAmount && !(this.salaryAmount instanceof Prisma.Decimal)) {
      this.salaryAmount = new Prisma.Decimal(this.salaryAmount);
    }

    if (this.soldeCoungiee && !(this.soldeCoungiee instanceof Prisma.Decimal)) {
      this.soldeCoungiee = new Prisma.Decimal(this.soldeCoungiee);
    }
  }
}
