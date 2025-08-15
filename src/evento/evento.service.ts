import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evento, EventStatus } from './entities/evento.entity';
import { EventoCategoria } from './entities/evento-categoria.entity';
import { CreateEventoDto } from './dto/create-evento.dto';
import { CmsEventoDto } from './dto/cms-evento.dto';
import { PaginationDto } from './dto/pagination.dto';
import { PaginatedResponseDto } from './dto/paginated-response.dto';
import { PublicEventoDto } from './dto/public-evento.dto';
import { EventIdentifierUtil } from './utils/event-identifier.util';

@Injectable()
export class EventoService {
  constructor(
    @InjectRepository(Evento)
    private eventoRepository: Repository<Evento>,
    @InjectRepository(EventoCategoria)
    private eventoCategoriaRepository: Repository<EventoCategoria>,
  ) {}

  async create(createEventoDto: CreateEventoDto): Promise<Evento> {
    // Crear el evento
    const evento = new Evento();
    evento.titulo = createEventoDto.titulo;
    if (createEventoDto.descripcion)
      evento.descripcion = createEventoDto.descripcion;
    if (createEventoDto.imagenUrl) evento.imagenUrl = createEventoDto.imagenUrl;
    evento.fechaInicio = new Date(createEventoDto.fechaInicio);
    if (createEventoDto.fechaFin)
      evento.fechaFin = new Date(createEventoDto.fechaFin);
    if (createEventoDto.lat !== undefined) evento.lat = createEventoDto.lat;
    if (createEventoDto.lng !== undefined) evento.lng = createEventoDto.lng;
    if (createEventoDto.direccionTexto)
      evento.direccionTexto = createEventoDto.direccionTexto;
    if (createEventoDto.precio !== undefined)
      evento.precio = createEventoDto.precio;
    if (createEventoDto.enlaceExterno)
      evento.enlaceExterno = createEventoDto.enlaceExterno;
    evento.status = createEventoDto.status || EventStatus.DRAFT;

    // Guardar el evento
    const savedEvento = await this.eventoRepository.save(evento);

    // Crear las relaciones con categorías
    if (
      createEventoDto.categoriaIds &&
      createEventoDto.categoriaIds.length > 0
    ) {
      const eventoCategorias = createEventoDto.categoriaIds.map(
        (categoriaId) => {
          const eventoCategoria = new EventoCategoria();
          eventoCategoria.eventoId = savedEvento.id;
          eventoCategoria.categoriaId = categoriaId;
          return eventoCategoria;
        },
      );

      await this.eventoCategoriaRepository.save(eventoCategorias);
    }

    return savedEvento;
  }

  async findAll(): Promise<PublicEventoDto[]> {
    const eventos = await this.eventoRepository.find({
      select: [
        'id',
        'titulo',
        'descripcion',
        'imagenUrl',
        'fechaInicio',
        'fechaFin',
        'lat',
        'lng',
        'direccionTexto',
        'precio',
        'enlaceExterno',
        'status',
        'createdBy',
      ],
      relations: ['eventoCategorias', 'eventoCategorias.categoria'],
    });

    // Transformar a la estructura deseada con identificador único
    return eventos.map((evento) => ({
      eventId: EventIdentifierUtil.generateEventIdentifier(
        evento.id,
        evento.titulo,
        evento.fechaInicio,
      ),
      titulo: evento.titulo,
      descripcion: evento.descripcion,
      imagenUrl: evento.imagenUrl,
      fechaInicio: evento.fechaInicio,
      fechaFin: evento.fechaFin,
      lat: evento.lat,
      lng: evento.lng,
      direccionTexto: evento.direccionTexto,
      precio: evento.precio,
      enlaceExterno: evento.enlaceExterno,
      status: evento.status,
      categorias: evento.eventoCategorias.map((ec) => ({
        nombre: ec.categoria.nombre,
        descripcion: ec.categoria.descripcion,
      })),
    }));
  }

  async findByEventId(eventId: string): Promise<PublicEventoDto> {
    // Validar el formato del identificador
    if (!EventIdentifierUtil.isValidIdentifier(eventId)) {
      throw new NotFoundException('Identificador de evento inválido');
    }

    // Buscar todos los eventos y encontrar el que coincida con el identificador
    const eventos = await this.eventoRepository.find({
      select: [
        'id',
        'titulo',
        'descripcion',
        'imagenUrl',
        'fechaInicio',
        'fechaFin',
        'lat',
        'lng',
        'direccionTexto',
        'precio',
        'enlaceExterno',
        'status',
        'createdBy',
      ],
      relations: ['eventoCategorias', 'eventoCategorias.categoria'],
    });

    // Encontrar el evento que coincida con el identificador
    const evento = eventos.find((evento) => {
      const generatedId = EventIdentifierUtil.generateEventIdentifier(
        evento.id,
        evento.titulo,
        evento.fechaInicio,
      );
      return generatedId === eventId;
    });

    if (!evento) {
      throw new NotFoundException('Evento no encontrado');
    }

    return {
      eventId: EventIdentifierUtil.generateEventIdentifier(
        evento.id,
        evento.titulo,
        evento.fechaInicio,
      ),
      titulo: evento.titulo,
      descripcion: evento.descripcion,
      imagenUrl: evento.imagenUrl,
      fechaInicio: evento.fechaInicio,
      fechaFin: evento.fechaFin,
      lat: evento.lat,
      lng: evento.lng,
      direccionTexto: evento.direccionTexto,
      precio: evento.precio,
      enlaceExterno: evento.enlaceExterno,
      status: evento.status,
      categorias: evento.eventoCategorias.map((ec) => ({
        nombre: ec.categoria.nombre,
        descripcion: ec.categoria.descripcion,
      })),
    };
  }

  async findAllForCms(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<CmsEventoDto>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [eventos, total] = await this.eventoRepository.findAndCount({
      select: ['id', 'titulo', 'fechaInicio', 'direccionTexto', 'precio'],
      relations: ['eventoCategorias'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: eventos.map((evento) => ({
        id: evento.id,
        titulo: evento.titulo,
        fechaInicio: evento.fechaInicio.toISOString(),
        direccionTexto: evento.direccionTexto,
        precio: evento.precio,
        categoriaIds: evento.eventoCategorias.map((ec) => ec.categoriaId),
      })),
      total,
      page,
      limit,
      totalPages,
      hasNext,
      hasPrev,
    };
  }
}
