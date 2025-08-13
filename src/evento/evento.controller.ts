import { Controller } from '@nestjs/common';
import { EventoService } from './evento.service';

@Controller('eventos')
export class EventoController {
  constructor(private readonly eventoService: EventoService) {}
}
