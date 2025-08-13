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
exports.CreateManyServicesDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const create_service_dto_1 = require("./create-service.dto");
class CreateManyServicesDto {
    items;
}
exports.CreateManyServicesDto = CreateManyServicesDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [create_service_dto_1.CreateServiceDto],
        description: 'Array of services to create',
        example: [
            {
                serviceType: 'TRANSLATION',
                quantity: 2,
                unitPrice: 50.00
            },
            {
                serviceType: 'DOSSIER_TREATMENT',
                quantity: 1,
                unitPrice: 120.00
            }
        ]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'At least one service item is required' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_service_dto_1.CreateServiceDto),
    __metadata("design:type", Array)
], CreateManyServicesDto.prototype, "items", void 0);
//# sourceMappingURL=create-many-services.dto.js.map