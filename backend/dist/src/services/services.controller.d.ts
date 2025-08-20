import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { CreateManyServicesDto } from './dto/create-many-services.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceType } from '@prisma/client';
import { ServiceItem } from '@prisma/client';
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    getClientServices(clientId: string): Promise<ServiceItem[]>;
    getDossierServices(dossierId: string): Promise<ServiceItem[]>;
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
