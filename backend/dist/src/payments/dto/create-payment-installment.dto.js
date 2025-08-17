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
exports.CreatePaymentInstallmentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreatePaymentInstallmentDto {
    description;
    percentage;
    amount;
    dueDate;
}
exports.CreatePaymentInstallmentDto = CreatePaymentInstallmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Description of the payment installment',
        example: 'First payment - 60%'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePaymentInstallmentDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Percentage of total amount for this installment',
        minimum: 0,
        maximum: 100,
        example: 60.00
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreatePaymentInstallmentDto.prototype, "percentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Amount for this installment (calculated from percentage)',
        minimum: 0,
        example: 240.00
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePaymentInstallmentDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Due date for this installment',
        example: '2024-12-31'
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePaymentInstallmentDto.prototype, "dueDate", void 0);
//# sourceMappingURL=create-payment-installment.dto.js.map