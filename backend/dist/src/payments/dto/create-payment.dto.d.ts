import { PaymentOption, PaymentModality } from '@prisma/client';
import { CreatePaymentInstallmentDto } from './create-payment-installment.dto';
export declare class CreatePaymentDto {
    totalAmount: number;
    paymentOption: PaymentOption;
    paymentModality: PaymentModality;
    transferCode?: string;
    installments: CreatePaymentInstallmentDto[];
}
