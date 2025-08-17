import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateCategoriaDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  nombre?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  descripcion?: string;
}
