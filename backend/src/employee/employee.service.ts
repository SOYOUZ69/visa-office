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
    
    return employees.map(emp => new Employee(emp));
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
    
    if (updateEmployeeDto.soldeCoungiee !== undefined) {
      data.soldeCoungiee = new Prisma.Decimal(updateEmployeeDto.soldeCoungiee as unknown as string | number);
    }
    
    if (updateEmployeeDto.salaryAmount !== undefined) {
      data.salaryAmount = new Prisma.Decimal(updateEmployeeDto.salaryAmount as unknown as string | number);
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
}
