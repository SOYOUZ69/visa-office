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
exports.CreateFamilyMemberDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateFamilyMemberDto {
    fullName;
    passportNumber;
    relationship;
    age;
}
exports.CreateFamilyMemberDto = CreateFamilyMemberDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Full name of the family member',
        example: 'John Doe'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFamilyMemberDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Passport number of the family member',
        example: 'AB1234567'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFamilyMemberDto.prototype, "passportNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Relationship to the main client',
        example: 'Spouse',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFamilyMemberDto.prototype, "relationship", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Age of the family member',
        minimum: 0,
        example: 35,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateFamilyMemberDto.prototype, "age", void 0);
//# sourceMappingURL=create-family-member.dto.js.map