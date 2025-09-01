import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { Evento, EventStatus } from './entities/evento.entity';
import { EventoCategoria } from './entities/evento-categoria.entity';
import { Categoria } from '../categoria/entities/categoria.entity';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { UpdateActiveDto } from './dto/update-active.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import {
  NearbyEventoResponseDto,
  NearbyResponseDto,
} from './dto/nearby-response.dto';
import { CmsEventoDto } from './dto/cms-evento.dto';
import { PaginationDto } from './dto/pagination.dto';
import { PaginatedResponseDto } from './dto/paginated-response.dto';
import { PublicEventoDto } from './dto/public-evento.dto';
import {
  NearbyEventosDto,
  Suggestion,
  TimeFilter,
} from './dto/nearby-eventos.dto';
import {
  FilteredEventsDto,
  FilteredEventResponseDto,
  DateFilter,
  DistanceFilter,
} from './dto/filtered-events.dto';
import { FindEventDto } from './dto/find-event.dto';

interface EventoRow {
  id: string;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  fechaInicio: string;
  fechaFin: string;
  lat: number;
  lng: number;
  direccionTexto: string;
  precio: number;
  enlaceExterno: string;
  distancia_m: number;
}

interface CategoriaRow {
  evento_id: string;
  id: string;
  nombre: string;
}

