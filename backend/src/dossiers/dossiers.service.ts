import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDossierDto } from './dto/create-dossier.dto';
import { UpdateDossierDto } from './dto/update-dossier.dto';
import { DossierResponseDto } from './dto/dossier-response.dto';
import { DossierStatus } from '@prisma/client';

@Injectable()
export class DossiersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createDossierDto: CreateDossierDto,
  ): Promise<DossierResponseDto> {
    // Vérifier que le client existe
    const client = await this.prisma.client.findUnique({
      where: { id: createDossierDto.clientId },
    });

    if (!client) {
      throw new NotFoundException(
        `Client with ID ${createDossierDto.clientId} not found`,
      );
    }

    const dossier = await this.prisma.dossier.create({
      data: {
        clientId: createDossierDto.clientId,
        status: createDossierDto.status || DossierStatus.EN_COURS,
      },
    });

    return this.mapToResponseDto(dossier);
  }

  async findAll(): Promise<DossierResponseDto[]> {
    const dossiers = await this.prisma.dossier.findMany({
      include: {
        client: true,
        serviceItems: true,
        payments: true,
        DossierEmployeeAssignment: {
          where: { isActive: true },
          include: {
            employee: {
              select: {
                id: true,
                fullName: true,
                salaryType: true,
                commissionPercentage: true,
              },
            },
          },
          orderBy: { assignedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return dossiers.map(this.mapToResponseDto);
  }

  async findAllByClient(clientId: string): Promise<DossierResponseDto[]> {
    const dossiers = await this.prisma.dossier.findMany({
      where: { clientId },
      include: {
        client: true,
        serviceItems: true,
        payments: true,
        DossierEmployeeAssignment: {
          where: { isActive: true },
          include: {
            employee: {
              select: {
                id: true,
                fullName: true,
                salaryType: true,
                commissionPercentage: true,
              },
            },
          },
          orderBy: { assignedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return dossiers.map(this.mapToResponseDto);
  }

  async findOne(id: string): Promise<DossierResponseDto> {
    const dossier = await this.prisma.dossier.findUnique({
      where: { id },
      include: {
        client: true,
        serviceItems: true,
        payments: {
          include: {
            installments: true,
          },
        },
        DossierEmployeeAssignment: {
          where: { isActive: true },
          include: {
            employee: {
              select: {
                id: true,
                fullName: true,
                salaryType: true,
                commissionPercentage: true,
              },
            },
          },
          orderBy: { assignedAt: 'desc' },
        },
      },
    });

    if (!dossier) {
      throw new NotFoundException(`Dossier with ID ${id} not found`);
    }

    return this.mapToResponseDto(dossier);
  }

  async update(
    id: string,
    updateDossierDto: UpdateDossierDto,
  ): Promise<DossierResponseDto> {
    const existingDossier = await this.prisma.dossier.findUnique({
      where: { id },
    });

    if (!existingDossier) {
      throw new NotFoundException(`Dossier with ID ${id} not found`);
    }

    const dossier = await this.prisma.dossier.update({
      where: { id },
      data: updateDossierDto,
      include: {
        serviceItems: true,
        payments: true,
        DossierEmployeeAssignment: {
          where: { isActive: true },
          include: {
            employee: {
              select: {
                id: true,
                fullName: true,
                salaryType: true,
                commissionPercentage: true,
              },
            },
          },
          orderBy: { assignedAt: 'desc' },
        },
      },
    });

    return this.mapToResponseDto(dossier);
  }

  async remove(id: string): Promise<void> {
    const existingDossier = await this.prisma.dossier.findUnique({
      where: { id },
    });

    if (!existingDossier) {
      throw new NotFoundException(`Dossier with ID ${id} not found`);
    }

    await this.prisma.dossier.delete({
      where: { id },
    });
  }

  private mapToResponseDto(dossier: any): DossierResponseDto {
    const totalAmount =
      dossier.serviceItems?.reduce(
        (sum: number, item: any) =>
          item.isProcessed ? sum : sum + Number(item.unitPrice) * item.quantity,
        0,
      ) || 0;

    return {
      id: dossier.id,
      clientId: dossier.clientId,
      status: dossier.status,
      createdAt: dossier.createdAt,
      updatedAt: dossier.updatedAt,
      totalAmount,
      servicesCount: dossier.serviceItems?.length || 0,
      paymentsCount: dossier.payments?.length || 0,
      assignedEmployees: dossier.DossierEmployeeAssignment || [],
      client: dossier.client || null,
    };
  }
  async assignEmployee(dossierId: string, employeeId: string, role?: string) {
    // Verify dossier exists
    const dossier = await this.prisma.dossier.findUnique({
      where: { id: dossierId },
    });

    if (!dossier) {
      throw new NotFoundException(`Dossier with ID ${dossierId} not found`);
    }

    // Verify employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    // Check if assignment already exists
    const existingAssignment =
      await this.prisma.dossierEmployeeAssignment.findUnique({
        where: {
          dossierId_employeeId: {
            dossierId,
            employeeId,
          },
        },
      });

    if (existingAssignment) {
      if (existingAssignment.isActive) {
        throw new Error('Employee is already assigned to this client');
      } else {
        // Reactivate existing assignment
        await this.prisma.dossierEmployeeAssignment.update({
          where: { id: existingAssignment.id },
          data: { isActive: true, role },
        });
        return { message: 'Employee assignment reactivated' };
      }
    }

    // Create new assignment
    await this.prisma.dossierEmployeeAssignment.create({
      data: {
        dossierId,
        employeeId,
        role,
      },
    });

    return { message: 'Employee assigned to dossier successfully' };
  }

  async unassignEmployee(dossierId: string, employeeId: string) {
    const assignment = await this.prisma.dossierEmployeeAssignment.findUnique({
      where: {
        dossierId_employeeId: {
          dossierId,
          employeeId,
        },
      },
    });

    if (!assignment) {
      throw new Error('Employee is not assigned to this client');
    }

    // Soft delete by setting isActive to false
    await this.prisma.dossierEmployeeAssignment.update({
      where: { id: assignment.id },
      data: { isActive: false },
    });

    return { message: 'Employee unassigned from client successfully' };
  }

  async getAssignedEmployees(dossierId: string) {
    const assignments = await this.prisma.dossierEmployeeAssignment.findMany({
      where: {
        dossierId,
        isActive: true,
      },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            salaryType: true,
            commissionPercentage: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    return assignments;
  }
  async getUnprocessedServices(dossierId: string) {
    const services = await this.prisma.serviceItem.findMany({
      where: { dossierId, isProcessed: false },
    });
    return services;
  }
}
