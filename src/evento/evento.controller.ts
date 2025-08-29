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
import { EventoService } from './evento.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { UpdateActiveDto } from './dto/update-active.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { NearbyEventosDto } from './dto/nearby-eventos.dto';
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

@Controller('eventos')
export class EventoController {
  constructor(private readonly eventoService: EventoService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createEventoDto: CreateEventoDto) {
    console.log('create', createEventoDto);
    return this.eventoService.create(createEventoDto);
  }

  @Get()
  @UseGuards(AppAuthGuard)
  async findAll(@Req() request: AuthenticatedRequest) {
    console.log('findAll');
    const userRole = request.user?.role;
    return this.eventoService.findAll(userRole);
  }

  @Post('nearby')
  @UseGuards(AppAuthGuard)
  async findNearby(
    @Body() nearbyDto: NearbyEventosDto,
    @Req() request: AuthenticatedRequest,
  ) {
    console.log('findNearby', nearbyDto);
    const userRole = request.user?.role;
    return this.eventoService.findNearbyActive(nearbyDto, userRole);
  }

  @Get('cms')
  @UseGuards(CmsAuthGuard)
  async findAllForCms(@Query() paginationDto: PaginationDto) {
    console.log('findAllForCms', paginationDto);
    return this.eventoService.findAllForCms(paginationDto);
  }

  @Get('cms/statuses')
  @UseGuards(CmsAuthGuard)
  getAvailableStatuses() {
    return this.eventoService.getAvailableStatuses();
  }

  @Get(':id')
  @UseGuards(AppAuthGuard)
  async findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    console.log('findOne', id);
    const userRole = request.user?.role;
    return this.eventoService.findByEventId(id, userRole);
  }

  @Delete('cms/:id')
  @UseGuards(CmsAuthGuard)
  async removeCms(@Param('id') id: string) {
    console.log('removeCms', id);
    await this.eventoService.removeById(id);
    return { message: 'Evento eliminado exitosamente' };
  }

  @Patch('cms/:id')
  @UseGuards(CmsAuthGuard)
  async updateCms(
    @Param('id') id: string,
    @Body() updateEventoDto: UpdateEventoDto,
  ) {
    console.log('updateCms', id, updateEventoDto);
    return this.eventoService.updateById(id, updateEventoDto);
  }

  @Patch('cms/:id/active')
  @UseGuards(CmsAuthGuard)
  async updateActive(
    @Param('id') id: string,
    @Body() updateActiveDto: UpdateActiveDto,
  ) {
    console.log('updateActive', id, updateActiveDto);
    return this.eventoService.updateActive(id, updateActiveDto);
  }

  @Patch('cms/:id/status')
  @UseGuards(CmsAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    console.log('updateStatus', id, updateStatusDto);
    return this.eventoService.updateStatus(id, updateStatusDto);
  }
}
