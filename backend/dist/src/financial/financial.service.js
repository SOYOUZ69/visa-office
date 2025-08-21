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
        return this.prisma.$transaction(async (prisma) => {
            const transaction = await prisma.transaction.create({
                data: {
                    ...transactionData,
                    caisseId,
                    amount,
                    type,
                },
            });
            await this.updateCaisseBalance(caisseId, amount, type);
            return transaction;
        });
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
    async generateFinancialReport(startDate, endDate) {
        const transactions = await this.prisma.transaction.findMany({
            where: {
                transactionDate: {
                    gte: startDate,
                    lte: endDate,
                },
                status: client_1.TransactionStatus.COMPLETED,
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
};
exports.FinancialService = FinancialService;
exports.FinancialService = FinancialService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinancialService);
//# sourceMappingURL=financial.service.js.map