@Injectable()
export class EventoService {
  constructor(
    @InjectRepository(Evento)
    private eventoRepository: Repository<Evento>,
    @InjectRepository(EventoCategoria)
    private eventoCategoriaRepository: Repository<EventoCategoria>,
    @InjectRepository(Categoria)
    private categoriaRepository: Repository<Categoria>,
    private dataSource: DataSource,
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
    if (createEventoDto.descripcionLarga)
      evento.descripcionLarga = createEventoDto.descripcionLarga;
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

  async findNearbyActive(
    nearbyDto: NearbyEventosDto,
    userRole?: string,
  ): Promise<NearbyResponseDto> {
    const {
      lat,
      lng,
      searchQuery,
      categories,
      time,
      proximity = 5000,
      sortBy = 'proximity',
      suggestion,
      page = 1,
      limit = 20,
    } = nearbyDto;

    const hasLocation = lat !== undefined && lng !== undefined;

    // Aplicar sugerencias si están presentes y hay ubicación
    let finalProximity = proximity;
    let finalSortBy = sortBy;

    if (suggestion && hasLocation) {
      switch (suggestion) {
        case Suggestion.NEAR_ME:
          finalProximity = 3000;
          break;
        case Suggestion.CENTER:
          finalProximity = 10000;
          finalSortBy = 'proximity';
          break;
        case Suggestion.POPULAR:
          finalSortBy = 'time';
          break;
        case Suggestion.NEW:
          finalSortBy = 'time';
          break;
      }
    }

    // Si no hay ubicación, forzar ordenamiento por tiempo
    if (!hasLocation) {
      finalSortBy = 'time';
    }

    // Construir condiciones base
    let whereConditions = 'active = true';
    const queryParams: any[] = [];

    // Agregar condición de geometría solo si hay ubicación
    if (hasLocation) {
      whereConditions += ' AND geom IS NOT NULL';
      queryParams.push(lat, lng, finalProximity);
    }

    // Si no es admin, aplicar filtros de status
    if (userRole !== 'admin') {
      whereConditions += " AND status IN ('published', 'expired')";
    }

    // Filtro por categorías
    if (categories && categories.length > 0) {
      const categoryPlaceholders = categories
        .map((_, index) => `$${queryParams.length + index + 1}`)
        .join(',');
      whereConditions += ` AND id IN (
        SELECT DISTINCT evento_id 
        FROM evento_categorias 
        WHERE categoria_id IN (${categoryPlaceholders})
      )`;
      queryParams.push(...categories);
    }

    // Filtro por tiempo
    if (time) {
      const now = new Date();
      let timeCondition = '';
      switch (time) {
        case TimeFilter.TODAY:
          timeCondition = `AND DATE(fecha_inicio) = DATE(NOW())`;
          break;
        case TimeFilter.THIS_WEEKEND:
          timeCondition = `AND EXTRACT(DOW FROM fecha_inicio) IN (0, 6) AND fecha_inicio >= NOW()`;
          break;
        case TimeFilter.NEXT_WEEK:
          timeCondition = `AND fecha_inicio BETWEEN NOW() AND '${new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()}'`;
          break;
      }
      whereConditions += ` ${timeCondition}`;
    }

    // Filtro por búsqueda de texto
    if (searchQuery && searchQuery.trim()) {
      whereConditions += ` AND (titulo ILIKE $${queryParams.length + 1} OR descripcion ILIKE $${queryParams.length + 1})`;
      queryParams.push(`%${searchQuery.trim()}%`);
    }

    // Ordenamiento
    let orderClause = 'ORDER BY fecha_inicio ASC';
    if (finalSortBy === 'proximity' && hasLocation) {
      orderClause = 'ORDER BY distancia_m ASC';
    }

    // Paginación
    const offset = (page - 1) * limit;

    // Consulta principal
    const selectFields = hasLocation
      ? `e.id, e.titulo, e.descripcion, e.imagen_url AS "imagenUrl", to_char(e.fecha_inicio, 'YYYY-MM-DD"T"HH24:MI:SS.MSZ') AS "fechaInicio", to_char(e.fecha_fin, 'YYYY-MM-DD"T"HH24:MI:SS.MSZ') AS "fechaFin", e.direccion_texto AS "direccionTexto", e.precio, ST_Distance(e.geom::geography, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography) AS distancia_m`
      : `e.id, e.titulo, e.descripcion, e.imagen_url AS "imagenUrl", to_char(e.fecha_inicio, 'YYYY-MM-DD"T"HH24:MI:SS.MSZ') AS "fechaInicio", to_char(e.fecha_fin, 'YYYY-MM-DD"T"HH24:MI:SS.MSZ') AS "fechaFin", e.direccion_texto AS "direccionTexto", e.precio`;

    const proximityCondition = hasLocation
      ? `AND ST_DWithin(e.geom::geography, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography, $3)`
      : '';

    const query = `
      SELECT ${selectFields}
      FROM eventos e
      WHERE ${whereConditions}
        ${proximityCondition}
      ${orderClause}
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Consulta para contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM eventos e
      WHERE ${whereConditions}
        ${proximityCondition}
    `;

    const rows: EventoRow[] = await this.eventoRepository.query(
      query,
      queryParams,
    );
    const countResult: { total: string }[] = await this.eventoRepository.query(
      countQuery,
      queryParams,
    );

    const total: number = parseInt(countResult[0].total);
    const totalPages = Math.ceil(total / limit);

    // Obtener categorías para cada evento
    const eventIds = rows.map((r: EventoRow) => r.id);
    let categoriasMap: { [key: string]: any[] } = {};

    if (eventIds.length > 0) {
      const categoriasQuery = `
        SELECT 
          ec.evento_id,
          c.id,
          c.nombre
        FROM evento_categorias ec
        JOIN categorias c ON ec.categoria_id = c.id
        WHERE ec.evento_id IN (${eventIds.map((_, i) => `$${i + 1}`).join(',')})
      `;

      const categoriasRows: CategoriaRow[] = await this.eventoRepository.query(
        categoriasQuery,
        eventIds,
      );

      categoriasMap = categoriasRows.reduce(
        (acc: { [key: string]: CategoriaRow[] }, row: CategoriaRow) => {
          if (!acc[row.evento_id]) {
            acc[row.evento_id] = [];
          }
          acc[row.evento_id].push({
            id: row.id,
            nombre: row.nombre,
            evento_id: row.evento_id,
          });
          return acc;
        },
        {},
      );
    }

    // Construir respuesta
    const data: NearbyEventoResponseDto[] = rows.map((r: EventoRow) => {
      const evento: NearbyEventoResponseDto = {
        id: r.id,
        titulo: r.titulo,
        descripcion: r.descripcion,
        fechaInicio: r.fechaInicio,
        direccionTexto: r.direccionTexto,
        precio: r.precio,
        categorias: categoriasMap[r.id] || [],
      };

      // Solo agregar distance si hay ubicación
      if (hasLocation) {
        evento.distance = Math.round(Number(r.distancia_m));
      }

      return evento;
    });

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        applied: {
          categories: categories?.length || 0,
          time: time || undefined,
          proximity: finalProximity,
          sortBy: finalSortBy,
        },
      },
    };
  }

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
    findEventDto?: FindEventDto,
  ): Promise<PublicEventoDto & { distance?: number }> {
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
        'descripcionLarga',
        'imagenUrl',
        'fechaInicio',
        'fechaFin',
        'lat',
        'lng',
        'direccionTexto',
        'precio',
        'enlaceExterno',
        'phoneNumbers',
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

    const response: PublicEventoDto & { distance?: number } = {
      id: evento.id,
      titulo: evento.titulo,
      descripcion: evento.descripcion,
      descripcionLarga: evento.descripcionLarga,
      fechaInicio: evento.fechaInicio,
      fechaFin: evento.fechaFin,
      lat: evento.lat,
      lng: evento.lng,
      direccionTexto: evento.direccionTexto,
      precio: evento.precio,
      enlaceExterno: evento.enlaceExterno,
      isRecurrent: evento.isRecurrent,
      phoneNumbers: evento.phoneNumbers,
      categorias: evento.eventoCategorias.map((ec) => ({
        nombre: ec.categoria.nombre,
        descripcion: ec.categoria.descripcion,
      })),
    };

    // Calcular distancia si se proporcionaron coordenadas
    if (findEventDto?.lat && findEventDto?.lng && evento.lat && evento.lng) {
      try {
        const distanceQuery = `
          SELECT ST_Distance(
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
            ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography
          ) as distancia_m
        `;
        const distanceResult: { distancia_m: string }[] =
          await this.dataSource.query(distanceQuery, [
            evento.lng,
            evento.lat,
            findEventDto.lng,
            findEventDto.lat,
          ]);

        if (distanceResult && distanceResult.length > 0) {
          response.distance = Math.round(Number(distanceResult[0].distancia_m));
        }
      } catch (error) {
        console.error('Error calculando distancia:', error);
        // No fallar si hay error en el cálculo de distancia
      }
    }

    return response;
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
    if (updateEventoDto.descripcionLarga !== undefined) {
      eventoToUpdate.descripcionLarga = updateEventoDto.descripcionLarga;
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
    if (updateEventoDto.phoneNumbers !== undefined) {
      eventoToUpdate.phoneNumbers = updateEventoDto.phoneNumbers;
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
      phoneNumbers: updatedEvento.phoneNumbers,
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

  getAvailableStatuses(): Array<{ value: EventStatus }> {
    const statuses = [
      {
        value: EventStatus.DRAFT,
      },
      {
        value: EventStatus.PUBLISHED,
      },
      {
        value: EventStatus.ARCHIVED,
      },
      {
        value: EventStatus.EXPIRED,
      },
    ];

    return statuses;
  }

  async findFilteredEvents(
    filteredDto: FilteredEventsDto,
    userRole?: string,
  ): Promise<{ data: FilteredEventResponseDto[] }> {
    const { date, distance, latitude, longitude } = filteredDto;

    // Convertir distancia de km a metros
    const distanceInMeters = distance * 1000;

    // Determinar límite según la distancia
    let limit: number;
    switch (distance) {
      case DistanceFilter.FIVE:
        limit = 20;
        break;
      case DistanceFilter.TWENTY:
        limit = 30;
        break;
      case DistanceFilter.FIFTY:
        limit = 50;
        break;
      default:
        limit = 20;
    }

    // Construir condiciones base
    let whereConditions = 'active = true AND geom IS NOT NULL';
    const queryParams: any[] = [latitude, longitude, distanceInMeters];

    // Si no es admin, aplicar filtros de status
    if (userRole !== 'admin') {
      whereConditions += " AND status IN ('published', 'expired')";
    }

    // Filtro por fecha
    let dateCondition = '';
    switch (date) {
      case DateFilter.TODAY:
        dateCondition = `AND DATE(fecha_inicio) = DATE(NOW())`;
        break;
      case DateFilter.WEEK:
        dateCondition = `AND fecha_inicio BETWEEN NOW() AND NOW() + INTERVAL '7 days'`;
        break;
      case DateFilter.MONTH:
        dateCondition = `AND fecha_inicio BETWEEN NOW() AND NOW() + INTERVAL '30 days'`;
        break;
      case DateFilter.ALL:
        dateCondition = ''; // Sin filtro de fecha
        break;
    }

    if (dateCondition) {
      whereConditions += ` ${dateCondition}`;
    }

    // Consulta principal
    const query = `
      SELECT 
        e.id,
        e.titulo,
        e.lat,
        e.lng,
        ST_Distance(e.geom::geography, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography) AS distancia_m
      FROM eventos e
      WHERE ${whereConditions}
        AND ST_DWithin(e.geom::geography, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography, $3)
      ORDER BY distancia_m ASC
      LIMIT ${limit}
    `;

    const rows: Array<{
      id: string;
      titulo: string;
      lat: number;
      lng: number;
      distancia_m: number;
    }> = await this.eventoRepository.query(query, queryParams);

    // Construir respuesta
    const data: FilteredEventResponseDto[] = rows.map((r) => ({
      id: r.id,
      titulo: r.titulo,
      distance: Math.round(Number(r.distancia_m)),
      lat: r.lat,
      lng: r.lng,
    }));

    return { data };
  }
}
