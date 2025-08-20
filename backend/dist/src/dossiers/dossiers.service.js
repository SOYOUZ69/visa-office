"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DossiersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DossiersService = class DossiersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createDossierDto) {
        const client = await this.prisma.client.findUnique({
            where: { id: createDossierDto.clientId },
        });
        if (!client) {
            throw new common_1.NotFoundException(`Client with ID ${createDossierDto.clientId} not found`);
        }
        const dossier = await this.prisma.dossier.create({
            data: {
                clientId: createDossierDto.clientId,
                status: createDossierDto.status || client_1.DossierStatus.EN_COURS,
            },
        });
        return this.mapToResponseDto(dossier);
    }
    async findAll() {
        const dossiers = await this.prisma.dossier.findMany({
            include: {
                serviceItems: true,
                payments: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return dossiers.map(this.mapToResponseDto);
    }
    async findAllByClient(clientId) {
        const dossiers = await this.prisma.dossier.findMany({
            where: { clientId },
            include: {
                serviceItems: true,
                payments: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return dossiers.map(this.mapToResponseDto);
    }
    async findOne(id) {
        const dossier = await this.prisma.dossier.findUnique({
            where: { id },
            include: {
                client: true,
                serviceItems: true,
                payments: {
                    include: {
                        installments: true,
                    },
                },
            },
        });
        if (!dossier) {
            throw new common_1.NotFoundException(`Dossier with ID ${id} not found`);
        }
        return this.mapToResponseDto(dossier);
    }
    async update(id, updateDossierDto) {
        const existingDossier = await this.prisma.dossier.findUnique({
            where: { id },
        });
        if (!existingDossier) {
            throw new common_1.NotFoundException(`Dossier with ID ${id} not found`);
        }
        const dossier = await this.prisma.dossier.update({
            where: { id },
            data: updateDossierDto,
            include: {
                serviceItems: true,
                payments: true,
            },
        });
        return this.mapToResponseDto(dossier);
    }
    async remove(id) {
        const existingDossier = await this.prisma.dossier.findUnique({
            where: { id },
        });
        if (!existingDossier) {
            throw new common_1.NotFoundException(`Dossier with ID ${id} not found`);
        }
        await this.prisma.dossier.delete({
            where: { id },
        });
    }
    mapToResponseDto(dossier) {
        const totalAmount = dossier.serviceItems?.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0) || 0;
        return {
            id: dossier.id,
            clientId: dossier.clientId,
            status: dossier.status,
            createdAt: dossier.createdAt,
            updatedAt: dossier.updatedAt,
            totalAmount,
            servicesCount: dossier.serviceItems?.length || 0,
            paymentsCount: dossier.payments?.length || 0,
        };
    }
};
exports.DossiersService = DossiersService;
exports.DossiersService = DossiersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DossiersService);
//# sourceMappingURL=dossiers.service.js.map