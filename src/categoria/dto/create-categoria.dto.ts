import { IsString, IsOptional, MinLength, IsNotEmpty } from 'class-validator';

export class CreateCategoriaDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  nombre: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  descripcion?: string;
}
