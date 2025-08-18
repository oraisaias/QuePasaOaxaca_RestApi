export class CmsEventoDto {
  id: string;
  titulo: string;
  fechaInicio: string;
  direccionTexto?: string;
  precio?: number;
  active: boolean;
  isRecurrent: boolean;
  categoriaIds: {
    id: string;
    nombre: string;
  }[];
}
