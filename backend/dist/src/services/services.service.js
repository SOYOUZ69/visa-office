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
exports.ServicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ServicesService = class ServicesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDossierServices(dossierId) {
        const dossier = await this.prisma.dossier.findUnique({
            where: { id: dossierId },
            include: { client: true },
        });
        if (!dossier) {
            throw new common_1.NotFoundException(`Dossier with ID ${dossierId} not found`);
        }
        return this.prisma.serviceItem.findMany({
            where: { dossierId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getClientServices(clientId) {
        const client = await this.prisma.client.findUnique({
            where: { id: clientId },
            include: {
                dossiers: {
                    include: {
                        serviceItems: true,
                    },
                },
            },
        });
        if (!client) {
            throw new common_1.NotFoundException(`Client with ID ${clientId} not found`);
        }
        const allServices = client.dossiers.flatMap(dossier => dossier.serviceItems);
        return allServices.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async createService(createServiceDto) {
        const dossier = await this.prisma.dossier.findUnique({
            where: { id: createServiceDto.dossierId },
            include: { client: true },
        });
        if (!dossier) {
            throw new common_1.NotFoundException(`Dossier with ID ${createServiceDto.dossierId} not found`);
        }
        return this.prisma.serviceItem.create({
            data: {
                dossierId: createServiceDto.dossierId,
                serviceType: createServiceDto.serviceType,
                quantity: createServiceDto.quantity,
                unitPrice: createServiceDto.unitPrice,
            },
        });
    }
    async createManyServices(createManyServicesDto) {
        const dossier = await this.prisma.dossier.findUnique({
            where: { id: createManyServicesDto.dossierId },
            include: { client: true },
        });
        if (!dossier) {
            throw new common_1.NotFoundException(`Dossier with ID ${createManyServicesDto.dossierId} not found`);
        }
        if (!createManyServicesDto.items || createManyServicesDto.items.length === 0) {
            throw new common_1.BadRequestException('At least one service item is required');
        }
        return this.prisma.$transaction(createManyServicesDto.items.map((item) => this.prisma.serviceItem.create({
            data: {
                dossierId: createManyServicesDto.dossierId,
                serviceType: item.serviceType,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
            },
        })));
    }
    async updateService(serviceId, updateServiceDto) {
        const existingService = await this.prisma.serviceItem.findUnique({
            where: { id: serviceId },
        });
        if (!existingService) {
            throw new common_1.NotFoundException(`Service with ID ${serviceId} not found`);
        }
        return this.prisma.serviceItem.update({
            where: { id: serviceId },
            data: updateServiceDto,
        });
    }
    async deleteService(serviceId) {
        const existingService = await this.prisma.serviceItem.findUnique({
            where: { id: serviceId },
        });
        if (!existingService) {
            throw new common_1.NotFoundException(`Service with ID ${serviceId} not found`);
        }
        await this.prisma.serviceItem.delete({
            where: { id: serviceId },
        });
    }
    async getLastPrice(serviceType) {
        const lastService = await this.prisma.serviceItem.findFirst({
            where: { serviceType },
            orderBy: { createdAt: 'desc' },
        });
        return {
            unitPrice: lastService ? Number(lastService.unitPrice) : null,
        };
    }
    async getLastPrices(serviceTypes) {
        const results = {};
        const promises = serviceTypes.map(async (serviceType) => {
            const lastService = await this.prisma.serviceItem.findFirst({
                where: { serviceType },
                orderBy: { createdAt: 'desc' },
            });
            return {
                serviceType,
                unitPrice: lastService ? Number(lastService.unitPrice) : null,
            };
        });
        const responses = await Promise.all(promises);
        responses.forEach(({ serviceType, unitPrice }) => {
            results[serviceType] = unitPrice;
        });
        return results;
    }
};
exports.ServicesService = ServicesService;
exports.ServicesService = ServicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServicesService);
//# sourceMappingURL=services.service.js.map