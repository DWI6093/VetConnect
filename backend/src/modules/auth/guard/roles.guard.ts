import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(contexto: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [contexto.getHandler(), contexto.getClass()],
    );

    if (!rolesRequeridos || rolesRequeridos.length === 0) {
      throw new ForbiddenException(
        'No tienes permisos suficientes para acceder a este recurso.',
      );
    }

    const solicitud = contexto.switchToHttp().getRequest();
    const usuario = solicitud.usuario; // seteado por GuardAutenticacion

    if (!usuario || !rolesRequeridos.includes(usuario.rol)) {
      throw new ForbiddenException(
        'No tienes permisos suficientes para acceder a este recurso.',
      );
    }

    return true;
  }
}
