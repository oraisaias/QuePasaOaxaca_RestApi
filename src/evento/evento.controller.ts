import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Query,
  Param,
  Delete,
  Request,
  Patch,
} from '@nestjs/common';
import { EventoService } from './evento.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { PaginationDto } from './dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
  };
}

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
  async removeCms(@Param('id') id: string, @Request() req: RequestWithUser) {
    await this.eventoService.removeById(id, req.user.userId);
    return { message: 'Evento eliminado exitosamente' };
  }

  @Patch('cms/:id')
  @UseGuards(JwtAuthGuard)
  async updateCms(
    @Param('id') id: string,
    @Body() updateEventoDto: UpdateEventoDto,
    @Request() req: RequestWithUser,
  ) {
    return this.eventoService.updateById(id, updateEventoDto, req.user.userId);
  }
}
