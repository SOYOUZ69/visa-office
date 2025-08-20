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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
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
  async getClientPayments(@Param('id') clientId: string): Promise<(Payment & { installments: PaymentInstallment[] })[]> {
    return this.paymentsService.getClientPayments(clientId);
  }

  @Post('payments')
  @ApiOperation({ summary: 'Create a payment for a dossier' })
  @ApiResponse({
    status: 201,
    description: 'Payment created successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Dossier not found' })
  @Roles(UserRole.ADMIN)
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<Payment & { installments: PaymentInstallment[] }> {
    return this.paymentsService.createPayment(createPaymentDto);
  }

  @Get('dossiers/:id/payments')
  @ApiOperation({ summary: 'Get all payments for a dossier' })
  @ApiParam({ name: 'id', description: 'Dossier ID' })
  @ApiResponse({
    status: 200,
    description: 'List of payments for the dossier',
    type: [PaymentResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Dossier not found' })
  @Roles(UserRole.ADMIN, UserRole.USER)
  async getDossierPayments(@Param('id') dossierId: string): Promise<(Payment & { installments: PaymentInstallment[] })[]> {
    return this.paymentsService.getDossierPayments(dossierId);
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
}

