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
exports.CreateClientDto = exports.EmployerDto = exports.PhoneNumberDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const create_family_member_dto_1 = require("./create-family-member.dto");
class PhoneNumberDto {
    number;
}
exports.PhoneNumberDto = PhoneNumberDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+1234567890' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PhoneNumberDto.prototype, "number", void 0);
class EmployerDto {
    name;
    position;
}
exports.EmployerDto = EmployerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Tech Corp' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EmployerDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Software Engineer', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EmployerDto.prototype, "position", void 0);
class CreateClientDto {
    clientType;
    fullName;
    address;
    jobTitle;
    passportNumber;
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
    familyMembers;
}
exports.CreateClientDto = CreateClientDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.ClientType, example: client_1.ClientType.INDIVIDUAL }),
    (0, class_validator_1.IsEnum)(client_1.ClientType),
    __metadata("design:type", String)
], CreateClientDto.prototype, "clientType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123 Main St, City, Country' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Software Engineer', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "jobTitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'AB1234567', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "passportNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'john.doe@example.com' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'United States' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "destination", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Tourist' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "visaType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Additional notes', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, required: false, description: 'Indicates if the client is a minor' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateClientDto.prototype, "isMinor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Jane Doe', required: false, description: 'Guardian full name (required if clientType=INDIVIDUAL and isMinor=true)' }),
    (0, class_validator_1.ValidateIf)(o => o.clientType === client_1.ClientType.INDIVIDUAL && o.isMinor === true),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "guardianFullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'AB123456', required: false, description: 'Guardian CIN (required if clientType=INDIVIDUAL and isMinor=true)' }),
    (0, class_validator_1.ValidateIf)(o => o.clientType === client_1.ClientType.INDIVIDUAL && o.isMinor === true),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "guardianCIN", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mother', required: false, description: 'Guardian relationship (required if clientType=INDIVIDUAL and isMinor=true)' }),
    (0, class_validator_1.ValidateIf)(o => o.clientType === client_1.ClientType.INDIVIDUAL && o.isMinor === true),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "guardianRelationship", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [PhoneNumberDto], required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PhoneNumberDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateClientDto.prototype, "phoneNumbers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [EmployerDto], required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => EmployerDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateClientDto.prototype, "employers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [create_family_member_dto_1.CreateFamilyMemberDto],
        required: false,
        description: 'Family members (required for FAMILY and GROUP client types)'
    }),
    (0, class_validator_1.ValidateIf)(o => o.clientType === client_1.ClientType.FAMILY || o.clientType === client_1.ClientType.GROUP),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_family_member_dto_1.CreateFamilyMemberDto),
    __metadata("design:type", Array)
], CreateClientDto.prototype, "familyMembers", void 0);
//# sourceMappingURL=create-client.dto.js.map