import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { CreateManyServicesDto } from './dto/create-many-services.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceItem } from '@prisma/client';
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    getClientServices(clientId: string): Promise<ServiceItem[]>;
    createService(clientId: string, createServiceDto: CreateServiceDto): Promise<ServiceItem>;
    createManyServices(clientId: string, createManyServicesDto: CreateManyServicesDto): Promise<ServiceItem[]>;
    updateService(serviceId: string, updateServiceDto: UpdateServiceDto): Promise<ServiceItem>;
    deleteService(serviceId: string): Promise<void>;
}
