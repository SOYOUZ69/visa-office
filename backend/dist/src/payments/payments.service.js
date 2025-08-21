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
const client_1 = require("@prisma/client");
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
                    orderBy: { dueDate: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
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
        const defaultCaisse = await this.getDefaultCaisseForPaymentOption(createPaymentDto.paymentOption);
        return this.prisma.$transaction(async (prisma) => {
            const payment = await prisma.payment.create({
                data: {
                    clientId,
                    totalAmount: createPaymentDto.totalAmount,
                    paymentOption: createPaymentDto.paymentOption,
                    paymentModality: createPaymentDto.paymentModality,
                    transferCode: createPaymentDto.transferCode,
                    caisseId: defaultCaisse?.id,
                    installments: {
                        create: createPaymentDto.installments.map((installment) => ({
                            description: installment.description,
                            percentage: installment.percentage,
                            amount: installment.amount,
                            dueDate: new Date(installment.dueDate),
                            paymentOption: installment.paymentOption,
                            transferCode: installment.transferCode,
                            status: installment.status || 'PENDING',
                        })),
                    },
                },
                include: {
                    installments: {
                        orderBy: { dueDate: 'asc' },
                    },
                },
            });
            if (defaultCaisse) {
                try {
                    const paymentExists = await prisma.payment.findUnique({
                        where: { id: payment.id },
                        select: { id: true },
                    });
                    console.log('Payment exists check:', {
                        paymentId: payment.id,
                        exists: !!paymentExists,
                    });
                    if (paymentExists) {
                        console.log('Creating transaction for payment:', payment.id);
                        await prisma.transaction.create({
                            data: {
                                caisseId: defaultCaisse.id,
                                type: client_1.TransactionType.INCOME,
                                amount: payment.totalAmount,
                                description: `Paiement pour ${client.fullName} - ${payment.paymentModality}`,
                                reference: `Payment ID: ${payment.id}`,
                                status: client_1.TransactionStatus.COMPLETED,
                                paymentId: payment.id,
                                transactionDate: new Date(),
                            },
                        });
                        const caisse = await prisma.caisse.findUnique({
                            where: { id: defaultCaisse.id },
                        });
                        if (caisse) {
                            const newBalance = caisse.balance.plus(Number(payment.totalAmount));
                            await prisma.caisse.update({
                                where: { id: defaultCaisse.id },
                                data: { balance: newBalance },
                            });
                        }
                    }
                }
                catch (error) {
                    console.error('Failed to create transaction for payment:', error);
                    console.error('Payment details:', {
                        paymentId: payment.id,
                        clientId: client.id,
                    });
                }
            }
            return payment;
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
            const client = await prisma.client.findUnique({
                where: { id: existingPayment.clientId },
            });
            if (!client) {
                throw new common_1.NotFoundException(`Client not found for payment ${paymentId}`);
            }
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
                    data: updatePaymentDto.installments.map((installment) => ({
                        paymentId,
                        description: installment.description,
                        percentage: installment.percentage,
                        amount: installment.amount,
                        dueDate: new Date(installment.dueDate),
                        paymentOption: installment.paymentOption,
                        transferCode: installment.transferCode,
                        status: installment.status || 'PENDING',
                    })),
                });
            }
            const newTotalAmount = updatePaymentDto.totalAmount || existingPayment.totalAmount.toNumber();
            const newPaymentOption = updatePaymentDto.paymentOption ||
                existingPayment.paymentOption ||
                undefined;
            const newPaymentModality = updatePaymentDto.paymentModality || existingPayment.paymentModality;
            const existingTransaction = await prisma.transaction.findFirst({
                where: { paymentId },
            });
            if (existingTransaction) {
                const oldAmount = Number(existingTransaction.amount);
                const newAmount = newTotalAmount;
                await prisma.transaction.update({
                    where: { id: existingTransaction.id },
                    data: {
                        amount: newAmount,
                        description: `Paiement pour ${client.fullName} - ${newPaymentModality}`,
                        reference: `Payment ID: ${paymentId}`,
                        transactionDate: new Date(),
                    },
                });
                if (Math.abs(oldAmount - newAmount) > 0.01) {
                    const caisse = await prisma.caisse.findUnique({
                        where: { id: existingTransaction.caisseId },
                    });
                    if (caisse) {
                        const difference = newAmount - oldAmount;
                        const newBalance = caisse.balance.plus(difference);
                        await prisma.caisse.update({
                            where: { id: existingTransaction.caisseId },
                            data: { balance: newBalance },
                        });
                    }
                }
            }
            else {
                const defaultCaisse = await this.getDefaultCaisseForPaymentOption(newPaymentOption);
                if (defaultCaisse) {
                    try {
                        await prisma.transaction.create({
                            data: {
                                caisseId: defaultCaisse.id,
                                type: client_1.TransactionType.INCOME,
                                amount: newTotalAmount,
                                description: `Paiement pour ${client.fullName} - ${newPaymentModality}`,
                                reference: `Payment ID: ${paymentId}`,
                                status: client_1.TransactionStatus.COMPLETED,
                                paymentId: paymentId,
                                transactionDate: new Date(),
                            },
                        });
                        const caisse = await prisma.caisse.findUnique({
                            where: { id: defaultCaisse.id },
                        });
                        if (caisse) {
                            const newBalance = caisse.balance.plus(newTotalAmount);
                            await prisma.caisse.update({
                                where: { id: defaultCaisse.id },
                                data: { balance: newBalance },
                            });
                        }
                    }
                    catch (error) {
                        console.error('Failed to create transaction for payment update:', error);
                    }
                }
            }
            const result = await prisma.payment.findUnique({
                where: { id: paymentId },
                include: {
                    installments: {
                        orderBy: { dueDate: 'asc' },
                    },
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
        return this.prisma.$transaction(async (prisma) => {
            const transactions = await prisma.transaction.findMany({
                where: { paymentId },
                select: { caisseId: true, amount: true },
            });
            await prisma.transaction.deleteMany({
                where: { paymentId },
            });
            for (const transaction of transactions) {
                const caisse = await prisma.caisse.findUnique({
                    where: { id: transaction.caisseId },
                });
                if (caisse) {
                    const newBalance = caisse.balance.minus(Number(transaction.amount));
                    await prisma.caisse.update({
                        where: { id: transaction.caisseId },
                        data: { balance: newBalance },
                    });
                }
            }
            await prisma.payment.delete({
                where: { id: paymentId },
            });
        });
    }
    async updateCaisseBalanceForNewTransaction(caisseId, amount) {
        const caisse = await this.prisma.caisse.findUnique({
            where: { id: caisseId },
        });
        if (!caisse) {
            throw new common_1.NotFoundException(`Caisse with ID ${caisseId} not found`);
        }
        const newBalance = caisse.balance.plus(amount);
        return this.prisma.caisse.update({
            where: { id: caisseId },
            data: { balance: newBalance },
        });
    }
    async verifyPaymentExists(paymentId) {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            select: { id: true },
        });
        return !!payment;
    }
    async updateCaisseBalanceForTransactionChange(caisseId, oldAmount, newAmount) {
        const caisse = await this.prisma.caisse.findUnique({
            where: { id: caisseId },
        });
        if (!caisse) {
            throw new common_1.NotFoundException(`Caisse with ID ${caisseId} not found`);
        }
        const difference = newAmount - oldAmount;
        const newBalance = caisse.balance.plus(difference);
        return this.prisma.caisse.update({
            where: { id: caisseId },
            data: { balance: newBalance },
        });
    }
    async getDefaultCaisseForPaymentOption(paymentOption) {
        let caisseType;
        switch (paymentOption) {
            case 'CASH':
                caisseType = 'CASH';
                break;
            case 'BANK_TRANSFER':
                caisseType = 'BANK_ACCOUNT';
                break;
            case 'CHEQUE':
                caisseType = 'BANK_ACCOUNT';
                break;
            case 'POST':
                caisseType = 'VIRTUAL';
                break;
            default:
                caisseType = 'VIRTUAL';
        }
        return this.prisma.caisse.findFirst({
            where: {
                type: caisseType,
                isActive: true,
            },
        });
    }
    async createTransactionForPayment(payment, client, caisseId) {
        const transactionData = {
            caisseId,
            type: client_1.TransactionType.INCOME,
            amount: payment.totalAmount,
            description: `Paiement pour ${client.fullName} - ${payment.paymentModality}`,
            reference: `Payment ID: ${payment.id}`,
            status: client_1.TransactionStatus.COMPLETED,
            paymentId: payment.id,
            transactionDate: new Date(),
        };
        return this.prisma.transaction.create({
            data: transactionData,
        });
    }
    async markInstallmentAsPaid(installmentId, caisseId) {
        const installment = await this.prisma.paymentInstallment.findUnique({
            where: { id: installmentId },
            include: {
                payment: {
                    include: {
                        client: true,
                    },
                },
            },
        });
        if (!installment) {
            throw new common_1.NotFoundException(`Installment with ID ${installmentId} not found`);
        }
        if (installment.status === 'PAID') {
            throw new common_1.BadRequestException('Installment is already paid');
        }
        const targetCaisseId = caisseId ||
            (await this.getDefaultCaisseForPaymentOption(installment.paymentOption || 'CASH'))?.id;
        if (!targetCaisseId) {
            throw new common_1.BadRequestException('No suitable caisse found for this payment');
        }
        return this.prisma.$transaction(async (prisma) => {
            const updatedInstallment = await prisma.paymentInstallment.update({
                where: { id: installmentId },
                data: { status: 'PAID' },
            });
            const transactionData = {
                caisseId: targetCaisseId,
                type: client_1.TransactionType.INCOME,
                amount: installment.amount,
                description: `Paiement d'échéance: ${installment.description} - ${installment.payment.client.fullName}`,
                reference: `Installment ID: ${installment.id}`,
                status: client_1.TransactionStatus.COMPLETED,
                paymentId: installment.paymentId,
                transactionDate: new Date(),
            };
            try {
                await prisma.transaction.create({
                    data: transactionData,
                });
                const caisse = await prisma.caisse.findUnique({
                    where: { id: targetCaisseId },
                });
                if (caisse) {
                    const newBalance = caisse.balance.plus(Number(installment.amount));
                    await prisma.caisse.update({
                        where: { id: targetCaisseId },
                        data: { balance: newBalance },
                    });
                }
            }
            catch (error) {
                console.error('Failed to create transaction for installment:', error);
            }
            return updatedInstallment;
        });
    }
    async getPaymentStatistics() {
        const totalPayments = await this.prisma.payment.count();
        const totalAmount = await this.prisma.payment.aggregate({
            _sum: {
                totalAmount: true,
            },
        });
        const pendingInstallments = await this.prisma.paymentInstallment.count({
            where: { status: 'PENDING' },
        });
        const paidInstallments = await this.prisma.paymentInstallment.count({
            where: { status: 'PAID' },
        });
        return {
            totalPayments,
            totalAmount: totalAmount._sum.totalAmount || 0,
            pendingInstallments,
            paidInstallments,
            completionRate: totalPayments > 0
                ? (paidInstallments / (paidInstallments + pendingInstallments)) * 100
                : 0,
        };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map