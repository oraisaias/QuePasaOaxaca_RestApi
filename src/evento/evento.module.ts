import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evento } from './entities/evento.entity';
import { EventoCategoria } from './entities/evento-categoria.entity';
import { EventoService } from './evento.service';
import { EventoController } from './evento.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Evento, EventoCategoria])],
  controllers: [EventoController],
  providers: [EventoService],
  exports: [EventoService],
})
export class EventoModule {}
