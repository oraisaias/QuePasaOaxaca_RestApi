import { EventStatus } from '../entities/evento.entity';

export class CmsEventoDto {
  id: string;
  titulo: string;
  fechaInicio: string;
  direccionTexto?: string;
  precio?: number;
  active: boolean;
  isRecurrent: boolean;
  status: EventStatus;
  categoriaIds: {
    id: string;
    nombre: string;
  }[];
}
