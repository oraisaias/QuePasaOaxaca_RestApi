export class NearbyEventoResponseDto {
  id: string;
  titulo: string;
  descripcion?: string;
  imagenUrl?: string;
  fechaInicio: string;
  fechaFin?: string;
  lat?: number;
  lng?: number;
  direccionTexto?: string;
  precio?: number;
  enlaceExterno?: string;
  distance?: number;
  categorias: Array<{
    id: string;
    nombre: string;
  }>;
}

export class NearbyPaginationDto {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class AppliedFiltersDto {
  categories?: number;
  time?: string;
  proximity?: number;
  sortBy?: string;
}

export class NearbyResponseDto {
  data: NearbyEventoResponseDto[];
  pagination: NearbyPaginationDto;
  filters: {
    applied: AppliedFiltersDto;
  };
}
