import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { CreateManyServicesDto } from './dto/create-many-services.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceItem, ServiceType } from '@prisma/client';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async getDossierServices(dossierId: string): Promise<ServiceItem[]> {
    // Check if dossier exists
    const dossier = await this.prisma.dossier.findUnique({
      where: { id: dossierId },
      include: { client: true },
    });

    if (!dossier) {
      throw new NotFoundException(`Dossier with ID ${dossierId} not found`);
    }

    return this.prisma.serviceItem.findMany({
      where: { dossierId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getClientServices(clientId: string): Promise<ServiceItem[]> {
    // Check if client exists
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        dossiers: {
          include: {
            serviceItems: true,
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    // Flatten all services from all dossiers
    const allServices = client.dossiers.flatMap(dossier => dossier.serviceItems);
    return allServices.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createService(createServiceDto: CreateServiceDto): Promise<ServiceItem> {
    // Check if dossier exists
    const dossier = await this.prisma.dossier.findUnique({
      where: { id: createServiceDto.dossierId },
      include: { client: true },
    });

    if (!dossier) {
      throw new NotFoundException(`Dossier with ID ${createServiceDto.dossierId} not found`);
    }

    return this.prisma.serviceItem.create({
      data: {
        dossierId: createServiceDto.dossierId,
        serviceType: createServiceDto.serviceType,
        quantity: createServiceDto.quantity,
        unitPrice: createServiceDto.unitPrice,
      },
    });
  }

  async createManyServices(createManyServicesDto: CreateManyServicesDto): Promise<ServiceItem[]> {
    // Check if dossier exists
    const dossier = await this.prisma.dossier.findUnique({
      where: { id: createManyServicesDto.dossierId },
      include: { client: true },
    });

    if (!dossier) {
      throw new NotFoundException(`Dossier with ID ${createManyServicesDto.dossierId} not found`);
    }

    // Validate that we have at least one item
    if (!createManyServicesDto.items || createManyServicesDto.items.length === 0) {
      throw new BadRequestException('At least one service item is required');
    }

    // Create all services in a transaction
    return this.prisma.$transaction(
      createManyServicesDto.items.map((item) =>
        this.prisma.serviceItem.create({
          data: {
            dossierId: createManyServicesDto.dossierId,
            serviceType: item.serviceType,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          },
        })
      )
    );
  }

  async updateService(serviceId: string, updateServiceDto: UpdateServiceDto): Promise<ServiceItem> {
    // Check if service exists
    const existingService = await this.prisma.serviceItem.findUnique({
      where: { id: serviceId },
    });

    if (!existingService) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    return this.prisma.serviceItem.update({
      where: { id: serviceId },
      data: updateServiceDto,
    });
  }

  async deleteService(serviceId: string): Promise<void> {
    // Check if service exists
    const existingService = await this.prisma.serviceItem.findUnique({
      where: { id: serviceId },
    });

    if (!existingService) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    await this.prisma.serviceItem.delete({
      where: { id: serviceId },
    });
  }

  async getLastPrice(serviceType: ServiceType): Promise<{ unitPrice: number | null }> {
    const lastService = await this.prisma.serviceItem.findFirst({
      where: { serviceType },
      orderBy: { createdAt: 'desc' },
    });

    return {
      unitPrice: lastService ? Number(lastService.unitPrice) : null,
    };
  }

  async getLastPrices(serviceTypes: ServiceType[]): Promise<{ [key: string]: number | null }> {
    const results: { [key: string]: number | null } = {};

    // Use Promise.all to fetch all service types in parallel
    const promises = serviceTypes.map(async (serviceType) => {
      const lastService = await this.prisma.serviceItem.findFirst({
        where: { serviceType },
        orderBy: { createdAt: 'desc' },
      });

      return {
        serviceType,
        unitPrice: lastService ? Number(lastService.unitPrice) : null,
      };
    });

    const responses = await Promise.all(promises);

    // Build the response object
    responses.forEach(({ serviceType, unitPrice }) => {
      results[serviceType] = unitPrice;
    });

    return results;
  }
}
