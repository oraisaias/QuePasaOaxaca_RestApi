import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class CmsAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    // Verificar si viene el header Authorization
    if (!authHeader) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Token de autorización requerido',
        error: 'Unauthorized',
        details:
          'Debe incluir el header Authorization con el formato: Bearer <token>',
      });
    }

    // Verificar si el formato es correcto (Bearer token)
    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Formato de token inválido',
        error: 'Unauthorized',
        details: 'El token debe tener el formato: Bearer <token>',
      });
    }

    return super.canActivate(context);
  }

  handleRequest(
    err: any,
    user: { role: string },
    info: { message: string },
  ): any {
    if (err || !user) {
      // Si hay un error específico de JWT
      if (info && info.message) {
        throw new UnauthorizedException({
          statusCode: 401,
          message: 'Token inválido o expirado',
          error: 'Unauthorized',
          details: info.message,
        });
      }

      // Error genérico
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'No autorizado para acceder a este recurso',
        error: 'Unauthorized',
        details: 'Verifique que su token sea válido y no haya expirado',
      });
    }

    // Verificar que el usuario sea administrador
    if (user.role !== 'admin') {
      throw new UnauthorizedException({
        statusCode: 403,
        message: 'Acceso denegado',
        error: 'Forbidden',
        details: 'Este endpoint solo está disponible para administradores',
      });
    }

    return user;
  }
}
