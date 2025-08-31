
export class PublicEventoDto {
  id: string; // ID directo de la base de datos
  titulo: string;
  descripcion?: string;
  fechaInicio: Date;
  fechaFin?: Date;
  lat?: number;
  lng?: number;
  direccionTexto?: string;
  precio?: number;
  enlaceExterno?: string;
  isRecurrent: boolean;
  categorias: {
    nombre: string;
    descripcion?: string;
  }[];
}
