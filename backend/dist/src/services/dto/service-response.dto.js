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
exports.ServiceResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class ServiceResponseDto {
    id;
    clientId;
    serviceType;
    quantity;
    unitPrice;
    createdAt;
    updatedAt;
}
exports.ServiceResponseDto = ServiceResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service ID',
        example: 'cuid123456789'
    }),
    __metadata("design:type", String)
], ServiceResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Client ID',
        example: 'cuid123456789'
    }),
    __metadata("design:type", String)
], ServiceResponseDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.ServiceType,
        description: 'Type of service',
        example: 'TRANSLATION'
    }),
    __metadata("design:type", String)
], ServiceResponseDto.prototype, "serviceType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Quantity of the service',
        example: 2
    }),
    __metadata("design:type", Number)
], ServiceResponseDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unit price of the service',
        example: '50.00'
    }),
    __metadata("design:type", String)
], ServiceResponseDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Creation timestamp',
        example: '2024-01-01T00:00:00.000Z'
    }),
    __metadata("design:type", Date)
], ServiceResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        example: '2024-01-01T00:00:00.000Z'
    }),
    __metadata("design:type", Date)
], ServiceResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=service-response.dto.js.map