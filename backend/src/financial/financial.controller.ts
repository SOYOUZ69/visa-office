import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FinancialService } from './financial.service';
import { CreateCaisseDto } from './dto/create-caisse.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ApproveTransactionDto } from './dto/approve-transaction.dto';
import { RejectTransactionDto } from './dto/reject-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Financial')
@Controller('/api/v1/financial')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  // Caisse endpoints
  @Post('caisses')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new caisse' })
  @ApiResponse({ status: 201, description: 'Caisse created successfully' })
  createCaisse(@Body() createCaisseDto: CreateCaisseDto) {
    return this.financialService.createCaisse(createCaisseDto);
  }

  @Get('caisses')
  @ApiOperation({ summary: 'Get all caisses' })
  @ApiResponse({ status: 200, description: 'List of all caisses' })
  getAllCaisses() {
    return this.financialService.getAllCaisses();
  }

  @Get('caisses/:id')
  @ApiOperation({ summary: 'Get caisse by ID' })
  @ApiResponse({ status: 200, description: 'Caisse details' })
  getCaisseById(@Param('id') id: string) {
    return this.financialService.getCaisseById(id);
  }

  // Transaction endpoints
  @Post('transactions')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  createTransaction(@Body() createTransactionDto: CreateTransactionDto) {
    return this.financialService.createTransaction(createTransactionDto);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transactions with filters' })
  @ApiResponse({ status: 200, description: 'List of transactions' })
  getTransactions(
    @Query('caisseId') caisseId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: any = {};
    if (caisseId) filters.caisseId = caisseId;
    if (type) filters.type = type;
    if (status) filters.status = status;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    return this.financialService.getTransactions(filters);
  }

  // Financial reports endpoints
  @Post('reports/generate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Generate financial report' })
  @ApiResponse({ status: 201, description: 'Financial report generated' })
  generateFinancialReport(
    @Body() body: { startDate?: string; endDate?: string },
  ) {
    const startDate = body.startDate
      ? new Date(body.startDate)
      : new Date(new Date().setDate(new Date().getDate() - 7)); // default last week

    const endDate = body.endDate ? new Date(body.endDate) : new Date(); // default today

    return this.financialService.generateFinancialReport(startDate, endDate);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get all financial reports' })
  @ApiResponse({ status: 200, description: 'List of financial reports' })
  getFinancialReports() {
    return this.financialService.getFinancialReports();
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get financial statistics' })
  @ApiResponse({ status: 200, description: 'Financial statistics' })
  getFinancialStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.financialService.getFinancialStatistics(start, end);
  }

  // Utility endpoints
  @Get('tax-calculation/:amount')
  @ApiOperation({ summary: 'Calculate tax for an amount' })
  @ApiResponse({ status: 200, description: 'Tax calculation' })
  calculateTax(@Param('amount') amount: string) {
    const numAmount = parseFloat(amount);
    const tax = this.financialService.calculateTaxForClient(numAmount);
    return { amount: numAmount, tax, totalWithTax: numAmount + tax };
  }

  // Transaction Approval endpoints
  @Get('transactions/pending')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all pending transactions for approval' })
  @ApiResponse({ status: 200, description: 'List of pending transactions' })
  getPendingTransactions() {
    return this.financialService.getPendingTransactions();
  }

  @Post('transactions/:id/approve')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Approve a pending transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction approved successfully',
  })
  approveTransaction(
    @Param('id') transactionId: string,
    @Body() approveTransactionDto: ApproveTransactionDto,
  ) {
    return this.financialService.approveTransaction(
      transactionId,
      approveTransactionDto.approvedBy,
    );
  }

  @Post('transactions/:id/reject')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reject a pending transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction rejected successfully',
  })
  rejectTransaction(
    @Param('id') transactionId: string,
    @Body() rejectTransactionDto: RejectTransactionDto,
  ) {
    return this.financialService.rejectTransaction(
      transactionId,
      rejectTransactionDto.approvedBy,
      rejectTransactionDto.rejectionReason,
    );
  }

  @Get('transactions/:id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({ status: 200, description: 'Transaction details' })
  getTransactionById(@Param('id') transactionId: string) {
    return this.financialService.getTransactionById(transactionId);
  }
}
