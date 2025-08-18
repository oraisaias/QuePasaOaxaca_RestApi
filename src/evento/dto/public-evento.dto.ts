import { EventStatus } from '../entities/evento.entity';

export class PublicEventoDto {
  id: string; // ID directo de la base de datos
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
  active: boolean;
  isRecurrent: boolean;
  categorias: {
    nombre: string;
    descripcion?: string;
  }[];
}
