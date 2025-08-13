import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Evento } from './evento.entity';
import { Categoria } from '../../categoria/entities/categoria.entity';

@Entity('evento_categorias')
export class EventoCategoria {
  @PrimaryColumn({ name: 'evento_id' })
  eventoId: string;

  @PrimaryColumn({ name: 'categoria_id' })
  categoriaId: string;

  @ManyToOne(() => Evento, (evento) => evento.eventoCategorias, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'evento_id' })
  evento: Evento;

  @ManyToOne(() => Categoria, (categoria) => categoria.eventoCategorias, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria;
}
