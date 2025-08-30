import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './aiservice.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('api/v1/ai-service')
@UseGuards(JwtAuthGuard)
export class AiServiceController {
  constructor(private readonly visaService: AiService) {}

  @Get('countries')
  @ApiBearerAuth()
  async getCountries() {
    return this.visaService.getCountries();
  }

  @Get('services')
  @ApiBearerAuth()
  async getServices() {
    return this.visaService.getServices();
  }

  @Post('estimate')
  @ApiBearerAuth()
  async getEstimate(@Body() estimateData: any) {
    return this.visaService.getEstimate(estimateData);
  }

  @Post('transactions')
  @ApiBearerAuth()
  async createTransaction(@Body() transactionData: any) {
    return this.visaService.createTransaction(transactionData);
  }
}
