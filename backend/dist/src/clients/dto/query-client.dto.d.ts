import { ClientType, ClientStatus } from '@prisma/client';
export declare class QueryClientDto {
    search?: string;
    status?: ClientStatus;
    clientType?: ClientType;
    page?: number;
    limit?: number;
}
