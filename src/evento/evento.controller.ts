import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Query,
  Param,
  Delete,
  Patch,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { EventoService } from './evento.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { UpdateActiveDto } from './dto/update-active.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { NearbyEventosDto } from './dto/nearby-eventos.dto';
import { FilteredEventsDto } from './dto/filtered-events.dto';
import { FindEventDto } from './dto/find-event.dto';
import { PaginationDto } from './dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppAuthGuard } from '../auth/guards/app-auth.guard';
import { CmsAuthGuard } from '../auth/guards/cms-auth.guard';

interface AuthenticatedRequest {
  user?: {
    id: string;
    email?: string;
    deviceId?: string;
    role: string;
  };
}

@ApiTags('eventos')
@Controller('eventos')
export class EventoController {
  constructor(private readonly eventoService: EventoService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo evento' })
  @ApiResponse({ 
    status: 201, 
    description: 'Evento creado exitosamente',
    type: CreateEventoDto 
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  async create(@Body() createEventoDto: CreateEventoDto) {
    return this.eventoService.create(createEventoDto);
  }

  @Get()
  @UseGuards(AppAuthGuard)
  async findAll(@Req() request: AuthenticatedRequest) {
    const userRole = request.user?.role;
    return this.eventoService.findAll(userRole);
  }

  @Post('nearby')
  @UseGuards(AppAuthGuard)
  async findNearby(
    @Body() nearbyDto: NearbyEventosDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const userRole = request.user?.role;
    return this.eventoService.findNearbyActive(nearbyDto, userRole);
  }

  @Post('filtered')
  @UseGuards(AppAuthGuard)
  async findFiltered(
    @Body() filteredDto: FilteredEventsDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const userRole = request.user?.role;
    return this.eventoService.findFilteredEvents(filteredDto, userRole);
  }

  @Get('cms')
  @UseGuards(CmsAuthGuard)
  async findAllForCms(@Query() paginationDto: PaginationDto) {
    return this.eventoService.findAllForCms(paginationDto);
  }

  @Get('cms/statuses')
  @UseGuards(CmsAuthGuard)
  getAvailableStatuses() {
    return this.eventoService.getAvailableStatuses();
  }

  @Post('app/:id')
  @UseGuards(AppAuthGuard)
  async findOne(
    @Param('id') id: string,
    @Body() findEventDto: FindEventDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const userRole = request.user?.role;
    return this.eventoService.findByEventId(id, userRole, findEventDto);
  }

  @Delete('cms/:id')
  @UseGuards(CmsAuthGuard)
  async removeCms(@Param('id') id: string) {
    await this.eventoService.removeById(id);
    return { message: 'Evento eliminado exitosamente' };
  }

  @Patch('cms/:id')
  @UseGuards(CmsAuthGuard)
  async updateCms(
    @Param('id') id: string,
    @Body() updateEventoDto: UpdateEventoDto,
  ) {
    console.log('ACTUALIZAR EVENTO CMS', updateEventoDto);
    return this.eventoService.updateById(id, updateEventoDto);
  }

  @Patch('cms/:id/active')
  @UseGuards(CmsAuthGuard)
  async updateActive(
    @Param('id') id: string,
    @Body() updateActiveDto: UpdateActiveDto,
  ) {
    return this.eventoService.updateActive(id, updateActiveDto);
  }

  @Patch('cms/:id/status')
  @UseGuards(CmsAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.eventoService.updateStatus(id, updateStatusDto);
  }
}
