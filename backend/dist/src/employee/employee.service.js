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
exports.EmployeeService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const employee_entity_1 = require("./entities/employee.entity");
let EmployeeService = class EmployeeService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createEmployeeDto) {
        const data = {
            salaryType: createEmployeeDto.salaryType,
            salaryAmount: new client_1.Prisma.Decimal(createEmployeeDto.salaryAmount),
            commissionPercentage: createEmployeeDto.commissionPercentage,
            soldeCoungiee: new client_1.Prisma.Decimal(createEmployeeDto.soldeCoungiee || 0),
        };
        const created = await this.prisma.employee.create({
            data,
        });
        return new employee_entity_1.Employee(created);
    }
    async findAll() {
        const employees = await this.prisma.employee.findMany({
            orderBy: {
                id: 'desc',
            },
        });
        return employees.map(emp => new employee_entity_1.Employee(emp));
    }
    async findOne(id) {
        const employee = await this.prisma.employee.findUnique({
            where: { id },
        });
        if (!employee) {
            throw new common_1.NotFoundException(`Employee with ID ${id} not found`);
        }
        return new employee_entity_1.Employee(employee);
    }
    async update(id, updateEmployeeDto) {
        const data = {};
        if (updateEmployeeDto.soldeCoungiee !== undefined) {
            data.soldeCoungiee = new client_1.Prisma.Decimal(updateEmployeeDto.soldeCoungiee);
        }
        if (updateEmployeeDto.salaryAmount !== undefined) {
            data.salaryAmount = new client_1.Prisma.Decimal(updateEmployeeDto.salaryAmount);
        }
        if (updateEmployeeDto.salaryType !== undefined) {
            data.salaryType = updateEmployeeDto.salaryType;
        }
        if (updateEmployeeDto.commissionPercentage !== undefined) {
            data.commissionPercentage = updateEmployeeDto.commissionPercentage;
        }
        try {
            const updated = await this.prisma.employee.update({
                where: { id },
                data,
            });
            return new employee_entity_1.Employee(updated);
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`Employee with ID ${id} not found`);
            }
            throw error;
        }
    }
    async remove(id) {
        try {
            await this.prisma.employee.delete({
                where: { id },
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`Employee with ID ${id} not found`);
            }
            throw error;
        }
    }
};
exports.EmployeeService = EmployeeService;
exports.EmployeeService = EmployeeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmployeeService);
//# sourceMappingURL=employee.service.js.map