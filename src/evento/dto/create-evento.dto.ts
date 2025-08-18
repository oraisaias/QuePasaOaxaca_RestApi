import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsArray,
  IsUUID,
  IsEnum,
  MinLength,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';
import { EventStatus } from '../entities/evento.entity';

export class CreateEventoDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  titulo: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  descripcion?: string;

  @IsString()
  @IsOptional()
  imagenUrl?: string;

  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  @IsOptional()
  fechaFin?: string;

  @IsNumber()
  @IsOptional()
  lat?: number;

  @IsNumber()
  @IsOptional()
  lng?: number;

  @IsString()
  @IsOptional()
  direccionTexto?: string;

  @IsNumber()
  @IsOptional()
  precio?: number;

  @IsString()
  @IsOptional()
  enlaceExterno?: string;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @IsArray()
  @IsUUID('4', { each: true })
  categoriaIds: string[];

  @IsBoolean()
  @IsOptional()
  isRecurrent?: boolean;
}
