import { DataSource } from 'typeorm';
import { User } from './user/entities/user.entity';
import { Categoria } from './categoria/entities/categoria.entity';
import { Evento } from './evento/entities/evento.entity';
import { EventoCategoria } from './evento/entities/evento-categoria.entity';
import { UserFavorite } from './favorite/entities/user-favorite.entity';
import { DeviceFavorite } from './favorite/entities/device-favorite.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'postgres',
  entities: [
    User,
    Categoria,
    Evento,
    EventoCategoria,
    UserFavorite,
    DeviceFavorite,
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
