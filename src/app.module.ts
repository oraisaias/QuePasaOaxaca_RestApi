import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { CategoriaModule } from './categoria/categoria.module';
import { EventoModule } from './evento/evento.module';
import { FavoriteModule } from './favorite/favorite.module';
import { AuthModule } from './auth/auth.module';
import { User } from './user/entities/user.entity';
import { Categoria } from './categoria/entities/categoria.entity';
import { Evento } from './evento/entities/evento.entity';
import { EventoCategoria } from './evento/entities/evento-categoria.entity';
import { UserFavorite } from './favorite/entities/user-favorite.entity';
import { DeviceFavorite } from './favorite/entities/device-favorite.entity';

const DBModule = TypeOrmModule.forRoot({
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
  synchronize: true,
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DBModule,
    UserModule,
    CategoriaModule,
    EventoModule,
    FavoriteModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
