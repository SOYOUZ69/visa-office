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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentsService = class PaymentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getClientPayments(clientId) {
        const client = await this.prisma.client.findUnique({
            where: { id: clientId },
        });
        if (!client) {
            throw new common_1.NotFoundException(`Client with ID ${clientId} not found`);
        }
        return this.prisma.payment.findMany({
            where: { clientId },
            include: {
                installments: {
                    orderBy: { dueDate: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async createPayment(clientId, createPaymentDto) {
        const client = await this.prisma.client.findUnique({
            where: { id: clientId },
        });
        if (!client) {
            throw new common_1.NotFoundException(`Client with ID ${clientId} not found`);
        }
        const totalPercentage = createPaymentDto.installments.reduce((sum, installment) => sum + installment.percentage, 0);
        if (Math.abs(totalPercentage - 100) > 0.01) {
            throw new common_1.BadRequestException(`Installment percentages must sum to 100%. Current total: ${totalPercentage}%`);
        }
        for (const installment of createPaymentDto.installments) {
            const expectedAmount = (createPaymentDto.totalAmount * installment.percentage) / 100;
            if (Math.abs(installment.amount - expectedAmount) > 0.01) {
                throw new common_1.BadRequestException(`Installment amount ${installment.amount} does not match expected amount ${expectedAmount.toFixed(2)} for ${installment.percentage}%`);
            }
        }
        return this.prisma.payment.create({
            data: {
                clientId,
                totalAmount: createPaymentDto.totalAmount,
                paymentOption: createPaymentDto.paymentOption,
                paymentModality: createPaymentDto.paymentModality,
                transferCode: createPaymentDto.transferCode,
                installments: {
                    create: createPaymentDto.installments.map(installment => ({
                        description: installment.description,
                        percentage: installment.percentage,
                        amount: installment.amount,
                        dueDate: new Date(installment.dueDate),
                    })),
                },
            },
            include: {
                installments: {
                    orderBy: { dueDate: 'asc' }
                }
            },
        });
    }
    async updatePayment(paymentId, updatePaymentDto) {
        const existingPayment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: { installments: true },
        });
        if (!existingPayment) {
            throw new common_1.NotFoundException(`Payment with ID ${paymentId} not found`);
        }
        if (updatePaymentDto.installments) {
            const totalPercentage = updatePaymentDto.installments.reduce((sum, installment) => sum + installment.percentage, 0);
            if (Math.abs(totalPercentage - 100) > 0.01) {
                throw new common_1.BadRequestException(`Installment percentages must sum to 100%. Current total: ${totalPercentage}%`);
            }
            const totalAmount = updatePaymentDto.totalAmount || existingPayment.totalAmount.toNumber();
            for (const installment of updatePaymentDto.installments) {
                const expectedAmount = (totalAmount * installment.percentage) / 100;
                if (Math.abs(installment.amount - expectedAmount) > 0.01) {
                    throw new common_1.BadRequestException(`Installment amount ${installment.amount} does not match expected amount ${expectedAmount.toFixed(2)} for ${installment.percentage}%`);
                }
            }
        }
        return this.prisma.$transaction(async (prisma) => {
            const updatedPayment = await prisma.payment.update({
                where: { id: paymentId },
                data: {
                    totalAmount: updatePaymentDto.totalAmount,
                    paymentOption: updatePaymentDto.paymentOption,
                    paymentModality: updatePaymentDto.paymentModality,
                    transferCode: updatePaymentDto.transferCode,
                },
            });
            if (updatePaymentDto.installments) {
                await prisma.paymentInstallment.deleteMany({
                    where: { paymentId },
                });
                await prisma.paymentInstallment.createMany({
                    data: updatePaymentDto.installments.map(installment => ({
                        paymentId,
                        description: installment.description,
                        percentage: installment.percentage,
                        amount: installment.amount,
                        dueDate: new Date(installment.dueDate),
                    })),
                });
            }
            const result = await prisma.payment.findUnique({
                where: { id: paymentId },
                include: {
                    installments: {
                        orderBy: { dueDate: 'asc' }
                    }
                },
            });
            if (!result) {
                throw new common_1.NotFoundException(`Payment with ID ${paymentId} not found after update`);
            }
            return result;
        });
    }
    async deletePayment(paymentId) {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
        });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with ID ${paymentId} not found`);
        }
        await this.prisma.payment.delete({
            where: { id: paymentId },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map