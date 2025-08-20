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
exports.CreateServiceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateServiceDto {
    dossierId;
    serviceType;
    quantity;
    unitPrice;
}
exports.CreateServiceDto = CreateServiceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the dossier this service belongs to',
        example: 'clxxxxx'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "dossierId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.ServiceType,
        description: 'Type of service',
        example: 'TRANSLATION'
    }),
    (0, class_validator_1.IsEnum)(client_1.ServiceType),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "serviceType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Quantity of the service',
        minimum: 1,
        example: 2
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateServiceDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unit price of the service',
        minimum: 0,
        example: 50.00
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateServiceDto.prototype, "unitPrice", void 0);
//# sourceMappingURL=create-service.dto.js.map