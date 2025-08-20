import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment, PaymentInstallment } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async getDossierPayments(dossierId: string): Promise<(Payment & { installments: PaymentInstallment[] })[]> {
    // Verify dossier exists
    const dossier = await this.prisma.dossier.findUnique({
      where: { id: dossierId },
      include: { client: true },
    });

    if (!dossier) {
      throw new NotFoundException(`Dossier with ID ${dossierId} not found`);
    }

    return this.prisma.payment.findMany({
      where: { dossierId },
      include: {
        installments: {
          orderBy: { dueDate: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getClientPayments(clientId: string): Promise<(Payment & { installments: PaymentInstallment[] })[]> {
    // Verify client exists
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        dossiers: {
          include: {
            payments: {
              include: {
                installments: true,
              },
            },
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    // Flatten all payments from all dossiers
    const allPayments = client.dossiers.flatMap(dossier => dossier.payments);
    return allPayments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createPayment(
    createPaymentDto: CreatePaymentDto,
  ): Promise<Payment & { installments: PaymentInstallment[] }> {
    // Verify dossier exists
    const dossier = await this.prisma.dossier.findUnique({
      where: { id: createPaymentDto.dossierId },
      include: { client: true },
    });

    if (!dossier) {
      throw new NotFoundException(`Dossier with ID ${createPaymentDto.dossierId} not found`);
    }

    // Validate that percentages sum to 100%
    const totalPercentage = createPaymentDto.installments.reduce(
      (sum, installment) => sum + installment.percentage,
      0
    );

    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new BadRequestException(
        `Installment percentages must sum to 100%. Current total: ${totalPercentage}%`
      );
    }

    // Validate that amounts match percentages
    for (const installment of createPaymentDto.installments) {
      const expectedAmount = (createPaymentDto.totalAmount * installment.percentage) / 100;
      if (Math.abs(installment.amount - expectedAmount) > 0.01) {
        throw new BadRequestException(
          `Installment amount ${installment.amount} does not match expected amount ${expectedAmount.toFixed(2)} for ${installment.percentage}%`
        );
      }
    }

    return this.prisma.payment.create({
      data: {
        dossierId: createPaymentDto.dossierId,
        totalAmount: createPaymentDto.totalAmount,
        paymentOption: createPaymentDto.paymentOption,
        paymentModality: createPaymentDto.paymentModality,
        transferCode: createPaymentDto.transferCode,
        installments: {
          create: createPaymentDto.installments.map(installment => ({
            description: installment.description,
            percentage: installment.percentage,
            amount: installment.amount,
            dueDate: new Date(installment.dueDate),
            paymentOption: installment.paymentOption,
            transferCode: installment.transferCode,
            status: installment.status || 'PENDING',
          })),
        },
      },
      include: {
        installments: {
          orderBy: { dueDate: 'asc' }
        }
      },
    });
  }

  async updatePayment(
    paymentId: string,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment & { installments: PaymentInstallment[] }> {
    // Verify payment exists
    const existingPayment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { installments: true },
    });

    if (!existingPayment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    // If installments are being updated, validate percentages
    if (updatePaymentDto.installments) {
      const totalPercentage = updatePaymentDto.installments.reduce(
        (sum, installment) => sum + installment.percentage,
        0
      );

      if (Math.abs(totalPercentage - 100) > 0.01) {
        throw new BadRequestException(
          `Installment percentages must sum to 100%. Current total: ${totalPercentage}%`
        );
      }

      const totalAmount = updatePaymentDto.totalAmount || existingPayment.totalAmount.toNumber();

      // Validate that amounts match percentages
      for (const installment of updatePaymentDto.installments) {
        const expectedAmount = (totalAmount * installment.percentage) / 100;
        if (Math.abs(installment.amount - expectedAmount) > 0.01) {
          throw new BadRequestException(
            `Installment amount ${installment.amount} does not match expected amount ${expectedAmount.toFixed(2)} for ${installment.percentage}%`
          );
        }
      }
    }

    return this.prisma.$transaction(async (prisma) => {
      // Update payment
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          totalAmount: updatePaymentDto.totalAmount,
          paymentOption: updatePaymentDto.paymentOption,
          paymentModality: updatePaymentDto.paymentModality,
          transferCode: updatePaymentDto.transferCode,
        },
      });

      // If installments are being updated, replace them
      if (updatePaymentDto.installments) {
        // Delete existing installments
        await prisma.paymentInstallment.deleteMany({
          where: { paymentId },
        });

        // Create new installments
        await prisma.paymentInstallment.createMany({
          data: updatePaymentDto.installments.map(installment => ({
            paymentId,
            description: installment.description,
            percentage: installment.percentage,
            amount: installment.amount,
            dueDate: new Date(installment.dueDate),
            paymentOption: installment.paymentOption,
            transferCode: installment.transferCode,
            status: installment.status || 'PENDING',
          })),
        });
      }

      // Return updated payment with installments
      const result = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          installments: {
            orderBy: { dueDate: 'asc' }
          }
        },
      });

      if (!result) {
        throw new NotFoundException(`Payment with ID ${paymentId} not found after update`);
      }

      return result;
    });
  }

  async deletePayment(paymentId: string): Promise<void> {
    // Verify payment exists
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    await this.prisma.payment.delete({
      where: { id: paymentId },
    });
  }
}
