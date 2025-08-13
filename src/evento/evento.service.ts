import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evento } from './entities/evento.entity';
import { EventoCategoria } from './entities/evento-categoria.entity';

@Injectable()
export class EventoService {
  constructor(
    @InjectRepository(Evento)
    private eventoRepository: Repository<Evento>,
    @InjectRepository(EventoCategoria)
    private eventoCategoriaRepository: Repository<EventoCategoria>,
  ) {}
}
