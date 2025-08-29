import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { AppLoginDto } from './dto/app-login.dto';
import { AppLoginResponseDto } from './dto/app-login-response.dto';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private userService: UserService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    // Buscar usuario en la base de datos
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token JWT
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role.name,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role.name,
      },
    };
  }

  async appLogin(appLoginDto: AppLoginDto): Promise<AppLoginResponseDto> {
    // Buscar o crear usuario de la app
    const user = await this.userService.findOrCreateAppUser(
      appLoginDto.deviceId,
    );

    // Generar token JWT
    const payload = {
      deviceId: user.deviceId,
      sub: user.id,
      role: user.role.name,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        deviceId: user.deviceId,
        role: user.role.name,
      },
      message:
        user.createdAt === user.updatedAt
          ? 'Usuario creado y autenticado exitosamente'
          : 'Usuario autenticado exitosamente',
    };
  }
}
