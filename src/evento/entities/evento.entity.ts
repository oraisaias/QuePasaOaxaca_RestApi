import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { EventoCategoria } from './evento-categoria.entity';
import { UserFavorite } from '../../favorite/entities/user-favorite.entity';
import { DeviceFavorite } from '../../favorite/entities/device-favorite.entity';

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  EXPIRED = 'expired',
}

@Entity('eventos')
export class Evento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  titulo: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column({ name: 'imagen_url', nullable: true })
  imagenUrl: string;

  @Column({ name: 'fecha_inicio', type: 'timestamptz' })
  fechaInicio: Date;

  @Column({ name: 'fecha_fin', type: 'timestamptz', nullable: true })
  fechaFin: Date;

  @Column({ type: 'numeric', precision: 9, scale: 6, nullable: true })
  lat: number;

  @Column({ type: 'numeric', precision: 9, scale: 6, nullable: true })
  lng: number;

  @Column({ name: 'direccion_texto', nullable: true })
  direccionTexto: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  precio: number;

  @Column({ name: 'enlace_externo', nullable: true })
  enlaceExterno: string;

  @Column({
    type: 'enum',
    enum: EventStatus,
    enumName: 'event_status',
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  @Column({ default: false })
  active: boolean;

  @Column({ name: 'is_recurrent', default: false })
  isRecurrent: boolean;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt: Date;

  @Column({
    name: 'geom',
    type: 'geometry',
    nullable: true,
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  geom: any;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  user: User;

  @OneToMany(() => EventoCategoria, (eventoCategoria) => eventoCategoria.evento)
  eventoCategorias: EventoCategoria[];

  @OneToMany(() => UserFavorite, (userFavorite) => userFavorite.evento)
  userFavorites: UserFavorite[];

  @OneToMany(() => DeviceFavorite, (deviceFavorite) => deviceFavorite.evento)
  deviceFavorites: DeviceFavorite[];
}
