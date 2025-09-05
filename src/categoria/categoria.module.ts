import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';
import { CategoriaService } from './categoria.service';
import { CategoriaController } from './categoria.controller';
import { Importancia } from 'src/evento/entities/importancia.entity';
import { Recurrencia } from 'src/evento/entities/recurrencia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Categoria, Importancia, Recurrencia])],
  controllers: [CategoriaController],
  providers: [CategoriaService],
  exports: [CategoriaService],
})
export class CategoriaModule {}
