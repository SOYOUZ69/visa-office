import { PrismaService } from '../prisma/prisma.service';
import { CreateDossierDto } from './dto/create-dossier.dto';
import { UpdateDossierDto } from './dto/update-dossier.dto';
import { DossierResponseDto } from './dto/dossier-response.dto';
export declare class DossiersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createDossierDto: CreateDossierDto): Promise<DossierResponseDto>;
    findAll(): Promise<DossierResponseDto[]>;
    findAllByClient(clientId: string): Promise<DossierResponseDto[]>;
    findOne(id: string): Promise<DossierResponseDto>;
    update(id: string, updateDossierDto: UpdateDossierDto): Promise<DossierResponseDto>;
    remove(id: string): Promise<void>;
    private mapToResponseDto;
}
