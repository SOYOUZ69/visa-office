import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDossierDto } from './dto/create-dossier.dto';
import { UpdateDossierDto } from './dto/update-dossier.dto';
import { DossierResponseDto } from './dto/dossier-response.dto';
import { DossierStatus } from '@prisma/client';

@Injectable()
export class DossiersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDossierDto: CreateDossierDto): Promise<DossierResponseDto> {
    // Vérifier que le client existe
    const client = await this.prisma.client.findUnique({
      where: { id: createDossierDto.clientId },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${createDossierDto.clientId} not found`);
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
        serviceItems: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return dossiers.map(this.mapToResponseDto);
  }

  async findAllByClient(clientId: string): Promise<DossierResponseDto[]> {
    const dossiers = await this.prisma.dossier.findMany({
      where: { clientId },
      include: {
        serviceItems: true,
        payments: true,
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
      },
    });

    if (!dossier) {
      throw new NotFoundException(`Dossier with ID ${id} not found`);
    }

    return this.mapToResponseDto(dossier);
  }

  async update(id: string, updateDossierDto: UpdateDossierDto): Promise<DossierResponseDto> {
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
    const totalAmount = dossier.serviceItems?.reduce(
      (sum: number, item: any) => sum + Number(item.unitPrice) * item.quantity,
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
    };
  }
}