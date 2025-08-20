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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DossiersService } from './dossiers.service';
import { CreateDossierDto } from './dto/create-dossier.dto';
import { UpdateDossierDto } from './dto/update-dossier.dto';
import { DossierResponseDto } from './dto/dossier-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('dossiers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/dossiers')
export class DossiersController {
  constructor(private readonly dossiersService: DossiersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new dossier' })
  @ApiResponse({ status: 201, description: 'Dossier created successfully' })
  create(@Body() createDossierDto: CreateDossierDto): Promise<DossierResponseDto> {
    return this.dossiersService.create(createDossierDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all dossiers or filter by client' })
  @ApiResponse({ status: 200, description: 'Dossiers retrieved successfully' })
  findAll(@Query('clientId') clientId?: string): Promise<DossierResponseDto[]> {
    if (clientId) {
      return this.dossiersService.findAllByClient(clientId);
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
}