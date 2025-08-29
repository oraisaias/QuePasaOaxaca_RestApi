import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsArray,
  IsUUID,
  MinLength,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';

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

  @IsArray()
  @IsUUID('4', { each: true })
  categoriaIds: string[];

  @IsBoolean()
  @IsOptional()
  isRecurrent?: boolean;
}
