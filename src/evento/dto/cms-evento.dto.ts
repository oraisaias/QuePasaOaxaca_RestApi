export class CmsEventoDto {
  id: string;
  titulo: string;
  fechaInicio: string;
  direccionTexto?: string;
  precio?: number;
  categoriaIds: {
    id: string;
    nombre: string;
  }[];
}
