import { PaymentOption, InstallmentStatus } from '@prisma/client';
export declare class CreatePaymentInstallmentDto {
    description: string;
    percentage: number;
    amount: number;
    dueDate: string;
    paymentOption?: PaymentOption;
    transferCode?: string;
    status?: InstallmentStatus;
}
