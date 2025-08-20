import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { CreateManyServicesDto } from './dto/create-many-services.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceResponseDto } from './dto/service-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, ServiceType } from '@prisma/client';
import { ServiceItem } from '@prisma/client';

@ApiTags('Services')
@ApiBearerAuth()
@Controller('api/v1')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get('clients/:id/services')
  @ApiOperation({ summary: 'Get all services for a client' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  @ApiResponse({
    status: 200,
    description: 'List of services for the client',
    type: [ServiceResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @Roles(UserRole.ADMIN, UserRole.USER)
  async getClientServices(@Param('id') clientId: string): Promise<ServiceItem[]> {
    return this.servicesService.getClientServices(clientId);
  }

  @Get('dossiers/:id/services')
  @ApiOperation({ summary: 'Get all services for a dossier' })
  @ApiParam({ name: 'id', description: 'Dossier ID' })
  @ApiResponse({
    status: 200,
    description: 'List of services for the dossier',
    type: [ServiceResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Dossier not found' })
  @Roles(UserRole.ADMIN, UserRole.USER)
  async getDossierServices(@Param('id') dossierId: string): Promise<ServiceItem[]> {
    return this.servicesService.getDossierServices(dossierId);
  }

  @Post('services')
  @ApiOperation({ summary: 'Create a single service for a dossier' })
  @ApiResponse({
    status: 201,
    description: 'Service created successfully',
    type: ServiceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Dossier not found' })
  @Roles(UserRole.ADMIN)
  async createService(
    @Body() createServiceDto: CreateServiceDto,
  ): Promise<ServiceItem> {
    return this.servicesService.createService(createServiceDto);
  }

  @Post('services/bulk')
  @ApiOperation({ summary: 'Create multiple services for a dossier (bulk)' })
  @ApiResponse({
    status: 201,
    description: 'Services created successfully',
    type: [ServiceResponseDto],
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Dossier not found' })
  @Roles(UserRole.ADMIN)
  async createManyServices(
    @Body() createManyServicesDto: CreateManyServicesDto,
  ): Promise<ServiceItem[]> {
    return this.servicesService.createManyServices(createManyServicesDto);
  }

  @Patch('services/:serviceId')
  @ApiOperation({ summary: 'Update a service' })
  @ApiParam({ name: 'serviceId', description: 'Service ID' })
  @ApiResponse({
    status: 200,
    description: 'Service updated successfully',
    type: ServiceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  @Roles(UserRole.ADMIN)
  async updateService(
    @Param('serviceId') serviceId: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ): Promise<ServiceItem> {
    return this.servicesService.updateService(serviceId, updateServiceDto);
  }

  @Delete('services/:serviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a service' })
  @ApiParam({ name: 'serviceId', description: 'Service ID' })
  @ApiResponse({ status: 204, description: 'Service deleted successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  @Roles(UserRole.ADMIN)
  async deleteService(@Param('serviceId') serviceId: string): Promise<void> {
    return this.servicesService.deleteService(serviceId);
  }

  @Get('services/last-price')
  @ApiOperation({ summary: 'Get the last price for a specific service type' })
  @ApiQuery({ 
    name: 'serviceType', 
    description: 'Service type to get the last price for',
    enum: ServiceType
  })
  @ApiResponse({
    status: 200,
    description: 'Last price for the service type',
    schema: {
      type: 'object',
      properties: {
        unitPrice: {
          type: 'number',
          nullable: true,
          description: 'Last unit price used for this service type, or null if not found'
        }
      }
    }
  })
  @Roles(UserRole.ADMIN, UserRole.USER)
  async getLastPrice(@Query('serviceType') serviceType: ServiceType): Promise<{ unitPrice: number | null }> {
    return this.servicesService.getLastPrice(serviceType);
  }

  @Post('services/last-prices')
  @ApiOperation({ summary: 'Get the last prices for multiple service types (batch)' })
  @ApiResponse({
    status: 200,
    description: 'Last prices for the requested service types',
    schema: {
      type: 'object',
      additionalProperties: {
        type: 'number',
        nullable: true
      },
      example: {
        'TRANSLATION': 50.00,
        'ASSURANCE': 100.00,
        'VISA_APPLICATION': null
      }
    }
  })
  @Roles(UserRole.ADMIN, UserRole.USER)
  async getLastPrices(@Body() serviceTypes: ServiceType[]): Promise<{ [key: string]: number | null }> {
    return this.servicesService.getLastPrices(serviceTypes);
  }
}
