import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Query,
  Param,
} from '@nestjs/common';
import { EventoService } from './evento.service';
import { CreateEventoDto } from './dto/create-evento.dto';
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

  @Get(':eventId')
  async findOne(@Param('eventId') eventId: string) {
    return this.eventoService.findByEventId(eventId);
  }

  @Get('cms')
  @UseGuards(JwtAuthGuard)
  async findAllForCms(@Query() paginationDto: PaginationDto) {
    return this.eventoService.findAllForCms(paginationDto);
  }
}
