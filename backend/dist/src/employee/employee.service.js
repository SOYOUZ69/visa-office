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
            fullName: createEmployeeDto.fullName,
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
        return employees.map((emp) => new employee_entity_1.Employee(emp));
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
        if (updateEmployeeDto.fullName !== undefined) {
            data.fullName = updateEmployeeDto.fullName;
        }
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
    async markAttendance(employeeId, date, status, reason) {
        const employee = await this.prisma.employee.findUnique({
            where: { id: employeeId },
        });
        if (!employee) {
            throw new common_1.NotFoundException(`Employee with ID ${employeeId} not found`);
        }
        const existingAttendance = await this.prisma.attendance.findUnique({
            where: {
                employeeId_date: {
                    employeeId,
                    date: new Date(date),
                },
            },
        });
        if (existingAttendance) {
            return this.prisma.attendance.update({
                where: { id: existingAttendance.id },
                data: {
                    status,
                    reason,
                },
            });
        }
        else {
            return this.prisma.attendance.create({
                data: {
                    employeeId,
                    date: new Date(date),
                    status,
                    reason,
                },
            });
        }
    }
    async getAttendance(employeeId, startDate, endDate) {
        const employee = await this.prisma.employee.findUnique({
            where: { id: employeeId },
        });
        if (!employee) {
            throw new common_1.NotFoundException(`Employee with ID ${employeeId} not found`);
        }
        const where = { employeeId };
        if (startDate || endDate) {
            where.date = {};
            if (startDate)
                where.date.gte = new Date(startDate);
            if (endDate)
                where.date.lte = new Date(endDate);
        }
        return this.prisma.attendance.findMany({
            where,
            orderBy: { date: 'desc' },
        });
    }
    async calculateMonthlySoldeCoungiee(employeeId, month, year) {
        const employee = await this.prisma.employee.findUnique({
            where: { id: employeeId },
        });
        if (!employee) {
            throw new common_1.NotFoundException(`Employee with ID ${employeeId} not found`);
        }
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const attendance = await this.prisma.attendance.findMany({
            where: {
                employeeId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });
        let soldeChange = 4;
        const absences = attendance.filter((a) => a.status === 'ABSENT');
        soldeChange -= absences.length;
        const newSolde = employee.soldeCoungiee.plus(soldeChange);
        return this.prisma.employee.update({
            where: { id: employeeId },
            data: {
                soldeCoungiee: newSolde,
            },
        });
    }
    async calculateCommission(employeeId, startDate, endDate) {
        const employee = await this.prisma.employee.findUnique({
            where: { id: employeeId },
        });
        if (!employee) {
            throw new common_1.NotFoundException(`Employee with ID ${employeeId} not found`);
        }
        const assignedClients = await this.prisma.client.findMany({
            where: {
                assignedEmployeeId: employeeId,
            },
            include: {
                payments: {
                    where: {
                        createdAt: {
                            gte: startDate || new Date(0),
                            lte: endDate || new Date(),
                        },
                    },
                },
            },
        });
        let totalCommission = 0;
        const commissionDetails = [];
        for (const client of assignedClients) {
            for (const payment of client.payments) {
                const commissionAmount = (Number(payment.totalAmount) *
                    parseFloat(employee.commissionPercentage)) /
                    100;
                totalCommission += commissionAmount;
                commissionDetails.push({
                    clientId: client.id,
                    clientName: client.fullName,
                    paymentId: payment.id,
                    paymentAmount: Number(payment.totalAmount),
                    commissionAmount,
                    commissionPercentage: employee.commissionPercentage,
                });
            }
        }
        return {
            employeeId,
            employeeName: employee.fullName,
            commissionPercentage: employee.commissionPercentage,
            totalCommission,
            commissionDetails,
            period: {
                startDate: startDate || new Date(0),
                endDate: endDate || new Date(),
            },
        };
    }
    async getEmployeesWithStats() {
        const employees = await this.prisma.employee.findMany({
            include: {
                assignedClients: {
                    include: {
                        payments: true,
                    },
                },
                attendance: {
                    where: {
                        date: {
                            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                        },
                    },
                },
            },
        });
        return employees.map((employee) => {
            const currentMonthAttendance = employee.attendance;
            const absences = currentMonthAttendance.filter((a) => a.status === 'ABSENT').length;
            const totalCommission = employee.assignedClients.reduce((sum, client) => {
                return (sum +
                    client.payments.reduce((paymentSum, payment) => {
                        return (paymentSum +
                            (Number(payment.totalAmount) *
                                parseFloat(employee.commissionPercentage)) /
                                100);
                    }, 0));
            }, 0);
            return {
                ...employee,
                currentMonthAbsences: absences,
                totalCommission,
                assignedClientsCount: employee.assignedClients.length,
            };
        });
    }
};
exports.EmployeeService = EmployeeService;
exports.EmployeeService = EmployeeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmployeeService);
//# sourceMappingURL=employee.service.js.map