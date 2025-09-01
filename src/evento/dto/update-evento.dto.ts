import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsEnum,
  IsUrl,
  Min,
  Max,
} from 'class-validator';
import { EventStatus } from '../entities/evento.entity';

export class UpdateEventoDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  descripcionLarga?: string;

  @IsOptional()
  @IsUrl()
  imagenUrl?: string;

  @IsOptional()
  @IsString()
  fechaInicio?: string;

  @IsOptional()
  @IsString()
  fechaFin?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;

  @IsOptional()
  @IsString()
  direccionTexto?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precio?: number;

  @IsOptional()
  @IsString()
  phoneNumbers?: string;

  @IsOptional()
  @IsUrl()
  enlaceExterno?: string;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoriaIds?: string[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsBoolean()
  isRecurrent?: boolean;
}
