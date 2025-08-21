import { TransactionType, ExpenseCategory, TransactionStatus } from '@prisma/client';
export declare class CreateTransactionDto {
    caisseId: string;
    type: TransactionType;
    category?: ExpenseCategory;
    amount: number;
    description: string;
    reference?: string;
    status?: TransactionStatus;
    transactionDate?: string;
    paymentId?: string;
}
