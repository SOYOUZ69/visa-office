import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MetaService } from './meta.service';

@ApiTags('Meta')
@Controller('api/v1/meta')
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  @Get('client-statuses')
  @ApiOperation({ summary: 'Get available client statuses' })
  @ApiResponse({ status: 200, description: 'List of client statuses' })
  getClientStatuses() {
    return this.metaService.getClientStatuses();
  }

  @Get('visa-types')
  @ApiOperation({ summary: 'Get available visa types' })
  @ApiResponse({ status: 200, description: 'List of visa types' })
  getVisaTypes() {
    return this.metaService.getVisaTypes();
  }

  @Get('attachment-types')
  @ApiOperation({ summary: 'Get available attachment types' })
  @ApiResponse({ status: 200, description: 'List of attachment types' })
  getAttachmentTypes() {
    return this.metaService.getAttachmentTypes();
  }

  @Get('service-types')
  @ApiOperation({ summary: 'Get available service types' })
  @ApiResponse({ status: 200, description: 'List of service types' })
  getServiceTypes() {
    return this.metaService.getServiceTypes();
  }

  @Get('payment-options')
  @ApiOperation({ summary: 'Get available payment options' })
  @ApiResponse({ status: 200, description: 'List of payment options' })
  getPaymentOptions() {
    return this.metaService.getPaymentOptions();
  }

  @Get('payment-modalities')
  @ApiOperation({ summary: 'Get available payment modalities' })
  @ApiResponse({ status: 200, description: 'List of payment modalities' })
  getPaymentModalities() {
    return this.metaService.getPaymentModalities();
  }
}
