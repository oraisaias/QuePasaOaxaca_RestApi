import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role, RoleName } from './entities/role.entity';
import { BannedUser } from './entities/banned-user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(BannedUser)
    private bannedUserRepository: Repository<BannedUser>,
  ) {}

  async findOrCreateAppUser(deviceId: string): Promise<User> {
    // Verificar si el usuario ya existe
    let user = await this.userRepository.findOne({
      where: { deviceId },
      relations: ['role'],
    });

    if (user) {
      // Verificar si el usuario está prohibido
      const bannedUser = await this.bannedUserRepository.findOne({
        where: { userId: user.id },
      });

      if (bannedUser) {
        throw new ForbiddenException(`Usuario prohibido: ${bannedUser.reason}`);
      }

      return user;
    }

    // Obtener el rol app_user
    const appUserRole = await this.roleRepository.findOne({
      where: { name: RoleName.APP_USER },
    });

    if (!appUserRole) {
      throw new NotFoundException('Rol app_user no encontrado');
    }

    // Crear nuevo usuario
    user = this.userRepository.create({
      deviceId,
      roleId: appUserRole.id,
    });

    const savedUser = await this.userRepository.save(user);
    // Cargar la relación role para el usuario recién creado
    const userWithRole = await this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['role'],
    });

    if (!userWithRole) {
      throw new Error('Error al cargar el usuario recién creado');
    }

    return userWithRole;
  }

  async banUser(
    userId: string,
    reason: string,
    bannedBy?: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar si ya está prohibido
    const existingBan = await this.bannedUserRepository.findOne({
      where: { userId },
    });

    if (existingBan) {
      throw new ForbiddenException('Usuario ya está prohibido');
    }

    // Crear registro de usuario prohibido
    const bannedUser = this.bannedUserRepository.create({
      userId,
      reason,
      bannedBy,
    });

    await this.bannedUserRepository.save(bannedUser);
  }

  async unbanUser(userId: string): Promise<void> {
    const bannedUser = await this.bannedUserRepository.findOne({
      where: { userId },
    });

    if (!bannedUser) {
      throw new NotFoundException('Usuario no está prohibido');
    }

    await this.bannedUserRepository.remove(bannedUser);
  }
}
