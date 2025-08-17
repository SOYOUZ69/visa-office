import { PaymentOption, PaymentModality } from '@prisma/client';
export declare class PaymentInstallmentResponseDto {
    id: string;
    description: string;
    percentage: string;
    amount: string;
    dueDate: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare class PaymentResponseDto {
    id: string;
    clientId: string;
    totalAmount: string;
    paymentOption: PaymentOption;
    paymentModality: PaymentModality;
    transferCode?: string;
    installments: PaymentInstallmentResponseDto[];
    createdAt: Date;
    updatedAt: Date;
}
