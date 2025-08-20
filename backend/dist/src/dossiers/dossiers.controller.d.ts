import { DossiersService } from './dossiers.service';
import { CreateDossierDto } from './dto/create-dossier.dto';
import { UpdateDossierDto } from './dto/update-dossier.dto';
import { DossierResponseDto } from './dto/dossier-response.dto';
export declare class DossiersController {
    private readonly dossiersService;
    constructor(dossiersService: DossiersService);
    create(createDossierDto: CreateDossierDto): Promise<DossierResponseDto>;
    findAll(clientId?: string): Promise<DossierResponseDto[]>;
    findOne(id: string): Promise<DossierResponseDto>;
    update(id: string, updateDossierDto: UpdateDossierDto): Promise<DossierResponseDto>;
    remove(id: string): Promise<void>;
}
