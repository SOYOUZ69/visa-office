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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentResponseDto = exports.PaymentInstallmentResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class PaymentInstallmentResponseDto {
    id;
    description;
    percentage;
    amount;
    dueDate;
    createdAt;
    updatedAt;
}
exports.PaymentInstallmentResponseDto = PaymentInstallmentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Installment ID',
        example: 'cuid123456789'
    }),
    __metadata("design:type", String)
], PaymentInstallmentResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Description of the payment installment',
        example: 'First payment - 60%'
    }),
    __metadata("design:type", String)
], PaymentInstallmentResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Percentage of total amount for this installment',
        example: 60.00
    }),
    __metadata("design:type", String)
], PaymentInstallmentResponseDto.prototype, "percentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Amount for this installment',
        example: '240.00'
    }),
    __metadata("design:type", String)
], PaymentInstallmentResponseDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Due date for this installment',
        example: '2024-12-31T00:00:00.000Z'
    }),
    __metadata("design:type", Date)
], PaymentInstallmentResponseDto.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Creation timestamp',
        example: '2024-01-01T00:00:00.000Z'
    }),
    __metadata("design:type", Date)
], PaymentInstallmentResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        example: '2024-01-01T00:00:00.000Z'
    }),
    __metadata("design:type", Date)
], PaymentInstallmentResponseDto.prototype, "updatedAt", void 0);
class PaymentResponseDto {
    id;
    clientId;
    totalAmount;
    paymentOption;
    paymentModality;
    transferCode;
    installments;
    createdAt;
    updatedAt;
}
exports.PaymentResponseDto = PaymentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment ID',
        example: 'cuid123456789'
    }),
    __metadata("design:type", String)
], PaymentResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Client ID',
        example: 'cuid123456789'
    }),
    __metadata("design:type", String)
], PaymentResponseDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total amount for all services',
        example: '400.00'
    }),
    __metadata("design:type", String)
], PaymentResponseDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.PaymentOption,
        description: 'Payment option chosen by client',
        example: 'BANK_TRANSFER'
    }),
    __metadata("design:type", String)
], PaymentResponseDto.prototype, "paymentOption", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.PaymentModality,
        description: 'Payment modality (full, 60-40, or milestone)',
        example: 'SIXTY_FORTY'
    }),
    __metadata("design:type", String)
], PaymentResponseDto.prototype, "paymentModality", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transfer code (for bank transfers)',
        example: 'TRF123456789',
        required: false
    }),
    __metadata("design:type", String)
], PaymentResponseDto.prototype, "transferCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [PaymentInstallmentResponseDto],
        description: 'Payment installments'
    }),
    __metadata("design:type", Array)
], PaymentResponseDto.prototype, "installments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Creation timestamp',
        example: '2024-01-01T00:00:00.000Z'
    }),
    __metadata("design:type", Date)
], PaymentResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        example: '2024-01-01T00:00:00.000Z'
    }),
    __metadata("design:type", Date)
], PaymentResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=payment-response.dto.js.map