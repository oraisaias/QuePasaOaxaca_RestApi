import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Evento } from '../../evento/entities/evento.entity';

@Entity('device_favorites')
export class DeviceFavorite {
  @PrimaryColumn({ name: 'device_id' })
  deviceId: string;

  @PrimaryColumn({ name: 'event_id' })
  eventId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Evento, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  evento: Evento;
}
