import { ServiceType } from '@prisma/client';
export declare class UpdateServiceDto {
    serviceType?: ServiceType;
    quantity?: number;
    unitPrice?: number;
}
