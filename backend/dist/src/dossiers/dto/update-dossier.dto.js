"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDossierDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_dossier_dto_1 = require("./create-dossier.dto");
class UpdateDossierDto extends (0, swagger_1.PartialType)(create_dossier_dto_1.CreateDossierDto) {
}
exports.UpdateDossierDto = UpdateDossierDto;
//# sourceMappingURL=update-dossier.dto.js.map