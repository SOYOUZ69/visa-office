import { SalaryType, Prisma } from '@prisma/client';

export class Employee {
  id: string;
  fullName: string;
  email?: string;
  userId?: string;
  department?: string;
  hireDate?: Date;
  salaryType: SalaryType;
  salaryAmount: Prisma.Decimal | number | string;
  commissionPercentage: string;
  soldeCoungiee: Prisma.Decimal | number | string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: any) {
    // Convert null values to undefined for optional fields
    const cleanedPartial = {
      ...partial,
      email: partial.email ?? undefined,
      userId: partial.userId ?? undefined,
      department: partial.department ?? undefined,
      hireDate: partial.hireDate ?? undefined,
    };

    Object.assign(this, cleanedPartial);

    // Convert string or number to Decimal if needed
    if (this.salaryAmount && !(this.salaryAmount instanceof Prisma.Decimal)) {
      this.salaryAmount = new Prisma.Decimal(this.salaryAmount);
    }

    if (this.soldeCoungiee && !(this.soldeCoungiee instanceof Prisma.Decimal)) {
      this.soldeCoungiee = new Prisma.Decimal(this.soldeCoungiee);
    }
  }
}
