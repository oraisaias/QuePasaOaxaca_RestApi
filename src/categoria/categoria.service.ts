import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { CategoriaResponseDto } from './dto/categoria-response.dto';
import { Importancia } from '../evento/entities/importancia.entity';
import { Recurrencia } from '../evento/entities/recurrencia.entity';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectRepository(Categoria)
    private categoriaRepository: Repository<Categoria>,
    @InjectRepository(Importancia)
    private importanciaRepository: Repository<Importancia>,
    @InjectRepository(Recurrencia)
    private recurrenciaRepository: Repository<Recurrencia>,
  ) {}

  async create(createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    // Verificar si ya existe una categoría con el mismo nombre
    const existingCategoria = await this.categoriaRepository.findOne({
      where: { nombre: createCategoriaDto.nombre },
      select: ['id', 'nombre'],
    });

    if (existingCategoria) {
      throw new ConflictException(
        `Ya existe una categoría con el nombre "${createCategoriaDto.nombre}"`,
      );
    }

    const categoria = this.categoriaRepository.create(createCategoriaDto);
    return await this.categoriaRepository.save(categoria);
  }

  async findAll(): Promise<CategoriaResponseDto[]> {
    const categorias = await this.categoriaRepository.find({
      select: ['id', 'nombre'],
    });

    return categorias.map((categoria) => ({
      id: categoria.id,
      nombre: categoria.nombre,
    }));
  }

  async update(
    id: string,
    updateCategoriaDto: UpdateCategoriaDto,
  ): Promise<CategoriaResponseDto> {
    // Buscar la categoría por su ID
    const categoria = await this.categoriaRepository.findOne({
      where: { id },
      select: ['id', 'nombre', 'descripcion'],
    });

    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Actualizar campos de la categoría
    if (updateCategoriaDto.nombre !== undefined) {
      // Verificar si ya existe otra categoría con el mismo nombre
      const existingCategoria = await this.categoriaRepository.findOne({
        where: { nombre: updateCategoriaDto.nombre },
        select: ['id', 'nombre'],
      });

      if (existingCategoria && existingCategoria.id !== id) {
        throw new ConflictException(
          `Ya existe una categoría con el nombre "${updateCategoriaDto.nombre}"`,
        );
      }

      categoria.nombre = updateCategoriaDto.nombre;
    }
    if (updateCategoriaDto.descripcion !== undefined) {
      categoria.descripcion = updateCategoriaDto.descripcion;
    }

    // Guardar la categoría actualizada
    const updatedCategoria = await this.categoriaRepository.save(categoria);

    return {
      id: updatedCategoria.id,
      nombre: updatedCategoria.nombre,
    };
  }

  async remove(id: string): Promise<void> {
    // Buscar la categoría por su ID
    const categoria = await this.categoriaRepository.findOne({
      where: { id },
      select: ['id'],
    });

    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Eliminar la categoría
    await this.categoriaRepository.remove(categoria);
  }

  getImportanciaValues = async (): Promise<{ label: string }[]> =>
    (await this.importanciaRepository.find()).map(({ nombre }) => ({
      label: nombre,
    }));

  getRecurrenciaValues = async (): Promise<{ label: string }[]> =>
    (await this.recurrenciaRepository.find()).map(({ nombre }) => ({
      label: nombre,
    }));
}
