import { CaisseType } from '@prisma/client';
export declare class CreateCaisseDto {
    name: string;
    type: CaisseType;
    description?: string;
    isActive?: boolean;
}
