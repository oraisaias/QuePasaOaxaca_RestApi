import { EventStatus } from '../entities/evento.entity';

export class UpdateEventoDto {
  titulo?: string;
  descripcion?: string;
  imagenUrl?: string;
  fechaInicio?: string;
  fechaFin?: string;
  lat?: number;
  lng?: number;
  direccionTexto?: string;
  precio?: number;
  enlaceExterno?: string;
  status?: EventStatus;
  categoriaIds?: string[];
  active?: boolean;
  isRecurrent?: boolean;
}
