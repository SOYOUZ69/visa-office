import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { CreateManyServicesDto } from './dto/create-many-services.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceItem, ServiceType } from '@prisma/client';
export declare class ServicesService {
    private prisma;
    constructor(prisma: PrismaService);
    getDossierServices(dossierId: string): Promise<ServiceItem[]>;
    getClientServices(clientId: string): Promise<ServiceItem[]>;
    createService(createServiceDto: CreateServiceDto): Promise<ServiceItem>;
    createManyServices(createManyServicesDto: CreateManyServicesDto): Promise<ServiceItem[]>;
    updateService(serviceId: string, updateServiceDto: UpdateServiceDto): Promise<ServiceItem>;
    deleteService(serviceId: string): Promise<void>;
    getLastPrice(serviceType: ServiceType): Promise<{
        unitPrice: number | null;
    }>;
    getLastPrices(serviceTypes: ServiceType[]): Promise<{
        [key: string]: number | null;
    }>;
}
