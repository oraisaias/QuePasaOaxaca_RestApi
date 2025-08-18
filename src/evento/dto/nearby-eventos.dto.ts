import { IsNumber, IsOptional } from 'class-validator';

export class NearbyEventosDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsNumber()
  @IsOptional()
  metros?: number; // radio en metros (default en servicio)
}
