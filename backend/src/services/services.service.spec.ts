import { Test, TestingModule } from '@nestjs/testing';
import { ServicesService } from './services.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { CreateManyServicesDto } from './dto/create-many-services.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceType } from '@prisma/client';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ServicesService', () => {
  let service: ServicesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    client: {
      findUnique: jest.fn(),
    },
    serviceItem: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getClientServices', () => {
    it('should return services for a valid client', async () => {
      const clientId = 'test-client-id';
      const mockClient = { id: clientId, fullName: 'Test Client' };
      const mockServices = [
        {
          id: 'service-1',
          clientId,
          serviceType: ServiceType.TRANSLATION,
          quantity: 2,
          unitPrice: '50.00',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);
      mockPrismaService.serviceItem.findMany.mockResolvedValue(mockServices);

      const result = await service.getClientServices(clientId);

      expect(result).toEqual(mockServices);
      expect(mockPrismaService.client.findUnique).toHaveBeenCalledWith({
        where: { id: clientId },
      });
      expect(mockPrismaService.serviceItem.findMany).toHaveBeenCalledWith({
        where: { clientId },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should throw NotFoundException for non-existent client', async () => {
      const clientId = 'non-existent-client';

      mockPrismaService.client.findUnique.mockResolvedValue(null);

      await expect(service.getClientServices(clientId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createService', () => {
    it('should create a service for a valid client', async () => {
      const clientId = 'test-client-id';
      const createServiceDto: CreateServiceDto = {
        serviceType: ServiceType.TRANSLATION,
        quantity: 2,
        unitPrice: 50.00,
      };
      const mockClient = { id: clientId, fullName: 'Test Client' };
      const mockCreatedService = {
        id: 'service-1',
        clientId,
        ...createServiceDto,
        unitPrice: '50.00',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);
      mockPrismaService.serviceItem.create.mockResolvedValue(mockCreatedService);

      const result = await service.createService(clientId, createServiceDto);

      expect(result).toEqual(mockCreatedService);
      expect(mockPrismaService.serviceItem.create).toHaveBeenCalledWith({
        data: {
          clientId,
          serviceType: createServiceDto.serviceType,
          quantity: createServiceDto.quantity,
          unitPrice: createServiceDto.unitPrice,
        },
      });
    });

    it('should throw NotFoundException for non-existent client', async () => {
      const clientId = 'non-existent-client';
      const createServiceDto: CreateServiceDto = {
        serviceType: ServiceType.TRANSLATION,
        quantity: 2,
        unitPrice: 50.00,
      };

      mockPrismaService.client.findUnique.mockResolvedValue(null);

      await expect(
        service.createService(clientId, createServiceDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createManyServices', () => {
    it('should create multiple services for a valid client', async () => {
      const clientId = 'test-client-id';
      const createManyServicesDto: CreateManyServicesDto = {
        items: [
          {
            serviceType: ServiceType.TRANSLATION,
            quantity: 2,
            unitPrice: 50.00,
          },
          {
            serviceType: ServiceType.DOSSIER_TREATMENT,
            quantity: 1,
            unitPrice: 120.00,
          },
        ],
      };
      const mockClient = { id: clientId, fullName: 'Test Client' };
      const mockCreatedServices = [
        {
          id: 'service-1',
          clientId,
          serviceType: ServiceType.TRANSLATION,
          quantity: 2,
          unitPrice: '50.00',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'service-2',
          clientId,
          serviceType: ServiceType.DOSSIER_TREATMENT,
          quantity: 1,
          unitPrice: '120.00',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);
      mockPrismaService.$transaction.mockResolvedValue(mockCreatedServices);

      const result = await service.createManyServices(
        clientId,
        createManyServicesDto,
      );

      expect(result).toEqual(mockCreatedServices);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException for empty items array', async () => {
      const clientId = 'test-client-id';
      const createManyServicesDto: CreateManyServicesDto = {
        items: [],
      };
      const mockClient = { id: clientId, fullName: 'Test Client' };

      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);

      await expect(
        service.createManyServices(clientId, createManyServicesDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateService', () => {
    it('should update an existing service', async () => {
      const serviceId = 'service-1';
      const updateServiceDto: UpdateServiceDto = {
        quantity: 3,
        unitPrice: 18.00,
      };
      const mockExistingService = {
        id: serviceId,
        clientId: 'client-1',
        serviceType: ServiceType.TRANSLATION,
        quantity: 2,
        unitPrice: '50.00',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockUpdatedService = {
        ...mockExistingService,
        quantity: 3,
        unitPrice: '18.00',
      };

      mockPrismaService.serviceItem.findUnique.mockResolvedValue(
        mockExistingService,
      );
      mockPrismaService.serviceItem.update.mockResolvedValue(mockUpdatedService);

      const result = await service.updateService(serviceId, updateServiceDto);

      expect(result).toEqual(mockUpdatedService);
      expect(mockPrismaService.serviceItem.update).toHaveBeenCalledWith({
        where: { id: serviceId },
        data: updateServiceDto,
      });
    });

    it('should throw NotFoundException for non-existent service', async () => {
      const serviceId = 'non-existent-service';
      const updateServiceDto: UpdateServiceDto = {
        quantity: 3,
        unitPrice: 18.00,
      };

      mockPrismaService.serviceItem.findUnique.mockResolvedValue(null);

      await expect(
        service.updateService(serviceId, updateServiceDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteService', () => {
    it('should delete an existing service', async () => {
      const serviceId = 'service-1';
      const mockExistingService = {
        id: serviceId,
        clientId: 'client-1',
        serviceType: ServiceType.TRANSLATION,
        quantity: 2,
        unitPrice: '50.00',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.serviceItem.findUnique.mockResolvedValue(
        mockExistingService,
      );
      mockPrismaService.serviceItem.delete.mockResolvedValue(undefined);

      await service.deleteService(serviceId);

      expect(mockPrismaService.serviceItem.delete).toHaveBeenCalledWith({
        where: { id: serviceId },
      });
    });

    it('should throw NotFoundException for non-existent service', async () => {
      const serviceId = 'non-existent-service';

      mockPrismaService.serviceItem.findUnique.mockResolvedValue(null);

      await expect(service.deleteService(serviceId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
