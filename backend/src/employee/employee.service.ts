import { paymentsAPI } from './../../../frontend/src/lib/api';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './entities/employee.entity';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const data: Prisma.EmployeeCreateInput = {
      fullName: createEmployeeDto.fullName,
      salaryType: createEmployeeDto.salaryType,
      salaryAmount: new Prisma.Decimal(createEmployeeDto.salaryAmount),
      commissionPercentage: createEmployeeDto.commissionPercentage,
      soldeCoungiee: new Prisma.Decimal(createEmployeeDto.soldeCoungiee || 0),
    };

    const created = await this.prisma.employee.create({
      data,
    });

    return new Employee(created);
  }

  async findAll(): Promise<Employee[]> {
    const employees = await this.prisma.employee.findMany({
      orderBy: {
        id: 'desc',
      },
    });

    return employees.map((emp) => new Employee(emp));
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        commissions: true,
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return new Employee(employee);
  }

  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    const data: Prisma.EmployeeUpdateInput = {};

    if (updateEmployeeDto.fullName !== undefined) {
      data.fullName = updateEmployeeDto.fullName;
    }

    if (updateEmployeeDto.soldeCoungiee !== undefined) {
      data.soldeCoungiee = new Prisma.Decimal(
        updateEmployeeDto.soldeCoungiee as unknown as string | number,
      );
    }

    if (updateEmployeeDto.salaryAmount !== undefined) {
      data.salaryAmount = new Prisma.Decimal(
        updateEmployeeDto.salaryAmount as unknown as string | number,
      );
    }

    if (updateEmployeeDto.salaryType !== undefined) {
      data.salaryType = updateEmployeeDto.salaryType;
    }

    if (updateEmployeeDto.commissionPercentage !== undefined) {
      data.commissionPercentage = updateEmployeeDto.commissionPercentage;
    }

    try {
      const updated = await this.prisma.employee.update({
        where: { id },
        data,
      });

      return new Employee(updated);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Employee with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.employee.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Employee with ID ${id} not found`);
      }
      throw error;
    }
  }

  // Attendance Management
  async markAttendance(
    employeeId: string,
    date: Date,
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY',
    reason?: string,
  ) {
    // Verify employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    // Check if attendance already exists for this date
    const existingAttendance = await this.prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: new Date(date),
        },
      },
    });

    if (existingAttendance) {
      // Update existing attendance
      return this.prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          status,
          reason,
        },
      });
    } else {
      // Create new attendance
      return this.prisma.attendance.create({
        data: {
          employeeId,
          date: new Date(date),
          status,
          reason,
        },
      });
    }
  }

  async getAttendance(employeeId: string, startDate?: Date, endDate?: Date) {
    // Verify employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    const where: any = { employeeId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    return this.prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  // Automatic Solde Coungiee Management
  async calculateMonthlySoldeCoungiee(
    employeeId: string,
    month: number,
    year: number,
  ) {
    // Verify employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    // Get attendance for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendance = await this.prisma.attendance.findMany({
      where: {
        employeeId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Calculate solde coungiee
    let soldeChange = 4; // Base monthly bonus

    // Subtract for absences
    const absences = attendance.filter((a) => a.status === 'ABSENT');
    soldeChange -= absences.length;

    // Update employee solde coungiee
    const newSolde = employee.soldeCoungiee.plus(soldeChange);

    return this.prisma.employee.update({
      where: { id: employeeId },
      data: {
        soldeCoungiee: newSolde,
      },
    });
  }

  // Commission Calculation - Only from unprocessed commissions
  async calculateCommission(
    employeeId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    // Verify employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    // Get unprocessed commissions for this employee
    const whereClause: any = {
      employeeId,
      processed: false,
    };

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = startDate;
      if (endDate) whereClause.createdAt.lte = endDate;
    }

    const unprocessedCommissions =
      await this.prisma.employeeCommission.findMany({
        where: whereClause,
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
            },
          },
          payment: {
            select: {
              id: true,
              totalAmount: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

    // Calculate total commission from unprocessed records
    let totalCommission = 0;
    const commissionDetails: Array<{
      clientId: string;
      clientName: string;
      paymentId: string;
      paymentAmount: number;
      commissionAmount: number;
      commissionPercentage: string;
      commissionId: string;
    }> = [];

    for (const commission of unprocessedCommissions) {
      const commissionAmount = Number(commission.commissionAmount);
      totalCommission += commissionAmount;

      commissionDetails.push({
        clientId: commission.clientId,
        clientName: commission.client.fullName,
        paymentId: commission.paymentId,
        paymentAmount: Number(commission.paymentAmount),
        commissionAmount,
        commissionPercentage: Number(
          commission.commissionPercentage,
        ).toString(),
        commissionId: commission.id,
      });
    }

    return {
      employeeId,
      employeeName: employee.fullName,
      commissionPercentage: employee.commissionPercentage,
      totalCommission,
      commissionDetails,
      unprocessedCount: unprocessedCommissions.length,
      period: {
        startDate: startDate || new Date(0),
        endDate: endDate || new Date(),
      },
    };
  }

  // Process Commission - Mark as processed and create transaction
  async processCommission(employeeId: string, commissionIds?: string[]) {
    // Verify employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    // Get unprocessed commissions to process
    const whereClause: any = {
      employeeId,
      processed: false,
    };

    if (commissionIds && commissionIds.length > 0) {
      whereClause.id = { in: commissionIds };
    }

    const unprocessedCommissions =
      await this.prisma.employeeCommission.findMany({
        where: whereClause,
        include: {
          client: {
            select: {
              fullName: true,
            },
          },
        },
      });

    if (unprocessedCommissions.length === 0) {
      throw new Error('No unprocessed commissions found for this employee');
    }

    // Calculate total commission amount
    const totalCommissionAmount = unprocessedCommissions.reduce(
      (sum, commission) => sum + Number(commission.commissionAmount),
      0,
    );

    // Get default caisse (first active caisse)
    const defaultCaisse = await this.prisma.caisse.findFirst({
      where: { isActive: true },
    });

    if (!defaultCaisse) {
      throw new Error('No active caisse found for transaction');
    }

    // Use transaction to ensure data consistency
    return await this.prisma.$transaction(async (prisma) => {
      // Mark commissions as processed
      await prisma.employeeCommission.updateMany({
        where: {
          id: { in: unprocessedCommissions.map((c) => c.id) },
        },
        data: {
          processed: true,
        },
      });

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          caisseId: defaultCaisse.id,
          type: 'EXPENSE',
          category: 'SALARIES',
          amount: totalCommissionAmount,
          description: `Commission payment for ${employee.fullName}`,
          reference: `Employee: ${employee.fullName}, Commissions: ${unprocessedCommissions.length}`,
          status: 'PENDING', // Auto-approve commission payments
          approvedAt: new Date(),
          transactionDate: new Date(),
        },
      });

      // Update caisse balance
      await prisma.caisse.update({
        where: { id: defaultCaisse.id },
        data: {
          balance: {
            decrement: totalCommissionAmount,
          },
        },
      });

      return {
        processedCommissions: unprocessedCommissions.length,
        totalAmount: totalCommissionAmount,
        transactionId: transaction.id,
        employeeName: employee.fullName,
        commissionDetails: unprocessedCommissions.map((commission) => ({
          clientName: commission.client.fullName,
          commissionAmount: Number(commission.commissionAmount),
          paymentAmount: Number(commission.paymentAmount),
        })),
      };
    });
  }

  // Get all employees with their current solde coungiee and commission info
  async getEmployeesWithStats() {
    const employees = await this.prisma.employee.findMany({
      include: {
        assignedClients: {
          include: {
            payments: true,
          },
        },
        attendance: {
          where: {
            date: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        },
      },
    });

    return employees.map((employee) => {
      const currentMonthAttendance = employee.attendance;
      const absences = currentMonthAttendance.filter(
        (a) => a.status === 'ABSENT',
      ).length;

      const totalCommission = employee.assignedClients.reduce((sum, client) => {
        return (
          sum +
          client.payments.reduce((paymentSum, payment) => {
            return (
              paymentSum +
              (Number(payment.totalAmount) *
                parseFloat(employee.commissionPercentage)) /
                100
            );
          }, 0)
        );
      }, 0);

      return {
        ...employee,
        currentMonthAbsences: absences,
        totalCommission,
        assignedClientsCount: employee.assignedClients.length,
      };
    });
  }
  async calculateAndRecordCommission(
    employeeId: string,
    paymentId: string,
    clientId: string,
    paymentAmount: number,
  ) {
    // Get employee details
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new Error(`Employee with ID ${employeeId} not found`);
    }

    // Only process commission for CLIENTCOMMISSION type employees
    if (employee.salaryType !== 'CLIENTCOMMISSION') {
      return null;
    }

    // Calculate commission amount
    const commissionPercentage = parseFloat(employee.commissionPercentage);
    const commissionAmount = (paymentAmount * commissionPercentage) / 100;

    // Create commission record
    const commissionRecord = await this.prisma.employeeCommission.create({
      data: {
        employeeId: employee.id,
        paymentId: paymentId,
        clientId: clientId,
        commissionAmount: commissionAmount,
        commissionPercentage: commissionPercentage,
        paymentAmount: paymentAmount,
      },
    });

    // Update employee salary amount
    await this.prisma.employee.update({
      where: { id: employee.id },
      data: {
        salaryAmount: {
          increment: commissionAmount,
        },
      },
    });

    console.log(
      `Commission of ${commissionAmount} TND added for employee ${employee.fullName}`,
    );

    return commissionRecord;
  }

  /**
   * Get commission history for an employee
   */
  async getEmployeeCommissionHistory(
    employeeId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const where: any = { employeeId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    return this.prisma.employeeCommission.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
          },
        },
        payment: {
          select: {
            id: true,
            totalAmount: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get commission summary for an employee in a date range
   */
  async getEmployeeCommissionSummary(
    employeeId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const commissions = await this.prisma.employeeCommission.findMany({
      where: {
        employeeId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        client: {
          select: {
            fullName: true,
          },
        },
      },
    });

    const totalCommission = commissions.reduce(
      (sum, commission) => sum + Number(commission.commissionAmount),
      0,
    );

    const commissionDetails = commissions.map((commission) => ({
      clientName: commission.client.fullName,
      paymentAmount: Number(commission.paymentAmount),
      commissionAmount: Number(commission.commissionAmount),
      commissionPercentage: Number(commission.commissionPercentage),
      date: commission.createdAt,
    }));

    return {
      totalCommission,
      commissionDetails,
      period: { startDate, endDate },
    };
  }
}
