import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCaisseDto } from './dto/create-caisse.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CaisseType, TransactionType, TransactionStatus } from '@prisma/client';

@Injectable()
export class FinancialService {
  constructor(private prisma: PrismaService) {}

  // Caisse Management
  async createCaisse(createCaisseDto: CreateCaisseDto) {
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

  async getCaisseById(id: string) {
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
      throw new NotFoundException(`Caisse with ID ${id} not found`);
    }

    return caisse;
  }

  async updateCaisseBalance(id: string, amount: number, type: TransactionType) {
    const caisse = await this.prisma.caisse.findUnique({
      where: { id },
    });

    if (!caisse) {
      throw new NotFoundException(`Caisse with ID ${id} not found`);
    }

    let newBalance = caisse.balance;
    if (type === TransactionType.INCOME) {
      newBalance = newBalance.plus(amount);
    } else if (type === TransactionType.EXPENSE) {
      newBalance = newBalance.minus(amount);
    }

    return this.prisma.caisse.update({
      where: { id },
      data: { balance: newBalance },
    });
  }

  // Transaction Management
  async createTransaction(createTransactionDto: CreateTransactionDto) {
    const { caisseId, amount, type, ...transactionData } = createTransactionDto;

    // Start a transaction to ensure data consistency
    return this.prisma.$transaction(async (prisma) => {
      // Create the transaction
      const transaction = await prisma.transaction.create({
        data: {
          ...transactionData,
          caisseId,
          amount,
          type,
        },
      });

      // Update caisse balance
      await this.updateCaisseBalance(caisseId, amount, type);

      return transaction;
    });
  }

  async getTransactions(filters?: {
    caisseId?: string;
    type?: TransactionType;
    status?: TransactionStatus;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};

    if (filters?.caisseId) where.caisseId = filters.caisseId;
    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;
    if (filters?.startDate || filters?.endDate) {
      where.transactionDate = {};
      if (filters?.startDate) where.transactionDate.gte = filters.startDate;
      if (filters?.endDate) where.transactionDate.lte = filters.endDate;
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

  // Financial Reports
  async generateFinancialReport(startDate: Date, endDate: Date) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        transactionDate: {
          gte: startDate,
          lte: endDate,
        },
        status: TransactionStatus.COMPLETED,
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

    // Calculate totals
    const totalIncome = transactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Calculate tax (19% of income)
    const totalTax = totalIncome * 0.19;

    // Calculate net profit
    const netProfit = totalIncome - totalExpenses - totalTax;

    // Get caisse balances
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

    // Create financial report
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

  // Tax calculation for clients
  calculateTaxForClient(serviceTotal: number): number {
    return serviceTotal * 0.19; // 19% tax
  }

  // Profit calculation for a client
  calculateProfitForClient(serviceTotal: number, expenses: number): number {
    const tax = this.calculateTaxForClient(serviceTotal);
    return serviceTotal - tax - expenses;
  }
}
