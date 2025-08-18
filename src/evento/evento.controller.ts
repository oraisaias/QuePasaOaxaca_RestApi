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
} from '@nestjs/common';
import { EventoService } from './evento.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { UpdateActiveDto } from './dto/update-active.dto';
import { NearbyEventosDto } from './dto/nearby-eventos.dto';
import { PaginationDto } from './dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('eventos')
export class EventoController {
  constructor(private readonly eventoService: EventoService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createEventoDto: CreateEventoDto) {
    return this.eventoService.create(createEventoDto);
  }

  @Get()
  async findAll() {
    return this.eventoService.findAll();
  }

  @Post('nearby')
  @UseGuards(JwtAuthGuard)
  async findNearby(@Body() nearbyDto: NearbyEventosDto) {
    return this.eventoService.findNearbyActive(nearbyDto);
  }

  @Get('cms')
  @UseGuards(JwtAuthGuard)
  async findAllForCms(@Query() paginationDto: PaginationDto) {
    return this.eventoService.findAllForCms(paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventoService.findByEventId(id);
  }

  @Delete('cms/:id')
  @UseGuards(JwtAuthGuard)
  async removeCms(@Param('id') id: string) {
    await this.eventoService.removeById(id);
    return { message: 'Evento eliminado exitosamente' };
  }

  @Patch('cms/:id')
  @UseGuards(JwtAuthGuard)
  async updateCms(
    @Param('id') id: string,
    @Body() updateEventoDto: UpdateEventoDto,
  ) {
    return this.eventoService.updateById(id, updateEventoDto);
  }

  @Patch('cms/:id/active')
  @UseGuards(JwtAuthGuard)
  async updateActive(
    @Param('id') id: string,
    @Body() updateActiveDto: UpdateActiveDto,
  ) {
    return this.eventoService.updateActive(id, updateActiveDto);
  }
}
