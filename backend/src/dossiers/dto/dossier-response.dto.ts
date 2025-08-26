import { DossierStatus } from '@prisma/client';

export class DossierEmployeeAssignmentDto {
  id: string;
  dossierId: string;
  employeeId: string;
  assignedAt: Date;
  isActive: boolean;
  role?: string;
  employee: {
    id: string;
    fullName: string;
    salaryType: string;
    commissionPercentage: string;
  };
}

export class DossierResponseDto {
  id: string;
  clientId: string;
  status: DossierStatus;
  createdAt: Date;
  updatedAt: Date;
  totalAmount?: number;
  servicesCount?: number;
  paymentsCount?: number;
  assignedEmployees?: DossierEmployeeAssignmentDto[];
}
