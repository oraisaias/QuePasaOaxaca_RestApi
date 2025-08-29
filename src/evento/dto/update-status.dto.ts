import { IsEnum, IsNotEmpty } from 'class-validator';
import { EventStatus } from '../entities/evento.entity';

export class UpdateStatusDto {
  @IsNotEmpty()
  @IsEnum(EventStatus, {
    message:
      'Status debe ser uno de los siguientes valores: draft, published, archived, expired',
  })
  status: EventStatus;
}
