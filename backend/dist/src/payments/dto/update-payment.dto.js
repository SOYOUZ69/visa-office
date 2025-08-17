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
exports.UpdatePaymentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
const create_payment_installment_dto_1 = require("./create-payment-installment.dto");
class UpdatePaymentDto {
    totalAmount;
    paymentOption;
    paymentModality;
    transferCode;
    installments;
}
exports.UpdatePaymentDto = UpdatePaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total amount for all services',
        minimum: 0,
        example: 400.00,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdatePaymentDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.PaymentOption,
        description: 'Payment option chosen by client',
        example: 'BANK_TRANSFER',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.PaymentOption),
    __metadata("design:type", String)
], UpdatePaymentDto.prototype, "paymentOption", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.PaymentModality,
        description: 'Payment modality (full, 60-40, or milestone)',
        example: 'SIXTY_FORTY',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.PaymentModality),
    __metadata("design:type", String)
], UpdatePaymentDto.prototype, "paymentModality", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transfer code (required for bank transfers on due date)',
        required: false,
        example: 'TRF123456789'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePaymentDto.prototype, "transferCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [create_payment_installment_dto_1.CreatePaymentInstallmentDto],
        description: 'Payment installments',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_payment_installment_dto_1.CreatePaymentInstallmentDto),
    __metadata("design:type", Array)
], UpdatePaymentDto.prototype, "installments", void 0);
//# sourceMappingURL=update-payment.dto.js.map