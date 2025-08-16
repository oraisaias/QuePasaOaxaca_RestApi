import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { CategoriaResponseDto } from './dto/categoria-response.dto';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectRepository(Categoria)
    private categoriaRepository: Repository<Categoria>,
  ) {}

  async create(createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
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
}
