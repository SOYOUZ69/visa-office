import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { CreateManyServicesDto } from './dto/create-many-services.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceItem } from '@prisma/client';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async getClientServices(clientId: string): Promise<ServiceItem[]> {
    // Check if client exists
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    return this.prisma.serviceItem.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createService(clientId: string, createServiceDto: CreateServiceDto): Promise<ServiceItem> {
    // Check if client exists
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    return this.prisma.serviceItem.create({
      data: {
        clientId,
        serviceType: createServiceDto.serviceType,
        quantity: createServiceDto.quantity,
        unitPrice: createServiceDto.unitPrice,
      },
    });
  }

  async createManyServices(clientId: string, createManyServicesDto: CreateManyServicesDto): Promise<ServiceItem[]> {
    // Check if client exists
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
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
            clientId,
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
}
