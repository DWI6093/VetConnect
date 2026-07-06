import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { RateLimitStoreService } from './rate-limit-store.service';
import { obtenerIpSolicitud } from './obtener-ip.util';

/**
 * RNF-02: bloquea la IP del usuario si supera el límite de intentos
 * fallidos de autenticación (5), impidiéndole realizar peticiones
 * durante 10 minutos.
 *
 * Este guard solo verifica el bloqueo antes de procesar la petición.
 * El registro de intentos fallidos/exitosos se hace en el controlador,
 * ya que depende del resultado del login.
 */
@Injectable()
export class LimiteAutenticacionGuard implements CanActivate {
  constructor(private readonly store: RateLimitStoreService) {}

  canActivate(contexto: ExecutionContext): boolean {
    const solicitud = contexto.switchToHttp().getRequest<Request>();
    const ip = obtenerIpSolicitud(solicitud);

    const { bloqueada, minutosRestantes } = this.store.estaBloqueada(ip);

    if (bloqueada) {
      throw new HttpException(
        `Demasiados intentos fallidos. Intente nuevamente en ${minutosRestantes} minuto(s).`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}