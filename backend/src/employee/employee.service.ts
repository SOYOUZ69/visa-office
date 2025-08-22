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

  // Commission Calculation
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

    // Get clients assigned to this employee
    const assignedClients = await this.prisma.client.findMany({
      where: {
        assignedEmployeeId: employeeId,
      },
      include: {
        payments: {
          where: {
            createdAt: {
              gte: startDate || new Date(0),
              lte: endDate || new Date(),
            },
          },
        },
      },
    });

    // Calculate commission
    let totalCommission = 0;
    const commissionDetails: Array<{
      clientId: string;
      clientName: string;
      paymentId: string;
      paymentAmount: number;
      commissionAmount: number;
      commissionPercentage: string;
    }> = [];

    for (const client of assignedClients) {
      for (const payment of client.payments) {
        const commissionAmount =
          (Number(payment.totalAmount) *
            parseFloat(employee.commissionPercentage)) /
          100;
        totalCommission += commissionAmount;

        commissionDetails.push({
          clientId: client.id,
          clientName: client.fullName,
          paymentId: payment.id,
          paymentAmount: Number(payment.totalAmount),
          commissionAmount,
          commissionPercentage: employee.commissionPercentage,
        });
      }
    }

    return {
      employeeId,
      employeeName: employee.fullName,
      commissionPercentage: employee.commissionPercentage,
      totalCommission,
      commissionDetails,
      period: {
        startDate: startDate || new Date(0),
        endDate: endDate || new Date(),
      },
    };
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
}
