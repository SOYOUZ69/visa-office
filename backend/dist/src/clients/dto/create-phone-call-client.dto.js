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
exports.CreatePhoneCallClientDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class PhoneNumberDto {
    number;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+212612345678' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PhoneNumberDto.prototype, "number", void 0);
class EmployerDto {
    name;
    position;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Acme Corp' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EmployerDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Manager', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EmployerDto.prototype, "position", void 0);
class ServiceItemDto {
    serviceType;
    quantity;
    unitPrice;
}
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.ServiceType }),
    (0, class_validator_1.IsEnum)(client_1.ServiceType),
    __metadata("design:type", String)
], ServiceItemDto.prototype, "serviceType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ServiceItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100.00 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ServiceItemDto.prototype, "unitPrice", void 0);
class PaymentInstallmentDto {
    description;
    percentage;
    amount;
    dueDate;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Premier versement' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PaymentInstallmentDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 60 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PaymentInstallmentDto.prototype, "percentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 600.00 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PaymentInstallmentDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-12-31' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], PaymentInstallmentDto.prototype, "dueDate", void 0);
class PaymentConfigDto {
    totalAmount;
    paymentOption;
    paymentModality;
    transferCode;
    installments;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1000.00 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PaymentConfigDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.PaymentOption }),
    (0, class_validator_1.IsEnum)(client_1.PaymentOption),
    __metadata("design:type", String)
], PaymentConfigDto.prototype, "paymentOption", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.PaymentModality }),
    (0, class_validator_1.IsEnum)(client_1.PaymentModality),
    __metadata("design:type", String)
], PaymentConfigDto.prototype, "paymentModality", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'TRF123456', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PaymentConfigDto.prototype, "transferCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [PaymentInstallmentDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PaymentInstallmentDto),
    __metadata("design:type", Array)
], PaymentConfigDto.prototype, "installments", void 0);
class CreatePhoneCallClientDto {
    clientType;
    fullName;
    address;
    jobTitle;
    email;
    destination;
    visaType;
    notes;
    isMinor;
    guardianFullName;
    guardianCIN;
    guardianRelationship;
    phoneNumbers;
    employers;
    services;
    paymentConfig;
}
exports.CreatePhoneCallClientDto = CreatePhoneCallClientDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['PHONE_CALL'], default: 'PHONE_CALL' }),
    (0, class_validator_1.IsEnum)(client_1.ClientType),
    __metadata("design:type", String)
], CreatePhoneCallClientDto.prototype, "clientType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePhoneCallClientDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123 Main Street, City' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePhoneCallClientDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Software Engineer', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePhoneCallClientDto.prototype, "jobTitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'john.doe@example.com' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreatePhoneCallClientDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'France' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePhoneCallClientDto.prototype, "destination", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Tourist' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePhoneCallClientDto.prototype, "visaType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Urgent processing needed', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePhoneCallClientDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, required: false, description: 'Indicates if the client is a minor' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreatePhoneCallClientDto.prototype, "isMinor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Jane Doe', required: false, description: 'Guardian full name (required if isMinor=true)' }),
    (0, class_validator_1.ValidateIf)(o => o.isMinor === true),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePhoneCallClientDto.prototype, "guardianFullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'AB123456', required: false, description: 'Guardian CIN (required if isMinor=true)' }),
    (0, class_validator_1.ValidateIf)(o => o.isMinor === true),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePhoneCallClientDto.prototype, "guardianCIN", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mother', required: false, description: 'Guardian relationship (required if isMinor=true)' }),
    (0, class_validator_1.ValidateIf)(o => o.isMinor === true),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePhoneCallClientDto.prototype, "guardianRelationship", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [PhoneNumberDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PhoneNumberDto),
    __metadata("design:type", Array)
], CreatePhoneCallClientDto.prototype, "phoneNumbers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [EmployerDto], required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => EmployerDto),
    __metadata("design:type", Array)
], CreatePhoneCallClientDto.prototype, "employers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ServiceItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ServiceItemDto),
    __metadata("design:type", Array)
], CreatePhoneCallClientDto.prototype, "services", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: PaymentConfigDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PaymentConfigDto),
    __metadata("design:type", PaymentConfigDto)
], CreatePhoneCallClientDto.prototype, "paymentConfig", void 0);
//# sourceMappingURL=create-phone-call-client.dto.js.map