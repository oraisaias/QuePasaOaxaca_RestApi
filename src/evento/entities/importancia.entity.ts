import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Evento } from './evento.entity';

@Entity('importancia')
export class Importancia {
  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 50 })
  nombre: string;

  @OneToMany(() => Evento, (evento) => evento.importancia)
  eventos: Evento[];
}
