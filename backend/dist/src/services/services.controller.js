"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const services_service_1 = require("./services.service");
const create_service_dto_1 = require("./dto/create-service.dto");
const create_many_services_dto_1 = require("./dto/create-many-services.dto");
const update_service_dto_1 = require("./dto/update-service.dto");
const service_response_dto_1 = require("./dto/service-response.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let ServicesController = class ServicesController {
    servicesService;
    constructor(servicesService) {
        this.servicesService = servicesService;
    }
    async getClientServices(clientId) {
        return this.servicesService.getClientServices(clientId);
    }
    async getDossierServices(dossierId) {
        return this.servicesService.getDossierServices(dossierId);
    }
    async createService(createServiceDto) {
        return this.servicesService.createService(createServiceDto);
    }
    async createManyServices(createManyServicesDto) {
        return this.servicesService.createManyServices(createManyServicesDto);
    }
    async updateService(serviceId, updateServiceDto) {
        return this.servicesService.updateService(serviceId, updateServiceDto);
    }
    async deleteService(serviceId) {
        return this.servicesService.deleteService(serviceId);
    }
    async getLastPrice(serviceType) {
        return this.servicesService.getLastPrice(serviceType);
    }
    async getLastPrices(serviceTypes) {
        return this.servicesService.getLastPrices(serviceTypes);
    }
};
exports.ServicesController = ServicesController;
__decorate([
    (0, common_1.Get)('clients/:id/services'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all services for a client' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Client ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of services for the client',
        type: [service_response_dto_1.ServiceResponseDto],
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Client not found' }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.USER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "getClientServices", null);
__decorate([
    (0, common_1.Get)('dossiers/:id/services'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all services for a dossier' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Dossier ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of services for the dossier',
        type: [service_response_dto_1.ServiceResponseDto],
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Dossier not found' }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.USER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "getDossierServices", null);
__decorate([
    (0, common_1.Post)('services'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a single service for a dossier' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Service created successfully',
        type: service_response_dto_1.ServiceResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Dossier not found' }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_service_dto_1.CreateServiceDto]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "createService", null);
__decorate([
    (0, common_1.Post)('services/bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Create multiple services for a dossier (bulk)' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Services created successfully',
        type: [service_response_dto_1.ServiceResponseDto],
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Dossier not found' }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_many_services_dto_1.CreateManyServicesDto]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "createManyServices", null);
__decorate([
    (0, common_1.Patch)('services/:serviceId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a service' }),
    (0, swagger_1.ApiParam)({ name: 'serviceId', description: 'Service ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service updated successfully',
        type: service_response_dto_1.ServiceResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Service not found' }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('serviceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_service_dto_1.UpdateServiceDto]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "updateService", null);
__decorate([
    (0, common_1.Delete)('services/:serviceId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a service' }),
    (0, swagger_1.ApiParam)({ name: 'serviceId', description: 'Service ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Service deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Service not found' }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('serviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "deleteService", null);
__decorate([
    (0, common_1.Get)('services/last-price'),
    (0, swagger_1.ApiOperation)({ summary: 'Get the last price for a specific service type' }),
    (0, swagger_1.ApiQuery)({
        name: 'serviceType',
        description: 'Service type to get the last price for',
        enum: client_1.ServiceType
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.USER),
    __param(0, (0, common_1.Query)('serviceType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "getLastPrice", null);
__decorate([
    (0, common_1.Post)('services/last-prices'),
    (0, swagger_1.ApiOperation)({ summary: 'Get the last prices for multiple service types (batch)' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.USER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "getLastPrices", null);
exports.ServicesController = ServicesController = __decorate([
    (0, swagger_1.ApiTags)('Services'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/v1'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [services_service_1.ServicesService])
], ServicesController);
//# sourceMappingURL=services.controller.js.map