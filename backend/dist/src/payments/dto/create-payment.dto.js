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
exports.CreatePaymentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
const create_payment_installment_dto_1 = require("./create-payment-installment.dto");
class CreatePaymentDto {
    totalAmount;
    paymentOption;
    paymentModality;
    transferCode;
    installments;
}
exports.CreatePaymentDto = CreatePaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total amount for all services',
        minimum: 0,
        example: 400.00
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePaymentDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.PaymentOption,
        description: 'Payment option chosen by client (required for FULL_PAYMENT, optional for others)',
        example: 'BANK_TRANSFER',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.PaymentOption),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "paymentOption", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.PaymentModality,
        description: 'Payment modality (full, 60-40, or milestone)',
        example: 'SIXTY_FORTY'
    }),
    (0, class_validator_1.IsEnum)(client_1.PaymentModality),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "paymentModality", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transfer code (required for bank transfers on due date)',
        required: false,
        example: 'TRF123456789'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "transferCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [create_payment_installment_dto_1.CreatePaymentInstallmentDto],
        description: 'Payment installments',
        example: [
            {
                description: 'First payment - 60%',
                percentage: 60.00,
                amount: 240.00,
                dueDate: '2024-12-31'
            },
            {
                description: 'Second payment - 40%',
                percentage: 40.00,
                amount: 160.00,
                dueDate: '2025-01-31'
            }
        ]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'At least one installment is required' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_payment_installment_dto_1.CreatePaymentInstallmentDto),
    __metadata("design:type", Array)
], CreatePaymentDto.prototype, "installments", void 0);
//# sourceMappingURL=create-payment.dto.js.map