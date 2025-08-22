"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Employee = void 0;
const client_1 = require("@prisma/client");
class Employee {
    id;
    fullName;
    salaryType;
    salaryAmount;
    commissionPercentage;
    soldeCoungiee;
    createdAt;
    updatedAt;
    constructor(partial) {
        Object.assign(this, partial);
        if (this.salaryAmount && !(this.salaryAmount instanceof client_1.Prisma.Decimal)) {
            this.salaryAmount = new client_1.Prisma.Decimal(this.salaryAmount);
        }
        if (this.soldeCoungiee && !(this.soldeCoungiee instanceof client_1.Prisma.Decimal)) {
            this.soldeCoungiee = new client_1.Prisma.Decimal(this.soldeCoungiee);
        }
    }
}
exports.Employee = Employee;
//# sourceMappingURL=employee.entity.js.map