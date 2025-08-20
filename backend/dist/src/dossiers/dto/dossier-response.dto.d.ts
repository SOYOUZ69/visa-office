import { DossierStatus } from '@prisma/client';
export declare class DossierResponseDto {
    id: string;
    clientId: string;
    status: DossierStatus;
    createdAt: Date;
    updatedAt: Date;
    totalAmount?: number;
    servicesCount?: number;
    paymentsCount?: number;
}
