import { Controller, Get, Post, Body } from '@nestjs/common';
import { AiService } from './aiservice.service';

@Controller('api/v1/ai-service')
export class AiServiceController {
  constructor(private readonly visaService: AiService) {}

  @Get('countries')
  async getCountries() {
    return this.visaService.getCountries();
  }

  @Get('services')
  async getServices() {
    return this.visaService.getServices();
  }

  @Post('estimate')
  async getEstimate(@Body() estimateData: any) {
    return this.visaService.getEstimate(estimateData);
  }

  @Post('transactions')
  async createTransaction(@Body() transactionData: any) {
    return this.visaService.createTransaction(transactionData);
  }
}
