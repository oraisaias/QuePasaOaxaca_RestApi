import { IsEnum } from 'class-validator';
import { EventStatus } from '../entities/evento.entity';

export class UpdateStatusDto {
  @IsEnum(EventStatus, {
    message: 'Status debe ser uno de: draft, published, archived, expired',
  })
  status: EventStatus;
}
