import { ServiceType } from '@prisma/client';
export declare class CreateServiceItemDto {
    serviceType: ServiceType;
    quantity: number;
    unitPrice: number;
}
