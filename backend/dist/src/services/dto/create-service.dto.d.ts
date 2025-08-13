import { ServiceType } from '@prisma/client';
export declare class CreateServiceDto {
    serviceType: ServiceType;
    quantity: number;
    unitPrice: number;
}
