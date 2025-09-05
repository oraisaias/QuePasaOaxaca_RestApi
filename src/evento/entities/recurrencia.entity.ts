import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Evento } from './evento.entity';

@Entity('recurrencia')
export class Recurrencia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  nombre: string;

  @OneToMany(() => Evento, (evento) => evento.recurrencia)
  eventos: Evento[];
}
