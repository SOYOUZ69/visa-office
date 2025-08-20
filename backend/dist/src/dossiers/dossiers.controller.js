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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DossiersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dossiers_service_1 = require("./dossiers.service");
const create_dossier_dto_1 = require("./dto/create-dossier.dto");
const update_dossier_dto_1 = require("./dto/update-dossier.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
let DossiersController = class DossiersController {
    dossiersService;
    constructor(dossiersService) {
        this.dossiersService = dossiersService;
    }
    create(createDossierDto) {
        return this.dossiersService.create(createDossierDto);
    }
    findAll(clientId) {
        if (clientId) {
            return this.dossiersService.findAllByClient(clientId);
        }
        return this.dossiersService.findAll();
    }
    findOne(id) {
        return this.dossiersService.findOne(id);
    }
    update(id, updateDossierDto) {
        return this.dossiersService.update(id, updateDossierDto);
    }
    remove(id) {
        return this.dossiersService.remove(id);
    }
};
exports.DossiersController = DossiersController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new dossier' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Dossier created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_dossier_dto_1.CreateDossierDto]),
    __metadata("design:returntype", Promise)
], DossiersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all dossiers or filter by client' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dossiers retrieved successfully' }),
    __param(0, (0, common_1.Query)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DossiersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a dossier by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dossier retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DossiersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a dossier' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dossier updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_dossier_dto_1.UpdateDossierDto]),
    __metadata("design:returntype", Promise)
], DossiersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a dossier' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dossier deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DossiersController.prototype, "remove", null);
exports.DossiersController = DossiersController = __decorate([
    (0, swagger_1.ApiTags)('dossiers'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('api/v1/dossiers'),
    __metadata("design:paramtypes", [dossiers_service_1.DossiersService])
], DossiersController);
//# sourceMappingURL=dossiers.controller.js.map