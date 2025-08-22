import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './entities/employee.entity';

@ApiTags('employees')
@Controller('api/v1/employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Employee has been successfully created.',
    type: Employee,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiBody({ type: CreateEmployeeDto })
  create(@Body() createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    return this.employeeService.create(createEmployeeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all employees.',
    type: [Employee],
  })
  findAll(): Promise<Employee[]> {
    return this.employeeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an employee by ID' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the employee with the specified ID.',
    type: Employee,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Employee not found',
  })
  findOne(@Param('id') id: string): Promise<Employee> {
    return this.employeeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an employee' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Employee has been successfully updated.',
    type: Employee,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Employee not found',
  })
  @ApiBody({ type: UpdateEmployeeDto })
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    return this.employeeService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an employee' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Employee has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Employee not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.employeeService.remove(id);
  }

  // Attendance Management
  @Post(':id/attendance')
  @ApiOperation({ summary: 'Mark employee attendance' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attendance marked successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Employee not found',
  })
  markAttendance(
    @Param('id') employeeId: string,
    @Body()
    body: {
      date: string;
      status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
      reason?: string;
    },
  ) {
    return this.employeeService.markAttendance(
      employeeId,
      new Date(body.date),
      body.status,
      body.reason,
    );
  }

  @Get(':id/attendance')
  @ApiOperation({ summary: 'Get employee attendance' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attendance records retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Employee not found',
  })
  getAttendance(
    @Param('id') employeeId: string,
    @Body() body?: { startDate?: string; endDate?: string },
  ) {
    const startDate = body?.startDate ? new Date(body.startDate) : undefined;
    const endDate = body?.endDate ? new Date(body.endDate) : undefined;
    return this.employeeService.getAttendance(employeeId, startDate, endDate);
  }

  // Commission Management
  @Get(':id/commission')
  @ApiOperation({ summary: 'Calculate employee commission' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Commission calculated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Employee not found',
  })
  calculateCommission(
    @Param('id') employeeId: string,
    @Body() body?: { startDate?: string; endDate?: string },
  ) {
    const startDate = body?.startDate ? new Date(body.startDate) : undefined;
    const endDate = body?.endDate ? new Date(body.endDate) : undefined;
    return this.employeeService.calculateCommission(
      employeeId,
      startDate,
      endDate,
    );
  }

  @Post(':id/calculate-solde')
  @ApiOperation({ summary: 'Calculate monthly solde coungiee' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Solde coungiee calculated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Employee not found',
  })
  calculateMonthlySoldeCoungiee(
    @Param('id') employeeId: string,
    @Body() body: { month: number; year: number },
  ) {
    return this.employeeService.calculateMonthlySoldeCoungiee(
      employeeId,
      body.month,
      body.year,
    );
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get all employees with statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Employees with statistics retrieved successfully',
  })
  getEmployeesWithStats() {
    return this.employeeService.getEmployeesWithStats();
  }
}
