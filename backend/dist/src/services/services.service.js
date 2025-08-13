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
    async getClientServices(clientId) {
        const client = await this.prisma.client.findUnique({
            where: { id: clientId },
        });
        if (!client) {
            throw new common_1.NotFoundException(`Client with ID ${clientId} not found`);
        }
        return this.prisma.serviceItem.findMany({
            where: { clientId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createService(clientId, createServiceDto) {
        const client = await this.prisma.client.findUnique({
            where: { id: clientId },
        });
        if (!client) {
            throw new common_1.NotFoundException(`Client with ID ${clientId} not found`);
        }
        return this.prisma.serviceItem.create({
            data: {
                clientId,
                serviceType: createServiceDto.serviceType,
                quantity: createServiceDto.quantity,
                unitPrice: createServiceDto.unitPrice,
            },
        });
    }
    async createManyServices(clientId, createManyServicesDto) {
        const client = await this.prisma.client.findUnique({
            where: { id: clientId },
        });
        if (!client) {
            throw new common_1.NotFoundException(`Client with ID ${clientId} not found`);
        }
        if (!createManyServicesDto.items || createManyServicesDto.items.length === 0) {
            throw new common_1.BadRequestException('At least one service item is required');
        }
        return this.prisma.$transaction(createManyServicesDto.items.map((item) => this.prisma.serviceItem.create({
            data: {
                clientId,
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
};
exports.ServicesService = ServicesService;
exports.ServicesService = ServicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServicesService);
//# sourceMappingURL=services.service.js.map