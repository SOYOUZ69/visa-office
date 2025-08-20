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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payments_service_1 = require("./payments.service");
const create_payment_dto_1 = require("./dto/create-payment.dto");
const update_payment_dto_1 = require("./dto/update-payment.dto");
const payment_response_dto_1 = require("./dto/payment-response.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let PaymentsController = class PaymentsController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async getClientPayments(clientId) {
        return this.paymentsService.getClientPayments(clientId);
    }
    async createPayment(createPaymentDto) {
        return this.paymentsService.createPayment(createPaymentDto);
    }
    async getDossierPayments(dossierId) {
        return this.paymentsService.getDossierPayments(dossierId);
    }
    async updatePayment(paymentId, updatePaymentDto) {
        return this.paymentsService.updatePayment(paymentId, updatePaymentDto);
    }
    async deletePayment(paymentId) {
        return this.paymentsService.deletePayment(paymentId);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Get)('clients/:id/payments'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all payments for a client' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Client ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of payments for the client',
        type: [payment_response_dto_1.PaymentResponseDto],
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Client not found' }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.USER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getClientPayments", null);
__decorate([
    (0, common_1.Post)('payments'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a payment for a dossier' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Payment created successfully',
        type: payment_response_dto_1.PaymentResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Dossier not found' }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_dto_1.CreatePaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createPayment", null);
__decorate([
    (0, common_1.Get)('dossiers/:id/payments'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all payments for a dossier' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Dossier ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of payments for the dossier',
        type: [payment_response_dto_1.PaymentResponseDto],
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Dossier not found' }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.USER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getDossierPayments", null);
__decorate([
    (0, common_1.Patch)('payments/:paymentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a payment' }),
    (0, swagger_1.ApiParam)({ name: 'paymentId', description: 'Payment ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Payment updated successfully',
        type: payment_response_dto_1.PaymentResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Payment not found' }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('paymentId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_payment_dto_1.UpdatePaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "updatePayment", null);
__decorate([
    (0, common_1.Delete)('payments/:paymentId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a payment' }),
    (0, swagger_1.ApiParam)({ name: 'paymentId', description: 'Payment ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Payment deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Payment not found' }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('paymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "deletePayment", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('Payments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/v1'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map