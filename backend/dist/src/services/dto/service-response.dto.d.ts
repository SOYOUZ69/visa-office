import { ServiceType } from '@prisma/client';
export declare class ServiceResponseDto {
    id: string;
    clientId: string;
    serviceType: ServiceType;
    quantity: number;
    unitPrice: string;
    createdAt: Date;
    updatedAt: Date;
}
