import { DossierStatus } from '@prisma/client';
export declare class CreateDossierDto {
    clientId: string;
    status?: DossierStatus;
}
