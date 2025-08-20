import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DossierStatus } from '@prisma/client';

export class CreateDossierDto {
  @IsString()
  clientId: string;

  @IsOptional()
  @IsEnum(DossierStatus)
  status?: DossierStatus;
}