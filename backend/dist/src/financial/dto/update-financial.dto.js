"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFinancialDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_financial_dto_1 = require("./create-financial.dto");
class UpdateFinancialDto extends (0, swagger_1.PartialType)(create_financial_dto_1.CreateFinancialDto) {
}
exports.UpdateFinancialDto = UpdateFinancialDto;
//# sourceMappingURL=update-financial.dto.js.map