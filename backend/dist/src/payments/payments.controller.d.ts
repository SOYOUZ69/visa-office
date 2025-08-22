import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment, PaymentInstallment } from '@prisma/client';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    getClientPayments(clientId: string): Promise<(Payment & {
        installments: PaymentInstallment[];
    })[]>;
    createPayment(clientId: string, createPaymentDto: CreatePaymentDto): Promise<Payment & {
        installments: PaymentInstallment[];
    }>;
    updatePayment(paymentId: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment & {
        installments: PaymentInstallment[];
    }>;
    deletePayment(paymentId: string): Promise<void>;
    markInstallmentAsPaid(installmentId: string, caisseId?: string): Promise<PaymentInstallment>;
    getPaymentStatistics(): Promise<{
        totalPayments: number;
        totalAmount: number | import("@prisma/client/runtime/library").Decimal;
        pendingInstallments: number;
        paidInstallments: number;
        completionRate: number;
    }>;
    getUnprocessedServices(clientId: string): Promise<{
        services: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            serviceType: import("@prisma/client").$Enums.ServiceType;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            clientId: string;
            isProcessed: boolean;
            paymentId: string | null;
        }[];
        totalAmount: number;
        serviceCount: number;
    }>;
}
