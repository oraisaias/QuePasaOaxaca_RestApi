import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Evento } from '../../evento/entities/evento.entity';
import { UserFavorite } from '../../favorite/entities/user-favorite.entity';
import { Role } from './role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'citext', unique: true, nullable: true })
  email: string;

  @Column({ name: 'password_hash', nullable: true })
  passwordHash: string;

  @Column({ name: 'device_id', unique: true, nullable: true })
  deviceId: string;

  @Column({ name: 'role_id' })
  roleId: string;

  @ManyToOne(() => Role, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Evento, (evento) => evento.user)
  eventos: Evento[];

  @OneToMany(() => UserFavorite, (userFavorite) => userFavorite.user)
  userFavorites: UserFavorite[];
}
