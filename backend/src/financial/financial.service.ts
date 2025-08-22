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

    // Create the transaction with PENDING status
    const transaction = await this.prisma.transaction.create({
      data: {
        ...transactionData,
        caisseId,
        amount,
        type,
        status: TransactionStatus.PENDING, // Always start as pending
      },
    });

    // Don't update caisse balance until approved
    return transaction;
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

  // Transaction Approval Methods
  async getPendingTransactions() {
    return this.prisma.transaction.findMany({
      where: { status: TransactionStatus.PENDING },
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

  async approveTransaction(transactionId: string, approvedBy: string) {
    return this.prisma.$transaction(async (prisma) => {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { caisse: true },
      });

      if (!transaction) {
        throw new NotFoundException(
          `Transaction with ID ${transactionId} not found`,
        );
      }

      if (transaction.status !== TransactionStatus.PENDING) {
        throw new BadRequestException('Transaction is not pending approval');
      }

      // Update transaction status to approved
      const updatedTransaction = await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: TransactionStatus.APPROVED,
          approvedBy,
          approvedAt: new Date(),
        },
      });

      // Update caisse balance only for approved transactions
      if (transaction.type === TransactionType.INCOME) {
        const newBalance = transaction.caisse.balance.plus(
          Number(transaction.amount),
        );
        await prisma.caisse.update({
          where: { id: transaction.caisseId },
          data: { balance: newBalance },
        });
      } else if (transaction.type === TransactionType.EXPENSE) {
        const newBalance = transaction.caisse.balance.minus(
          Number(transaction.amount),
        );
        await prisma.caisse.update({
          where: { id: transaction.caisseId },
          data: { balance: newBalance },
        });
      }

      return updatedTransaction;
    });
  }

  async rejectTransaction(
    transactionId: string,
    approvedBy: string,
    rejectionReason: string,
  ) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException(
        `Transaction with ID ${transactionId} not found`,
      );
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('Transaction is not pending approval');
    }

    // Update transaction status to rejected (no balance update)
    return this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: TransactionStatus.REJECTED,
        approvedBy,
        approvedAt: new Date(),
        rejectionReason,
      },
    });
  }

  async getTransactionById(transactionId: string) {
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
      throw new NotFoundException(
        `Transaction with ID ${transactionId} not found`,
      );
    }

    return transaction;
  }

  // Update financial report generation to only include approved transactions
  async generateFinancialReport(startDate: Date, endDate: Date) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        transactionDate: {
          gte: startDate,
          lte: endDate,
        },
        status: TransactionStatus.APPROVED, // Only approved transactions
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

  // Get financial statistics (only approved transactions for calculations)
  async getFinancialStatistics(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = startDate;
      if (endDate) where.transactionDate.lte = endDate;
    }

    // Get all transactions for display
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

    // Get only approved transactions for calculations
    const approvedTransactions = allTransactions.filter(
      (t) => t.status === TransactionStatus.APPROVED,
    );

    // Calculate revenue and expenses from approved transactions only
    const revenue = approvedTransactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = approvedTransactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Get transaction counts by status
    const pendingCount = allTransactions.filter(
      (t) => t.status === TransactionStatus.PENDING,
    ).length;
    const approvedCount = allTransactions.filter(
      (t) => t.status === TransactionStatus.APPROVED,
    ).length;
    const rejectedCount = allTransactions.filter(
      (t) => t.status === TransactionStatus.REJECTED,
    ).length;

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
      transactions: allTransactions, // All transactions for display
    };
  }
}
