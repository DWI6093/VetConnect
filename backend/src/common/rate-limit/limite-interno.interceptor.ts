import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { AuthService } from '../../modules/auth/auth.service';
import { RateLimitStoreService } from './rate-limit-store.service';

/**
 * RNF-02: para peticiones internas (usuario ya autenticado), si se supera
 * el límite de solicitudes a un mismo recurso, el sistema cierra la
 * sesión del usuario automáticamente.
 *
 * Solo actúa sobre rutas protegidas por GuardAutenticacion, ya que
 * depende de `solicitud.usuario` (el payload que ese guard adjunta).
 * Las rutas públicas o de autenticación (login/registro/refresh) no
 * pasan por este interceptor porque no tienen `usuario` en la solicitud.
 */
@Injectable()
export class LimiteInternoInterceptor implements NestInterceptor {
  constructor(
    private readonly store: RateLimitStoreService,
    private readonly authService: AuthService,
  ) {}

  async intercept(
    contexto: ExecutionContext,
    siguiente: CallHandler,
  ): Promise<Observable<unknown>> {
    const solicitud = contexto.switchToHttp().getRequest<Request>();
    const usuario = (solicitud as any).usuario;

    if (usuario?.id_usuario) {
      const recurso = `${solicitud.method}:${solicitud.route?.path ?? solicitud.path}`;
      const excedido = this.store.registrarPeticionInterna(
        usuario.id_usuario,
        recurso,
      );

      if (excedido) {
        const respuesta = contexto.switchToHttp().getResponse<Response>();

        await this.authService.cerrarSesion(solicitud, usuario.id_usuario);
        respuesta.clearCookie('jwt_token', { path: '/' });
        respuesta.clearCookie('refresh_token', { path: '/' });

        throw new HttpException(
          'Se superó el límite de peticiones a este recurso. Su sesión ha sido cerrada.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    return siguiente.handle();
  }
}