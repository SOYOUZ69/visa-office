import { FinancialService } from './financial.service';
import { CreateCaisseDto } from './dto/create-caisse.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ApproveTransactionDto } from './dto/approve-transaction.dto';
import { RejectTransactionDto } from './dto/reject-transaction.dto';
export declare class FinancialController {
    private readonly financialService;
    constructor(financialService: FinancialService);
    createCaisse(createCaisseDto: CreateCaisseDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.CaisseType;
        description: string | null;
        balance: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
    }>;
    getAllCaisses(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.CaisseType;
        description: string | null;
        balance: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
    }[]>;
    getCaisseById(id: string): Promise<{
        transactions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.TransactionType;
            description: string;
            status: import("@prisma/client").$Enums.TransactionStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            caisseId: string;
            paymentId: string | null;
            category: import("@prisma/client").$Enums.ExpenseCategory | null;
            reference: string | null;
            approvedBy: string | null;
            approvedAt: Date | null;
            rejectionReason: string | null;
            transactionDate: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.CaisseType;
        description: string | null;
        balance: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
    }>;
    createTransaction(createTransactionDto: CreateTransactionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.TransactionType;
        description: string;
        status: import("@prisma/client").$Enums.TransactionStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        caisseId: string;
        paymentId: string | null;
        category: import("@prisma/client").$Enums.ExpenseCategory | null;
        reference: string | null;
        approvedBy: string | null;
        approvedAt: Date | null;
        rejectionReason: string | null;
        transactionDate: Date;
    }>;
    getTransactions(caisseId?: string, type?: string, status?: string, startDate?: string, endDate?: string): Promise<({
        payment: ({
            client: {
                id: string;
                email: string;
                createdAt: Date;
                updatedAt: Date;
                fullName: string;
                passportNumber: string | null;
                clientType: import("@prisma/client").$Enums.ClientType;
                address: string;
                jobTitle: string | null;
                destination: string;
                visaType: string;
                notes: string | null;
                isMinor: boolean;
                guardianFullName: string | null;
                guardianCIN: string | null;
                guardianRelationship: string | null;
                status: import("@prisma/client").$Enums.ClientStatus;
                assignedEmployeeId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            paymentOption: import("@prisma/client").$Enums.PaymentOption | null;
            paymentModality: import("@prisma/client").$Enums.PaymentModality;
            transferCode: string | null;
            clientId: string;
            caisseId: string | null;
        }) | null;
        caisse: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import("@prisma/client").$Enums.CaisseType;
            description: string | null;
            balance: import("@prisma/client/runtime/library").Decimal;
            isActive: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.TransactionType;
        description: string;
        status: import("@prisma/client").$Enums.TransactionStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        caisseId: string;
        paymentId: string | null;
        category: import("@prisma/client").$Enums.ExpenseCategory | null;
        reference: string | null;
        approvedBy: string | null;
        approvedAt: Date | null;
        rejectionReason: string | null;
        transactionDate: Date;
    })[]>;
    generateFinancialReport(startDate: string, endDate: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        reportDate: Date;
        periodStart: Date;
        periodEnd: Date;
        totalIncome: import("@prisma/client/runtime/library").Decimal;
        totalExpenses: import("@prisma/client/runtime/library").Decimal;
        totalTax: import("@prisma/client/runtime/library").Decimal;
        netProfit: import("@prisma/client/runtime/library").Decimal;
        caisseBalances: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getFinancialReports(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        reportDate: Date;
        periodStart: Date;
        periodEnd: Date;
        totalIncome: import("@prisma/client/runtime/library").Decimal;
        totalExpenses: import("@prisma/client/runtime/library").Decimal;
        totalTax: import("@prisma/client/runtime/library").Decimal;
        netProfit: import("@prisma/client/runtime/library").Decimal;
        caisseBalances: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    getFinancialStatistics(startDate?: string, endDate?: string): Promise<{
        revenue: number;
        expenses: number;
        netProfit: number;
        transactionCounts: {
            total: number;
            pending: number;
            approved: number;
            rejected: number;
        };
        transactions: ({
            payment: ({
                client: {
                    id: string;
                    email: string;
                    createdAt: Date;
                    updatedAt: Date;
                    fullName: string;
                    passportNumber: string | null;
                    clientType: import("@prisma/client").$Enums.ClientType;
                    address: string;
                    jobTitle: string | null;
                    destination: string;
                    visaType: string;
                    notes: string | null;
                    isMinor: boolean;
                    guardianFullName: string | null;
                    guardianCIN: string | null;
                    guardianRelationship: string | null;
                    status: import("@prisma/client").$Enums.ClientStatus;
                    assignedEmployeeId: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                paymentOption: import("@prisma/client").$Enums.PaymentOption | null;
                paymentModality: import("@prisma/client").$Enums.PaymentModality;
                transferCode: string | null;
                clientId: string;
                caisseId: string | null;
            }) | null;
            caisse: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                type: import("@prisma/client").$Enums.CaisseType;
                description: string | null;
                balance: import("@prisma/client/runtime/library").Decimal;
                isActive: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.TransactionType;
            description: string;
            status: import("@prisma/client").$Enums.TransactionStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            caisseId: string;
            paymentId: string | null;
            category: import("@prisma/client").$Enums.ExpenseCategory | null;
            reference: string | null;
            approvedBy: string | null;
            approvedAt: Date | null;
            rejectionReason: string | null;
            transactionDate: Date;
        })[];
    }>;
    calculateTax(amount: string): {
        amount: number;
        tax: number;
        totalWithTax: number;
    };
    getPendingTransactions(): Promise<({
        payment: ({
            client: {
                id: string;
                email: string;
                createdAt: Date;
                updatedAt: Date;
                fullName: string;
                passportNumber: string | null;
                clientType: import("@prisma/client").$Enums.ClientType;
                address: string;
                jobTitle: string | null;
                destination: string;
                visaType: string;
                notes: string | null;
                isMinor: boolean;
                guardianFullName: string | null;
                guardianCIN: string | null;
                guardianRelationship: string | null;
                status: import("@prisma/client").$Enums.ClientStatus;
                assignedEmployeeId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            paymentOption: import("@prisma/client").$Enums.PaymentOption | null;
            paymentModality: import("@prisma/client").$Enums.PaymentModality;
            transferCode: string | null;
            clientId: string;
            caisseId: string | null;
        }) | null;
        caisse: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import("@prisma/client").$Enums.CaisseType;
            description: string | null;
            balance: import("@prisma/client/runtime/library").Decimal;
            isActive: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.TransactionType;
        description: string;
        status: import("@prisma/client").$Enums.TransactionStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        caisseId: string;
        paymentId: string | null;
        category: import("@prisma/client").$Enums.ExpenseCategory | null;
        reference: string | null;
        approvedBy: string | null;
        approvedAt: Date | null;
        rejectionReason: string | null;
        transactionDate: Date;
    })[]>;
    approveTransaction(transactionId: string, approveTransactionDto: ApproveTransactionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.TransactionType;
        description: string;
        status: import("@prisma/client").$Enums.TransactionStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        caisseId: string;
        paymentId: string | null;
        category: import("@prisma/client").$Enums.ExpenseCategory | null;
        reference: string | null;
        approvedBy: string | null;
        approvedAt: Date | null;
        rejectionReason: string | null;
        transactionDate: Date;
    }>;
    rejectTransaction(transactionId: string, rejectTransactionDto: RejectTransactionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.TransactionType;
        description: string;
        status: import("@prisma/client").$Enums.TransactionStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        caisseId: string;
        paymentId: string | null;
        category: import("@prisma/client").$Enums.ExpenseCategory | null;
        reference: string | null;
        approvedBy: string | null;
        approvedAt: Date | null;
        rejectionReason: string | null;
        transactionDate: Date;
    }>;
    getTransactionById(transactionId: string): Promise<{
        payment: ({
            client: {
                id: string;
                email: string;
                createdAt: Date;
                updatedAt: Date;
                fullName: string;
                passportNumber: string | null;
                clientType: import("@prisma/client").$Enums.ClientType;
                address: string;
                jobTitle: string | null;
                destination: string;
                visaType: string;
                notes: string | null;
                isMinor: boolean;
                guardianFullName: string | null;
                guardianCIN: string | null;
                guardianRelationship: string | null;
                status: import("@prisma/client").$Enums.ClientStatus;
                assignedEmployeeId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            paymentOption: import("@prisma/client").$Enums.PaymentOption | null;
            paymentModality: import("@prisma/client").$Enums.PaymentModality;
            transferCode: string | null;
            clientId: string;
            caisseId: string | null;
        }) | null;
        caisse: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import("@prisma/client").$Enums.CaisseType;
            description: string | null;
            balance: import("@prisma/client/runtime/library").Decimal;
            isActive: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.TransactionType;
        description: string;
        status: import("@prisma/client").$Enums.TransactionStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        caisseId: string;
        paymentId: string | null;
        category: import("@prisma/client").$Enums.ExpenseCategory | null;
        reference: string | null;
        approvedBy: string | null;
        approvedAt: Date | null;
        rejectionReason: string | null;
        transactionDate: Date;
    }>;
}
