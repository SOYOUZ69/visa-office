import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import {
  Payment,
  PaymentInstallment,
  TransactionType,
  TransactionStatus,
} from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async getClientPayments(
    clientId: string,
  ): Promise<(Payment & { installments: PaymentInstallment[] })[]> {
    // Verify client exists
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    return this.prisma.payment.findMany({
      where: { clientId },
      include: {
        installments: {
          orderBy: { dueDate: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPayment(
    clientId: string,
    createPaymentDto: CreatePaymentDto,
  ): Promise<Payment & { installments: PaymentInstallment[] }> {
    // Verify client exists
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    // Get unprocessed services for this client
    const unprocessedServices = await this.prisma.serviceItem.findMany({
      where: {
        clientId,
        isProcessed: false,
      },
    });

    if (unprocessedServices.length === 0) {
      throw new BadRequestException(
        'No unprocessed services found for this client',
      );
    }

    // Calculate total amount from unprocessed services
    const calculatedTotal = unprocessedServices.reduce(
      (sum, service) => sum + Number(service.unitPrice) * service.quantity,
      0,
    );

    // Use the calculated total if no total amount is provided
    const totalAmount = createPaymentDto.totalAmount || calculatedTotal;

    // Validate that percentages sum to 100%
    const totalPercentage = createPaymentDto.installments.reduce(
      (sum, installment) => sum + installment.percentage,
      0,
    );

    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new BadRequestException(
        `Installment percentages must sum to 100%. Current total: ${totalPercentage}%`,
      );
    }

    // Validate that amounts match percentages
    for (const installment of createPaymentDto.installments) {
      const expectedAmount = (totalAmount * installment.percentage) / 100;
      if (Math.abs(installment.amount - expectedAmount) > 0.01) {
        throw new BadRequestException(
          `Installment amount ${installment.amount} does not match expected amount ${expectedAmount.toFixed(2)} for ${installment.percentage}%`,
        );
      }
    }

    // Get default caisse for the payment option
    const defaultCaisse = await this.getDefaultCaisseForPaymentOption(
      createPaymentDto.paymentOption,
    );

    return this.prisma.$transaction(async (prisma) => {
      // Create the payment
      const payment = await prisma.payment.create({
        data: {
          clientId,
          totalAmount,
          paymentOption: createPaymentDto.paymentOption,
          paymentModality: createPaymentDto.paymentModality,
          transferCode: createPaymentDto.transferCode,
          caisseId: defaultCaisse?.id, // Assign default caisse
          installments: {
            create: createPaymentDto.installments.map((installment) => ({
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
            orderBy: { dueDate: 'asc' },
          },
        },
      });

      // Mark all unprocessed services as processed and link them to this payment
      await prisma.serviceItem.updateMany({
        where: {
          clientId,
          isProcessed: false,
        },
        data: {
          isProcessed: true,
          paymentId: payment.id,
        },
      });

      // Create transaction for the payment (within the same transaction)
      if (defaultCaisse) {
        try {
          // Verify payment exists before creating transaction
          const paymentExists = await prisma.payment.findUnique({
            where: { id: payment.id },
            select: { id: true },
          });

          console.log('Payment exists check:', {
            paymentId: payment.id,
            exists: !!paymentExists,
          });

          if (paymentExists) {
            console.log('Creating transaction for payment:', payment.id);
            await prisma.transaction.create({
              data: {
                caisseId: defaultCaisse.id,
                type: TransactionType.INCOME,
                amount: payment.totalAmount,
                description: `Paiement pour ${client.fullName} - ${payment.paymentModality}`,
                reference: `Payment ID: ${payment.id}`,
                status: TransactionStatus.PENDING,
                paymentId: payment.id,
                transactionDate: new Date(),
              },
            });

            // Don't update caisse balance until transaction is approved
            // Balance will be updated when transaction is approved
          }
        } catch (error) {
          // If transaction creation fails, we should still return the payment
          // but log the error for debugging
          console.error('Failed to create transaction for payment:', error);
          console.error('Payment details:', {
            paymentId: payment.id,
            clientId: client.id,
          });
          // Don't throw here as the payment was created successfully
        }
      }

      return payment;
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
        0,
      );

      if (Math.abs(totalPercentage - 100) > 0.01) {
        throw new BadRequestException(
          `Installment percentages must sum to 100%. Current total: ${totalPercentage}%`,
        );
      }

      const totalAmount =
        updatePaymentDto.totalAmount || existingPayment.totalAmount.toNumber();

      // Validate that amounts match percentages
      for (const installment of updatePaymentDto.installments) {
        const expectedAmount = (totalAmount * installment.percentage) / 100;
        if (Math.abs(installment.amount - expectedAmount) > 0.01) {
          throw new BadRequestException(
            `Installment amount ${installment.amount} does not match expected amount ${expectedAmount.toFixed(2)} for ${installment.percentage}%`,
          );
        }
      }
    }

    return this.prisma.$transaction(async (prisma) => {
      // Get client info for transaction update
      const client = await prisma.client.findUnique({
        where: { id: existingPayment.clientId },
      });

      if (!client) {
        throw new NotFoundException(
          `Client not found for payment ${paymentId}`,
        );
      }

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
          data: updatePaymentDto.installments.map((installment) => ({
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

      // Update or create the corresponding transaction
      const newTotalAmount =
        updatePaymentDto.totalAmount || existingPayment.totalAmount.toNumber();
      const newPaymentOption =
        updatePaymentDto.paymentOption ||
        existingPayment.paymentOption ||
        undefined;
      const newPaymentModality =
        updatePaymentDto.paymentModality || existingPayment.paymentModality;

      // Find existing transaction for this payment
      const existingTransaction = await prisma.transaction.findFirst({
        where: { paymentId },
      });

      if (existingTransaction) {
        // Update existing transaction and adjust caisse balance
        const oldAmount = Number(existingTransaction.amount);
        const newAmount = newTotalAmount;

        await prisma.transaction.update({
          where: { id: existingTransaction.id },
          data: {
            amount: newAmount,
            description: `Paiement pour ${client.fullName} - ${newPaymentModality}`,
            reference: `Payment ID: ${paymentId}`,
            transactionDate: new Date(),
          },
        });

        // Update caisse balance if amount changed
        if (Math.abs(oldAmount - newAmount) > 0.01) {
          const caisse = await prisma.caisse.findUnique({
            where: { id: existingTransaction.caisseId },
          });

          if (caisse) {
            const difference = newAmount - oldAmount;
            const newBalance = caisse.balance.plus(difference);
            await prisma.caisse.update({
              where: { id: existingTransaction.caisseId },
              data: { balance: newBalance },
            });
          }
        }
      } else {
        // Create new transaction if none exists
        const defaultCaisse =
          await this.getDefaultCaisseForPaymentOption(newPaymentOption);
        if (defaultCaisse) {
          try {
            await prisma.transaction.create({
              data: {
                caisseId: defaultCaisse.id,
                type: TransactionType.INCOME,
                amount: newTotalAmount,
                description: `Paiement pour ${client.fullName} - ${newPaymentModality}`,
                reference: `Payment ID: ${paymentId}`,
                status: TransactionStatus.COMPLETED,
                paymentId: paymentId,
                transactionDate: new Date(),
              },
            });

            // Update caisse balance within the same transaction
            const caisse = await prisma.caisse.findUnique({
              where: { id: defaultCaisse.id },
            });

            if (caisse) {
              const newBalance = caisse.balance.plus(newTotalAmount);
              await prisma.caisse.update({
                where: { id: defaultCaisse.id },
                data: { balance: newBalance },
              });
            }
          } catch (error) {
            // If transaction creation fails, we should still return the updated payment
            // but log the error for debugging
            console.error(
              'Failed to create transaction for payment update:',
              error,
            );
            // Don't throw here as the payment was updated successfully
          }
        }
      }

      // Return updated payment with installments
      const result = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          installments: {
            orderBy: { dueDate: 'asc' },
          },
        },
      });

      if (!result) {
        throw new NotFoundException(
          `Payment with ID ${paymentId} not found after update`,
        );
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

    return this.prisma.$transaction(async (prisma) => {
      // Get all transactions for this payment to adjust caisse balances
      const transactions = await prisma.transaction.findMany({
        where: { paymentId },
        select: { caisseId: true, amount: true },
      });

      // Delete associated transactions first
      await prisma.transaction.deleteMany({
        where: { paymentId },
      });

      // Adjust caisse balances for deleted transactions
      for (const transaction of transactions) {
        const caisse = await prisma.caisse.findUnique({
          where: { id: transaction.caisseId },
        });

        if (caisse) {
          const newBalance = caisse.balance.minus(Number(transaction.amount));
          await prisma.caisse.update({
            where: { id: transaction.caisseId },
            data: { balance: newBalance },
          });
        }
      }

      // Delete the payment (this will cascade delete installments)
      await prisma.payment.delete({
        where: { id: paymentId },
      });
    });
  }

  // Helper method to update caisse balance when new transaction is created
  private async updateCaisseBalanceForNewTransaction(
    caisseId: string,
    amount: number,
  ) {
    const caisse = await this.prisma.caisse.findUnique({
      where: { id: caisseId },
    });

    if (!caisse) {
      throw new NotFoundException(`Caisse with ID ${caisseId} not found`);
    }

    // Add the amount to the caisse balance
    const newBalance = caisse.balance.plus(amount);

    return this.prisma.caisse.update({
      where: { id: caisseId },
      data: { balance: newBalance },
    });
  }

  // Helper method to verify payment exists before creating transaction
  private async verifyPaymentExists(paymentId: string): Promise<boolean> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      select: { id: true },
    });
    return !!payment;
  }

  // Helper method to update caisse balance when transaction amount changes
  private async updateCaisseBalanceForTransactionChange(
    caisseId: string,
    oldAmount: number,
    newAmount: number,
  ) {
    const caisse = await this.prisma.caisse.findUnique({
      where: { id: caisseId },
    });

    if (!caisse) {
      throw new NotFoundException(`Caisse with ID ${caisseId} not found`);
    }

    // Calculate the difference and update balance
    const difference = newAmount - oldAmount;
    const newBalance = caisse.balance.plus(difference);

    return this.prisma.caisse.update({
      where: { id: caisseId },
      data: { balance: newBalance },
    });
  }

  // Helper method to get default caisse for payment option
  private async getDefaultCaisseForPaymentOption(
    paymentOption: string | undefined,
  ) {
    let caisseType: 'VIRTUAL' | 'CASH' | 'BANK_ACCOUNT';

    switch (paymentOption) {
      case 'CASH':
        caisseType = 'CASH';
        break;
      case 'BANK_TRANSFER':
        caisseType = 'BANK_ACCOUNT';
        break;
      case 'CHEQUE':
        caisseType = 'BANK_ACCOUNT';
        break;
      case 'POST':
        caisseType = 'VIRTUAL';
        break;
      default:
        caisseType = 'VIRTUAL';
    }

    return this.prisma.caisse.findFirst({
      where: {
        type: caisseType,
        isActive: true,
      },
    });
  }

  // Helper method to create transaction for payment
  private async createTransactionForPayment(
    payment: Payment,
    client: any,
    caisseId: string,
  ) {
    const transactionData = {
      caisseId,
      type: TransactionType.INCOME,
      amount: payment.totalAmount,
      description: `Paiement pour ${client.fullName} - ${payment.paymentModality}`,
      reference: `Payment ID: ${payment.id}`,
      status: TransactionStatus.COMPLETED,
      paymentId: payment.id,
      transactionDate: new Date(),
    };

    return this.prisma.transaction.create({
      data: transactionData,
    });
  }

  // Method to mark installment as paid and create transaction
  async markInstallmentAsPaid(
    installmentId: string,
    caisseId?: string,
  ): Promise<PaymentInstallment> {
    const installment = await this.prisma.paymentInstallment.findUnique({
      where: { id: installmentId },
      include: {
        payment: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!installment) {
      throw new NotFoundException(
        `Installment with ID ${installmentId} not found`,
      );
    }

    if (installment.status === 'PAID') {
      throw new BadRequestException('Installment is already paid');
    }

    // If no caisse specified, get default caisse for payment option
    const targetCaisseId =
      caisseId ||
      (
        await this.getDefaultCaisseForPaymentOption(
          installment.paymentOption || 'CASH',
        )
      )?.id;

    if (!targetCaisseId) {
      throw new BadRequestException(
        'No suitable caisse found for this payment',
      );
    }

    return this.prisma.$transaction(async (prisma) => {
      // Update installment status
      const updatedInstallment = await prisma.paymentInstallment.update({
        where: { id: installmentId },
        data: { status: 'PAID' },
      });

      // Create transaction for the installment
      const transactionData = {
        caisseId: targetCaisseId,
        type: TransactionType.INCOME,
        amount: installment.amount,
        description: `Paiement d'échéance: ${installment.description} - ${installment.payment.client.fullName}`,
        reference: `Installment ID: ${installment.id}`,
        status: TransactionStatus.PENDING,
        paymentId: installment.paymentId,
        transactionDate: new Date(),
      };

      try {
        await prisma.transaction.create({
          data: transactionData,
        });

        // Don't update caisse balance until transaction is approved
        // Balance will be updated when transaction is approved
      } catch (error) {
        // If transaction creation fails, we should still return the updated installment
        // but log the error for debugging
        console.error('Failed to create transaction for installment:', error);
        // Don't throw here as the installment was updated successfully
      }

      return updatedInstallment;
    });
  }

  // Method to get payment statistics
  async getPaymentStatistics() {
    const totalPayments = await this.prisma.payment.count();
    const totalAmount = await this.prisma.payment.aggregate({
      _sum: {
        totalAmount: true,
      },
    });

    const pendingInstallments = await this.prisma.paymentInstallment.count({
      where: { status: 'PENDING' },
    });

    const paidInstallments = await this.prisma.paymentInstallment.count({
      where: { status: 'PAID' },
    });

    return {
      totalPayments,
      totalAmount: totalAmount._sum.totalAmount || 0,
      pendingInstallments,
      paidInstallments,
      completionRate:
        totalPayments > 0
          ? (paidInstallments / (paidInstallments + pendingInstallments)) * 100
          : 0,
    };
  }

  // Method to get unprocessed services for a client
  async getUnprocessedServices(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    const unprocessedServices = await this.prisma.serviceItem.findMany({
      where: {
        clientId,
        isProcessed: false,
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalAmount = unprocessedServices.reduce(
      (sum, service) => sum + Number(service.unitPrice) * service.quantity,
      0,
    );

    return {
      services: unprocessedServices,
      totalAmount,
      serviceCount: unprocessedServices.length,
    };
  }
}
