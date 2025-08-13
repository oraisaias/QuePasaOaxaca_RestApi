import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserFavorite } from './entities/user-favorite.entity';
import { DeviceFavorite } from './entities/device-favorite.entity';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(UserFavorite)
    private userFavoriteRepository: Repository<UserFavorite>,
    @InjectRepository(DeviceFavorite)
    private deviceFavoriteRepository: Repository<DeviceFavorite>,
  ) {}
}
