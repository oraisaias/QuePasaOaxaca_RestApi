import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evento } from './entities/evento.entity';
import { EventoCategoria } from './entities/evento-categoria.entity';
import { Categoria } from '../categoria/entities/categoria.entity';
import { Importancia } from './entities/importancia.entity';
import { Recurrencia } from './entities/recurrencia.entity';
import { EventoService } from './evento.service';
import { EventoController } from './evento.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Evento,
      EventoCategoria,
      Categoria,
      Importancia,
      Recurrencia,
    ]),
  ],
  controllers: [EventoController],
  providers: [EventoService],
  exports: [EventoService],
})
export class EventoModule {}
