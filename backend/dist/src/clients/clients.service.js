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
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ClientsService = class ClientsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createClientDto) {
        if (createClientDto.clientType !== client_1.ClientType.PHONE_CALL && !createClientDto.passportNumber) {
            throw new common_1.BadRequestException('Passport number is required for non-phone call clients');
        }
        const { phoneNumbers, employers, ...clientData } = createClientDto;
        return this.prisma.client.create({
            data: {
                ...clientData,
                phoneNumbers: {
                    create: phoneNumbers || [],
                },
                employers: {
                    create: employers || [],
                },
            },
            include: {
                phoneNumbers: true,
                employers: true,
                attachments: true,
                familyMembers: true,
            },
        });
    }
    async findAll(query) {
        const { page = 1, limit = 10, search, status, clientType } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (clientType) {
            where.clientType = clientType;
        }
        if (search) {
            where.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { passportNumber: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [clients, total] = await Promise.all([
            this.prisma.client.findMany({
                where,
                skip,
                take: limit,
                include: {
                    phoneNumbers: true,
                    employers: true,
                    attachments: true,
                    familyMembers: true,
                },
                orderBy: { updatedAt: 'desc' },
            }),
            this.prisma.client.count({ where }),
        ]);
        return {
            data: clients,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const client = await this.prisma.client.findUnique({
            where: { id },
            include: {
                phoneNumbers: true,
                employers: true,
                attachments: true,
                familyMembers: true,
            },
        });
        if (!client) {
            throw new common_1.NotFoundException(`Client with ID ${id} not found`);
        }
        return client;
    }
    async update(id, updateClientDto) {
        if (updateClientDto.clientType !== client_1.ClientType.PHONE_CALL && !updateClientDto.passportNumber) {
            throw new common_1.BadRequestException('Passport number is required for non-phone call clients');
        }
        const { phoneNumbers, employers, ...clientData } = updateClientDto;
        if (phoneNumbers !== undefined) {
            await this.prisma.phoneNumber.deleteMany({
                where: { clientId: id },
            });
        }
        if (employers !== undefined) {
            await this.prisma.employer.deleteMany({
                where: { clientId: id },
            });
        }
        return this.prisma.client.update({
            where: { id },
            data: {
                ...clientData,
                ...(phoneNumbers !== undefined && {
                    phoneNumbers: {
                        create: phoneNumbers,
                    },
                }),
                ...(employers !== undefined && {
                    employers: {
                        create: employers,
                    },
                }),
            },
            include: {
                phoneNumbers: true,
                employers: true,
                attachments: true,
                familyMembers: true,
            },
        });
    }
    async remove(id) {
        const client = await this.findOne(id);
        await this.prisma.client.delete({
            where: { id },
        });
        return { message: 'Client deleted successfully' };
    }
    async addFamilyMember(clientId, createFamilyMemberDto) {
        await this.findOne(clientId);
        return this.prisma.familyMember.create({
            data: {
                ...createFamilyMemberDto,
                clientId,
            },
        });
    }
    async removeFamilyMember(id) {
        const familyMember = await this.prisma.familyMember.findUnique({
            where: { id },
        });
        if (!familyMember) {
            throw new common_1.NotFoundException(`Family member with ID ${id} not found`);
        }
        await this.prisma.familyMember.delete({
            where: { id },
        });
        return { message: 'Family member deleted successfully' };
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClientsService);
//# sourceMappingURL=clients.service.js.map