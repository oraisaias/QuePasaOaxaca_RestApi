import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsArray,
  IsUUID,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventoDto {
  @ApiProperty({
    description: 'Título del evento',
    example: 'Festival de Música Tradicional',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  titulo: string;

  @ApiProperty({
    description: 'Descripción corta del evento',
    example: 'Celebración anual de música oaxaqueña',
    maxLength: 350,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(350)
  descripcion?: string;

  @ApiProperty({
    description: 'Descripción detallada del evento',
    example: 'Un evento cultural que celebra la riqueza musical de Oaxaca con presentaciones de grupos tradicionales, talleres de instrumentos y degustación de comida local.',
    maxLength: 1700,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1700)
  descripcionLarga?: string;

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

  @IsString()
  @IsOptional()
  phoneNumbers?: string;

}
