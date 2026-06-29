import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class GuardAutenticacion implements CanActivate {
  constructor(private readonly servicioAuth: AuthService) {}

  canActivate(contexto: ExecutionContext): boolean {
    const solicitud = contexto.switchToHttp().getRequest();
    const token = this.extraerToken(solicitud);

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const cargaUtil = this.servicioAuth.validarTokenAcceso(token);
    solicitud['usuario'] = cargaUtil;
    return true;
  }

  /**
   * Extrae el token de acceso priorizando la cookie HttpOnly.
   * Como fallback acepta el header Authorization: Bearer <token>
   * para mantener compatibilidad con clientes que no usan cookies.
   */
  private extraerToken(solicitud: any): string | undefined {
    // 1. Leer de la cookie HttpOnly (mecanismo principal)
    if (solicitud.cookies?.jwt_token) {
      return solicitud.cookies.jwt_token;
    }

    // 2. Fallback: header Authorization Bearer
    const cabeceraAutorizacion = solicitud.headers.authorization;
    if (cabeceraAutorizacion) {
      const [tipo, token] = cabeceraAutorizacion.split(' ');
      return tipo === 'Bearer' ? token : undefined;
    }

    return undefined;
  }
}
