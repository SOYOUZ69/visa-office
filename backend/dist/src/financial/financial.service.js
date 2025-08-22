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
exports.FinancialService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let FinancialService = class FinancialService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCaisse(createCaisseDto) {
        return this.prisma.caisse.create({
            data: createCaisseDto,
        });
    }
    async getAllCaisses() {
        return this.prisma.caisse.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'asc' },
        });
    }
    async getCaisseById(id) {
        const caisse = await this.prisma.caisse.findUnique({
            where: { id },
            include: {
                transactions: {
                    orderBy: { transactionDate: 'desc' },
                    take: 10,
                },
            },
        });
        if (!caisse) {
            throw new common_1.NotFoundException(`Caisse with ID ${id} not found`);
        }
        return caisse;
    }
    async updateCaisseBalance(id, amount, type) {
        const caisse = await this.prisma.caisse.findUnique({
            where: { id },
        });
        if (!caisse) {
            throw new common_1.NotFoundException(`Caisse with ID ${id} not found`);
        }
        let newBalance = caisse.balance;
        if (type === client_1.TransactionType.INCOME) {
            newBalance = newBalance.plus(amount);
        }
        else if (type === client_1.TransactionType.EXPENSE) {
            newBalance = newBalance.minus(amount);
        }
        return this.prisma.caisse.update({
            where: { id },
            data: { balance: newBalance },
        });
    }
    async createTransaction(createTransactionDto) {
        const { caisseId, amount, type, ...transactionData } = createTransactionDto;
        const transaction = await this.prisma.transaction.create({
            data: {
                ...transactionData,
                caisseId,
                amount,
                type,
                status: client_1.TransactionStatus.PENDING,
            },
        });
        return transaction;
    }
    async getTransactions(filters) {
        const where = {};
        if (filters?.caisseId)
            where.caisseId = filters.caisseId;
        if (filters?.type)
            where.type = filters.type;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.startDate || filters?.endDate) {
            where.transactionDate = {};
            if (filters?.startDate)
                where.transactionDate.gte = filters.startDate;
            if (filters?.endDate)
                where.transactionDate.lte = filters.endDate;
        }
        return this.prisma.transaction.findMany({
            where,
            include: {
                caisse: true,
                payment: {
                    include: {
                        client: true,
                    },
                },
            },
            orderBy: { transactionDate: 'desc' },
        });
    }
    async getFinancialReports() {
        return this.prisma.financialReport.findMany({
            orderBy: { reportDate: 'desc' },
        });
    }
    calculateTaxForClient(serviceTotal) {
        return serviceTotal * 0.19;
    }
    calculateProfitForClient(serviceTotal, expenses) {
        const tax = this.calculateTaxForClient(serviceTotal);
        return serviceTotal - tax - expenses;
    }
    async getPendingTransactions() {
        return this.prisma.transaction.findMany({
            where: { status: client_1.TransactionStatus.PENDING },
            include: {
                caisse: true,
                payment: {
                    include: {
                        client: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async approveTransaction(transactionId, approvedBy) {
        return this.prisma.$transaction(async (prisma) => {
            const transaction = await prisma.transaction.findUnique({
                where: { id: transactionId },
                include: { caisse: true },
            });
            if (!transaction) {
                throw new common_1.NotFoundException(`Transaction with ID ${transactionId} not found`);
            }
            if (transaction.status !== client_1.TransactionStatus.PENDING) {
                throw new common_1.BadRequestException('Transaction is not pending approval');
            }
            const updatedTransaction = await prisma.transaction.update({
                where: { id: transactionId },
                data: {
                    status: client_1.TransactionStatus.APPROVED,
                    approvedBy,
                    approvedAt: new Date(),
                },
            });
            if (transaction.type === client_1.TransactionType.INCOME) {
                const newBalance = transaction.caisse.balance.plus(Number(transaction.amount));
                await prisma.caisse.update({
                    where: { id: transaction.caisseId },
                    data: { balance: newBalance },
                });
            }
            else if (transaction.type === client_1.TransactionType.EXPENSE) {
                const newBalance = transaction.caisse.balance.minus(Number(transaction.amount));
                await prisma.caisse.update({
                    where: { id: transaction.caisseId },
                    data: { balance: newBalance },
                });
            }
            return updatedTransaction;
        });
    }
    async rejectTransaction(transactionId, approvedBy, rejectionReason) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id: transactionId },
        });
        if (!transaction) {
            throw new common_1.NotFoundException(`Transaction with ID ${transactionId} not found`);
        }
        if (transaction.status !== client_1.TransactionStatus.PENDING) {
            throw new common_1.BadRequestException('Transaction is not pending approval');
        }
        return this.prisma.transaction.update({
            where: { id: transactionId },
            data: {
                status: client_1.TransactionStatus.REJECTED,
                approvedBy,
                approvedAt: new Date(),
                rejectionReason,
            },
        });
    }
    async getTransactionById(transactionId) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id: transactionId },
            include: {
                caisse: true,
                payment: {
                    include: {
                        client: true,
                    },
                },
            },
        });
        if (!transaction) {
            throw new common_1.NotFoundException(`Transaction with ID ${transactionId} not found`);
        }
        return transaction;
    }
    async generateFinancialReport(startDate, endDate) {
        const transactions = await this.prisma.transaction.findMany({
            where: {
                transactionDate: {
                    gte: startDate,
                    lte: endDate,
                },
                status: client_1.TransactionStatus.APPROVED,
            },
            include: {
                caisse: true,
                payment: {
                    include: {
                        client: true,
                    },
                },
            },
        });
        const totalIncome = transactions
            .filter((t) => t.type === client_1.TransactionType.INCOME)
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const totalExpenses = transactions
            .filter((t) => t.type === client_1.TransactionType.EXPENSE)
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const totalTax = totalIncome * 0.19;
        const netProfit = totalIncome - totalExpenses - totalTax;
        const caisses = await this.prisma.caisse.findMany({
            where: { isActive: true },
        });
        const caisseBalances = caisses.reduce((acc, caisse) => {
            acc[caisse.id] = {
                name: caisse.name,
                type: caisse.type,
                balance: caisse.balance,
            };
            return acc;
        }, {});
        return this.prisma.financialReport.create({
            data: {
                periodStart: startDate,
                periodEnd: endDate,
                totalIncome,
                totalExpenses,
                totalTax,
                netProfit,
                caisseBalances,
            },
        });
    }
    async getFinancialStatistics(startDate, endDate) {
        const where = {};
        if (startDate || endDate) {
            where.transactionDate = {};
            if (startDate)
                where.transactionDate.gte = startDate;
            if (endDate)
                where.transactionDate.lte = endDate;
        }
        const allTransactions = await this.prisma.transaction.findMany({
            where,
            include: {
                caisse: true,
                payment: {
                    include: {
                        client: true,
                    },
                },
            },
            orderBy: { transactionDate: 'desc' },
        });
        const approvedTransactions = allTransactions.filter((t) => t.status === client_1.TransactionStatus.APPROVED);
        const revenue = approvedTransactions
            .filter((t) => t.type === client_1.TransactionType.INCOME)
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const expenses = approvedTransactions
            .filter((t) => t.type === client_1.TransactionType.EXPENSE)
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const pendingCount = allTransactions.filter((t) => t.status === client_1.TransactionStatus.PENDING).length;
        const approvedCount = allTransactions.filter((t) => t.status === client_1.TransactionStatus.APPROVED).length;
        const rejectedCount = allTransactions.filter((t) => t.status === client_1.TransactionStatus.REJECTED).length;
        return {
            revenue: Number(revenue.toFixed(2)),
            expenses: Number(expenses.toFixed(2)),
            netProfit: Number((revenue - expenses).toFixed(2)),
            transactionCounts: {
                total: allTransactions.length,
                pending: pendingCount,
                approved: approvedCount,
                rejected: rejectedCount,
            },
            transactions: allTransactions,
        };
    }
};
exports.FinancialService = FinancialService;
exports.FinancialService = FinancialService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinancialService);
//# sourceMappingURL=financial.service.js.map