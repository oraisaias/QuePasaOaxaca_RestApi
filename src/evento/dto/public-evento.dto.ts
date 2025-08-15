import { EventStatus } from '../entities/evento.entity';

export class PublicEventoDto {
  eventId: string; // Identificador único generado, no el ID de la DB
  titulo: string;
  descripcion?: string;
  imagenUrl?: string;
  fechaInicio: Date;
  fechaFin?: Date;
  lat?: number;
  lng?: number;
  direccionTexto?: string;
  precio?: number;
  enlaceExterno?: string;
  status: EventStatus;
  categorias: {
    nombre: string;
    descripcion?: string;
  }[];
}
