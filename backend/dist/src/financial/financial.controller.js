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
exports.FinancialController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const financial_service_1 = require("./financial.service");
const create_caisse_dto_1 = require("./dto/create-caisse.dto");
const create_transaction_dto_1 = require("./dto/create-transaction.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let FinancialController = class FinancialController {
    financialService;
    constructor(financialService) {
        this.financialService = financialService;
    }
    createCaisse(createCaisseDto) {
        return this.financialService.createCaisse(createCaisseDto);
    }
    getAllCaisses() {
        return this.financialService.getAllCaisses();
    }
    getCaisseById(id) {
        return this.financialService.getCaisseById(id);
    }
    createTransaction(createTransactionDto) {
        return this.financialService.createTransaction(createTransactionDto);
    }
    getTransactions(caisseId, type, status, startDate, endDate) {
        const filters = {};
        if (caisseId)
            filters.caisseId = caisseId;
        if (type)
            filters.type = type;
        if (status)
            filters.status = status;
        if (startDate)
            filters.startDate = new Date(startDate);
        if (endDate)
            filters.endDate = new Date(endDate);
        return this.financialService.getTransactions(filters);
    }
    generateFinancialReport(startDate, endDate) {
        return this.financialService.generateFinancialReport(new Date(startDate), new Date(endDate));
    }
    getFinancialReports() {
        return this.financialService.getFinancialReports();
    }
    calculateTax(amount) {
        const numAmount = parseFloat(amount);
        const tax = this.financialService.calculateTaxForClient(numAmount);
        return { amount: numAmount, tax, totalWithTax: numAmount + tax };
    }
};
exports.FinancialController = FinancialController;
__decorate([
    (0, common_1.Post)('caisses'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new caisse' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Caisse created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_caisse_dto_1.CreateCaisseDto]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "createCaisse", null);
__decorate([
    (0, common_1.Get)('caisses'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all caisses' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of all caisses' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "getAllCaisses", null);
__decorate([
    (0, common_1.Get)('caisses/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get caisse by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Caisse details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "getCaisseById", null);
__decorate([
    (0, common_1.Post)('transactions'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new transaction' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Transaction created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_transaction_dto_1.CreateTransactionDto]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "createTransaction", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transactions with filters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of transactions' }),
    __param(0, (0, common_1.Query)('caisseId')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Post)('reports/generate'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Generate financial report' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Financial report generated' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "generateFinancialReport", null);
__decorate([
    (0, common_1.Get)('reports'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all financial reports' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of financial reports' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "getFinancialReports", null);
__decorate([
    (0, common_1.Get)('tax-calculation/:amount'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate tax for an amount' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tax calculation' }),
    __param(0, (0, common_1.Param)('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "calculateTax", null);
exports.FinancialController = FinancialController = __decorate([
    (0, swagger_1.ApiTags)('Financial'),
    (0, common_1.Controller)('/api/v1/financial'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [financial_service_1.FinancialService])
], FinancialController);
//# sourceMappingURL=financial.controller.js.map