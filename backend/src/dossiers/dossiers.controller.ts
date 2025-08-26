import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { DossiersService } from './dossiers.service';
import { CreateDossierDto } from './dto/create-dossier.dto';
import { UpdateDossierDto } from './dto/update-dossier.dto';
import { DossierResponseDto } from './dto/dossier-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('dossiers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/dossiers')
export class DossiersController {
  constructor(private readonly dossiersService: DossiersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new dossier' })
  @ApiResponse({ status: 201, description: 'Dossier created successfully' })
  create(
    @Body() createDossierDto: CreateDossierDto,
  ): Promise<DossierResponseDto> {
    return this.dossiersService.create(createDossierDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all dossiers or filter by client' })
  @ApiResponse({ status: 200, description: 'Dossiers retrieved successfully' })
  findAll(
    @Query('dossierId') dossierId?: string,
  ): Promise<DossierResponseDto[]> {
    if (dossierId) {
      return this.dossiersService.findAllByClient(dossierId);
    }
    return this.dossiersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a dossier by ID' })
  @ApiResponse({ status: 200, description: 'Dossier retrieved successfully' })
  findOne(@Param('id') id: string): Promise<DossierResponseDto> {
    return this.dossiersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a dossier' })
  @ApiResponse({ status: 200, description: 'Dossier updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateDossierDto: UpdateDossierDto,
  ): Promise<DossierResponseDto> {
    return this.dossiersService.update(id, updateDossierDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a dossier' })
  @ApiResponse({ status: 200, description: 'Dossier deleted successfully' })
  remove(@Param('id') id: string): Promise<void> {
    return this.dossiersService.remove(id);
  }
  @Post(':id/assign-employee')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign an employee to a client' })
  @ApiResponse({ status: 200, description: 'Employee assigned successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  @ApiResponse({ status: 404, description: 'Client or employee not found' })
  assignEmployee(
    @Param('id') dossierId: string,
    @Body() body: { employeeId: string; role?: string },
  ) {
    return this.dossiersService.assignEmployee(
      dossierId,
      body.employeeId,
      body.role,
    );
  }

  @Delete(':id/assign-employee')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unassign employee from a client' })
  @ApiResponse({ status: 200, description: 'Employee unassigned successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  unassignEmployee(
    @Param('id') dossierId: string,
    @Body() body: { employeeId: string },
  ) {
    return this.dossiersService.unassignEmployee(dossierId, body.employeeId);
  }

  @Get(':id/assigned-employees')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all employees assigned to a client' })
  @ApiResponse({
    status: 200,
    description: 'Assigned employees retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  getAssignedEmployees(@Param('id') dossierId: string) {
    return this.dossiersService.getAssignedEmployees(dossierId);
  }
}
