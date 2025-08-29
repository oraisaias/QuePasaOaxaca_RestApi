import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Evento, EventStatus } from './entities/evento.entity';
import { EventoCategoria } from './entities/evento-categoria.entity';
import { Categoria } from '../categoria/entities/categoria.entity';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { UpdateActiveDto } from './dto/update-active.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CmsEventoDto } from './dto/cms-evento.dto';
import { PaginationDto } from './dto/pagination.dto';
import { PaginatedResponseDto } from './dto/paginated-response.dto';
import { PublicEventoDto } from './dto/public-evento.dto';
import { NearbyEventosDto } from './dto/nearby-eventos.dto';

@Injectable()
export class EventoService {
  constructor(
    @InjectRepository(Evento)
    private eventoRepository: Repository<Evento>,
    @InjectRepository(EventoCategoria)
    private eventoCategoriaRepository: Repository<EventoCategoria>,
    @InjectRepository(Categoria)
    private categoriaRepository: Repository<Categoria>,
  ) {}

  async create(createEventoDto: CreateEventoDto): Promise<Evento> {
    // Validar que las categorías existan antes de crear el evento
    if (
      createEventoDto.categoriaIds &&
      createEventoDto.categoriaIds.length > 0
    ) {
      // Verificar cada categoría individualmente
      const categoriasNoEncontradas: string[] = [];

      for (const categoriaId of createEventoDto.categoriaIds) {
        const categoria = await this.categoriaRepository.findOne({
          where: { id: categoriaId },
          select: ['id'],
        });

        if (!categoria) {
          categoriasNoEncontradas.push(categoriaId);
        }
      }

      if (categoriasNoEncontradas.length > 0) {
        throw new BadRequestException(
          `Las siguientes categorías no existen: ${categoriasNoEncontradas.join(', ')}`,
        );
      }
    }

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
    evento.status = EventStatus.DRAFT;
    // Siempre iniciar como inactivo
    evento.active = false;
    evento.isRecurrent =
      createEventoDto.isRecurrent !== undefined
        ? createEventoDto.isRecurrent
        : false;

    // Guardar el evento
    const savedEvento = await this.eventoRepository.save(evento);

    // Actualizar el campo geom si se proporcionan coordenadas
    if (evento.lat !== undefined && evento.lng !== undefined) {
      await this.eventoRepository.query(
        `UPDATE eventos SET geom = ST_SetSRID(ST_MakePoint($1, $2), 4326) WHERE id = $3`,
        [evento.lng, evento.lat, savedEvento.id],
      );
    }

    // Crear las relaciones con categorías (ya validadas)
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

  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
  async findNearbyActive(
    nearbyDto: NearbyEventosDto,
    userRole?: string,
  ): Promise<
    Array<{
      id: string;
      titulo: string;
      direccionTexto: string | null;
      fechaInicio: string;
      lat: number | null;
      lng: number | null;
      distanciaM: number;
    }>
  > {
    const { lat, lng } = nearbyDto;
    const metros = nearbyDto.metros ?? 100;

    if (lat === undefined || lng === undefined) {
      throw new BadRequestException('lat y lng son requeridos');
    }

    // Construir la consulta SQL según el rol
    let whereClause = 'active = true AND geom IS NOT NULL';
    const queryParams = [lat, lng, metros];

    // Si no es admin, aplicar filtros de status
    if (userRole !== 'admin') {
      whereClause += " AND status IN ('published', 'expired')";
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const rows = await this.eventoRepository.query(
      `
      SELECT 
        id,
        titulo,
        direccion_texto AS "direccionTexto",
        to_char(fecha_inicio, 'YYYY-MM-DD"T"HH24:MI:SS.MSZ') AS "fechaInicio",
        lat,
        lng,
        ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography) AS distancia_m
      FROM eventos
      WHERE ${whereClause}
        AND ST_DWithin(geom::geography, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography, $3)
      ORDER BY distancia_m ASC
      LIMIT 100
      `,
      queryParams,
    );

    return rows.map((r: any) => ({
      id: r.id,
      titulo: r.titulo,
      direccionTexto: r.direccionTexto ?? null,
      fechaInicio: r.fechaInicio,
      lat: r.lat ?? null,
      lng: r.lng ?? null,
      distanciaM: Number(r.distancia_m),
    }));
  }
  /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

  async findAll(userRole?: string): Promise<PublicEventoDto[]> {
    // Construir condiciones de búsqueda según el rol
    const whereConditions: { active?: boolean; status?: any } = {};

    // Si no es admin, aplicar filtros de status y active
    if (userRole !== 'admin') {
      whereConditions.active = true;
      whereConditions.status = In([EventStatus.PUBLISHED, EventStatus.EXPIRED]);
    }

    const eventos = await this.eventoRepository.find({
      where: whereConditions, // Solo eventos activos y publicados/expirados para la app
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
        'active',
        'createdBy',
      ],
      relations: ['eventoCategorias', 'eventoCategorias.categoria'],
    });

    // Transformar a la estructura deseada con ID directo
    if (eventos.length === 0) {
      return [];
    }
    return eventos.map((evento) => ({
      id: evento.id,
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
      active: evento.active,
      isRecurrent: evento.isRecurrent,
      categorias: evento.eventoCategorias.map((ec) => ({
        nombre: ec.categoria.nombre,
        descripcion: ec.categoria.descripcion,
      })),
    }));
  }

  async findByEventId(
    eventId: string,
    userRole?: string,
  ): Promise<PublicEventoDto> {
    // Construir condiciones de búsqueda según el rol
    const whereConditions: { id: string; status?: any; active?: boolean } = {
      id: eventId,
    };

    // Si no es admin, aplicar filtros de status y active
    if (userRole !== 'admin') {
      whereConditions.status = In([EventStatus.PUBLISHED, EventStatus.EXPIRED]);
      whereConditions.active = true;
    }

    // Buscar el evento por su ID directo
    const evento = await this.eventoRepository.findOne({
      where: whereConditions,
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
        'active',
        'isRecurrent',
        'createdBy',
      ],
      relations: ['eventoCategorias', 'eventoCategorias.categoria'],
    });

    if (!evento) {
      const errorMessage =
        userRole === 'admin'
          ? 'Evento no encontrado'
          : 'Evento no encontrado o no está disponible públicamente';
      throw new NotFoundException(errorMessage);
    }

    return {
      id: evento.id,
      titulo: evento.titulo,
      descripcion: evento.descripcion,
      imagenUrl: evento.imagenUrl,
      fechaInicio: evento.fechaInicio,
      fechaFin: evento.fechaFin,
      active: evento.active,
      lat: evento.lat,
      lng: evento.lng,
      direccionTexto: evento.direccionTexto,
      precio: evento.precio,
      enlaceExterno: evento.enlaceExterno,
      status: evento.status,
      isRecurrent: evento.isRecurrent,
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
      select: [
        'id',
        'titulo',
        'fechaInicio',
        'direccionTexto',
        'precio',
        'status',
        'active',
        'isRecurrent',
        'createdAt',
      ],
      relations: ['eventoCategorias', 'eventoCategorias.categoria'],
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
        status: evento.status,
        titulo: evento.titulo,
        fechaInicio: evento.fechaInicio.toISOString(),
        direccionTexto: evento.direccionTexto,
        precio: evento.precio,
        active: evento.active,
        isRecurrent: evento.isRecurrent,
        categoriaIds: evento.eventoCategorias.map((ec) => ({
          id: ec.categoria.id,
          nombre: ec.categoria.nombre,
        })),
      })),
      total,
      page,
      limit,
      totalPages,
      hasNext,
      hasPrev,
    };
  }

  async removeById(id: string): Promise<void> {
    // Buscar el evento por su ID
    const evento = await this.eventoRepository.findOne({
      where: { id },
      select: ['id', 'createdBy'],
    });

    if (!evento) {
      throw new NotFoundException('Evento no encontrado');
    }
    // Eliminar las relaciones con categorías primero
    await this.eventoCategoriaRepository.delete({ eventoId: id });

    // Eliminar el evento
    await this.eventoRepository.remove(evento);
  }

  async updateById(
    id: string,
    updateEventoDto: UpdateEventoDto,
  ): Promise<CmsEventoDto> {
    // Buscar el evento por su ID
    const evento = await this.eventoRepository.findOne({
      where: { id },
      select: ['id', 'createdBy'],
    });

    if (!evento) {
      throw new NotFoundException('Evento no encontrado');
    }
    const eventoToUpdate = await this.eventoRepository.findOne({
      where: { id },
      relations: ['eventoCategorias', 'eventoCategorias.categoria'],
    });

    if (!eventoToUpdate) {
      throw new NotFoundException('Evento no encontrado');
    }

    // Actualizar campos del evento
    if (updateEventoDto.titulo !== undefined) {
      eventoToUpdate.titulo = updateEventoDto.titulo;
    }
    if (updateEventoDto.descripcion !== undefined) {
      eventoToUpdate.descripcion = updateEventoDto.descripcion;
    }
    if (updateEventoDto.imagenUrl !== undefined) {
      eventoToUpdate.imagenUrl = updateEventoDto.imagenUrl;
    }
    if (updateEventoDto.fechaInicio !== undefined) {
      eventoToUpdate.fechaInicio = new Date(updateEventoDto.fechaInicio);
    }
    if (updateEventoDto.fechaFin !== undefined && updateEventoDto.fechaFin) {
      eventoToUpdate.fechaFin = new Date(updateEventoDto.fechaFin);
    }
    if (updateEventoDto.lat !== undefined) {
      eventoToUpdate.lat = updateEventoDto.lat;
    }
    if (updateEventoDto.lng !== undefined) {
      eventoToUpdate.lng = updateEventoDto.lng;
    }
    if (updateEventoDto.direccionTexto !== undefined) {
      eventoToUpdate.direccionTexto = updateEventoDto.direccionTexto;
    }
    if (updateEventoDto.precio !== undefined) {
      eventoToUpdate.precio = updateEventoDto.precio;
    }
    if (updateEventoDto.enlaceExterno !== undefined) {
      eventoToUpdate.enlaceExterno = updateEventoDto.enlaceExterno;
    }
    if (updateEventoDto.status !== undefined) {
      eventoToUpdate.status = updateEventoDto.status;
    }
    if (updateEventoDto.active !== undefined) {
      eventoToUpdate.active = updateEventoDto.active;
    }
    if (updateEventoDto.isRecurrent !== undefined) {
      eventoToUpdate.isRecurrent = updateEventoDto.isRecurrent;
    }

    // Guardar el evento actualizado
    await this.eventoRepository.save(eventoToUpdate);

    // Actualizar el campo geom si se cambiaron las coordenadas
    if (
      updateEventoDto.lat !== undefined ||
      updateEventoDto.lng !== undefined
    ) {
      const finalLat =
        updateEventoDto.lat !== undefined
          ? updateEventoDto.lat
          : eventoToUpdate.lat;
      const finalLng =
        updateEventoDto.lng !== undefined
          ? updateEventoDto.lng
          : eventoToUpdate.lng;
      if (finalLat !== undefined && finalLng !== undefined) {
        await this.eventoRepository.query(
          `UPDATE eventos SET geom = ST_SetSRID(ST_MakePoint($1, $2), 4326) WHERE id = $3`,
          [finalLng, finalLat, id],
        );
      }
    }

    // Actualizar categorías si se proporcionan
    if (updateEventoDto.categoriaIds !== undefined) {
      // Eliminar categorías existentes
      await this.eventoCategoriaRepository.delete({ eventoId: id });

      // Crear nuevas relaciones con categorías
      if (updateEventoDto.categoriaIds.length > 0) {
        const eventoCategorias = updateEventoDto.categoriaIds.map(
          (categoriaId) => {
            const eventoCategoria = new EventoCategoria();
            eventoCategoria.eventoId = id;
            eventoCategoria.categoriaId = categoriaId;
            return eventoCategoria;
          },
        );

        await this.eventoCategoriaRepository.save(eventoCategorias);
      }
    }

    // Obtener el evento actualizado con las relaciones
    const updatedEvento = await this.eventoRepository.findOne({
      where: { id },
      relations: ['eventoCategorias', 'eventoCategorias.categoria'],
    });

    if (!updatedEvento) {
      throw new NotFoundException('Error al obtener el evento actualizado');
    }

    // Retornar en formato CMS
    return {
      id: updatedEvento.id,
      titulo: updatedEvento.titulo,
      fechaInicio: updatedEvento.fechaInicio.toISOString(),
      direccionTexto: updatedEvento.direccionTexto,
      status: updatedEvento.status,
      precio: updatedEvento.precio,
      active: updatedEvento.active,
      isRecurrent: updatedEvento.isRecurrent,
      categoriaIds: updatedEvento.eventoCategorias.map((ec) => {
        return {
          id: ec.categoria.id,
          nombre: ec.categoria.nombre,
        };
      }),
    };
  }

  async updateActive(
    id: string,
    updateActiveDto: UpdateActiveDto,
  ): Promise<{ message: string }> {
    const evento = await this.eventoRepository.findOne({
      where: { id },
      select: ['id'],
    });

    if (!evento) {
      throw new NotFoundException('Evento no encontrado');
    }

    await this.eventoRepository.update(id, { active: updateActiveDto.active });

    return {
      message: `Evento ${updateActiveDto.active ? 'activado' : 'desactivado'} exitosamente`,
    };
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateStatusDto,
  ): Promise<{ message: string; status: EventStatus }> {
    const evento = await this.eventoRepository.findOne({
      where: { id },
      select: ['id', 'status'],
    });

    if (!evento) {
      throw new NotFoundException('Evento no encontrado');
    }

    await this.eventoRepository.update(id, { status: updateStatusDto.status });

    return {
      message: `Status del evento actualizado exitosamente a ${updateStatusDto.status}`,
      status: updateStatusDto.status,
    };
  }
}
