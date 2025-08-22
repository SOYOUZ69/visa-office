import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Payment, PaymentInstallment } from '@prisma/client';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('api/v1')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('clients/:id/payments')
  @ApiOperation({ summary: 'Get all payments for a client' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  @ApiResponse({
    status: 200,
    description: 'List of payments for the client',
    type: [PaymentResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @Roles(UserRole.ADMIN, UserRole.USER)
  async getClientPayments(
    @Param('id') clientId: string,
  ): Promise<(Payment & { installments: PaymentInstallment[] })[]> {
    return this.paymentsService.getClientPayments(clientId);
  }

  @Post('clients/:id/payment')
  @ApiOperation({ summary: 'Create a payment for a client' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  @ApiResponse({
    status: 201,
    description: 'Payment created successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @Roles(UserRole.ADMIN)
  async createPayment(
    @Param('id') clientId: string,
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<Payment & { installments: PaymentInstallment[] }> {
    return this.paymentsService.createPayment(clientId, createPaymentDto);
  }

  @Patch('payments/:paymentId')
  @ApiOperation({ summary: 'Update a payment' })
  @ApiParam({ name: 'paymentId', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment updated successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @Roles(UserRole.ADMIN)
  async updatePayment(
    @Param('paymentId') paymentId: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment & { installments: PaymentInstallment[] }> {
    return this.paymentsService.updatePayment(paymentId, updatePaymentDto);
  }

  @Delete('payments/:paymentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a payment' })
  @ApiParam({ name: 'paymentId', description: 'Payment ID' })
  @ApiResponse({ status: 204, description: 'Payment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @Roles(UserRole.ADMIN)
  async deletePayment(@Param('paymentId') paymentId: string): Promise<void> {
    return this.paymentsService.deletePayment(paymentId);
  }

  @Post('installments/:installmentId/mark-paid')
  @ApiOperation({
    summary: 'Mark an installment as paid and create transaction',
  })
  @ApiParam({ name: 'installmentId', description: 'Installment ID' })
  @ApiQuery({
    name: 'caisseId',
    description: 'Caisse ID (optional)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Installment marked as paid successfully',
    schema: {
      type: 'object',
      // Define the schema for PaymentInstallment response
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Installment already paid or invalid data',
  })
  @ApiResponse({ status: 404, description: 'Installment not found' })
  @Roles(UserRole.ADMIN)
  async markInstallmentAsPaid(
    @Param('installmentId') installmentId: string,
    @Query('caisseId') caisseId?: string,
  ): Promise<PaymentInstallment> {
    return this.paymentsService.markInstallmentAsPaid(installmentId, caisseId);
  }

  @Get('payments/statistics')
  @ApiOperation({ summary: 'Get payment statistics' })
  @ApiResponse({
    status: 200,
    description: 'Payment statistics',
    schema: {
      type: 'object',
      properties: {
        totalPayments: { type: 'number' },
        totalAmount: { type: 'number' },
        pendingInstallments: { type: 'number' },
        paidInstallments: { type: 'number' },
        completionRate: { type: 'number' },
      },
    },
  })
  @Roles(UserRole.ADMIN, UserRole.USER)
  async getPaymentStatistics() {
    return this.paymentsService.getPaymentStatistics();
  }

  @Get('clients/:id/unprocessed-services')
  @ApiOperation({ summary: 'Get unprocessed services for a client' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  @ApiResponse({
    status: 200,
    description: 'Unprocessed services for the client',
    schema: {
      type: 'object',
      properties: {
        services: { type: 'array' },
        totalAmount: { type: 'number' },
        serviceCount: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @Roles(UserRole.ADMIN, UserRole.USER)
  async getUnprocessedServices(@Param('id') clientId: string) {
    return this.paymentsService.getUnprocessedServices(clientId);
  }
}
