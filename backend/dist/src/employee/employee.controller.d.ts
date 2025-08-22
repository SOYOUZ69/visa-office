import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './entities/employee.entity';
export declare class EmployeeController {
    private readonly employeeService;
    constructor(employeeService: EmployeeService);
    create(createEmployeeDto: CreateEmployeeDto): Promise<Employee>;
    findAll(): Promise<Employee[]>;
    findOne(id: string): Promise<Employee>;
    update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee>;
    remove(id: string): Promise<void>;
    markAttendance(employeeId: string, body: {
        date: string;
        status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
        reason?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.AttendanceStatus;
        date: Date;
        reason: string | null;
        employeeId: string;
    }>;
    getAttendance(employeeId: string, body?: {
        startDate?: string;
        endDate?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.AttendanceStatus;
        date: Date;
        reason: string | null;
        employeeId: string;
    }[]>;
    calculateCommission(employeeId: string, body?: {
        startDate?: string;
        endDate?: string;
    }): Promise<{
        employeeId: string;
        employeeName: string;
        commissionPercentage: string;
        totalCommission: number;
        commissionDetails: {
            clientId: string;
            clientName: string;
            paymentId: string;
            paymentAmount: number;
            commissionAmount: number;
            commissionPercentage: string;
        }[];
        period: {
            startDate: Date;
            endDate: Date;
        };
    }>;
    calculateMonthlySoldeCoungiee(employeeId: string, body: {
        month: number;
        year: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        fullName: string;
        salaryType: import("@prisma/client").$Enums.SalaryType;
        salaryAmount: import("@prisma/client/runtime/library").Decimal;
        commissionPercentage: string;
        soldeCoungiee: import("@prisma/client/runtime/library").Decimal;
    }>;
    getEmployeesWithStats(): Promise<{
        currentMonthAbsences: number;
        totalCommission: number;
        assignedClientsCount: number;
        attendance: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.AttendanceStatus;
            date: Date;
            reason: string | null;
            employeeId: string;
        }[];
        assignedClients: ({
            payments: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                paymentOption: import("@prisma/client").$Enums.PaymentOption | null;
                paymentModality: import("@prisma/client").$Enums.PaymentModality;
                transferCode: string | null;
                clientId: string;
                caisseId: string | null;
            }[];
        } & {
            id: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            fullName: string;
            passportNumber: string | null;
            clientType: import("@prisma/client").$Enums.ClientType;
            address: string;
            jobTitle: string | null;
            destination: string;
            visaType: string;
            notes: string | null;
            isMinor: boolean;
            guardianFullName: string | null;
            guardianCIN: string | null;
            guardianRelationship: string | null;
            status: import("@prisma/client").$Enums.ClientStatus;
            assignedEmployeeId: string | null;
        })[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        fullName: string;
        salaryType: import("@prisma/client").$Enums.SalaryType;
        salaryAmount: import("@prisma/client/runtime/library").Decimal;
        commissionPercentage: string;
        soldeCoungiee: import("@prisma/client/runtime/library").Decimal;
    }[]>;
}
