import { ServiceType } from '@prisma/client';
export declare class CreateServiceDto {
    dossierId: string;
    serviceType: ServiceType;
    quantity: number;
    unitPrice: number;
}
