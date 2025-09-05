import { EventStatus } from '../entities/evento.entity';

export class PublicEventoDto {
  titulo: string;
  descripcion?: string;
  descripcionLarga?: string;
  fechaInicio: Date;
  fechaFin?: Date;
  lat?: number;
  lng?: number;
  direccionTexto?: string;
  precio?: number;
  enlaceExterno?: string;
  isRecurrent: boolean;
  phoneNumbers?: string;
  importancia: string;
  recurrencia: string;
  categorias: {
    nombre: string;
    descripcion?: string;
  }[];
}

export class PublicEventoCMSDto {
  id: string; // ID directo de la base de datos
  titulo: string;
  descripcion?: string;
  descripcionLarga?: string;
  fechaInicio: Date;
  fechaFin?: Date;
  lat?: number;
  lng?: number;
  direccionTexto?: string;
  precio?: number;
  enlaceExterno?: string;
  isRecurrent: boolean;
  phoneNumbers?: string;
  status: EventStatus;
  importancia: string;
  recurrencia: string;
  categorias: {
    nombre: string;
    descripcion?: string;
  }[];
}
