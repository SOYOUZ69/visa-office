import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment, PaymentInstallment } from '@prisma/client';
export declare class PaymentsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDossierPayments(dossierId: string): Promise<(Payment & {
        installments: PaymentInstallment[];
    })[]>;
    getClientPayments(clientId: string): Promise<(Payment & {
        installments: PaymentInstallment[];
    })[]>;
    createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment & {
        installments: PaymentInstallment[];
    }>;
    updatePayment(paymentId: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment & {
        installments: PaymentInstallment[];
    }>;
    deletePayment(paymentId: string): Promise<void>;
}
