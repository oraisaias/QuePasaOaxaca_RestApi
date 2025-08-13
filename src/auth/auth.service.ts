import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  login(loginDto: LoginDto): LoginResponseDto {
    // Usuario admin hardcodeado temporalmente
    const adminUser = {
      id: 'admin-root-id',
      email: 'admin@quepasaoaxaca.com',
      password: 'admin123', // En producción esto debería estar hasheado
      role: 'admin',
    };

    // Verificar credenciales
    if (
      loginDto.email === adminUser.email &&
      loginDto.password === adminUser.password
    ) {
      // Generar token JWT
      const payload = {
        email: adminUser.email,
        sub: adminUser.id,
        role: adminUser.role,
      };

      const access_token = this.jwtService.sign(payload);

      return {
        access_token,
        user: {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
        },
      };
    }

    throw new UnauthorizedException('Credenciales inválidas');
  }
}
