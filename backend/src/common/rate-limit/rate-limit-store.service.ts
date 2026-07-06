import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

interface IntentoAuth {
  intentos: number;
  bloqueadoHasta: number | null;
}

interface ContadorInterno {
  cantidad: number;
  ventanaInicio: number;
}

/**
 * Almacén en memoria para RNF-02 (Límite de peticiones).
 *
 * - intentosAuth: lleva el conteo de intentos fallidos de login por IP.
 *   Al llegar al límite, bloquea la IP durante un tiempo determinado.
 * - contadoresInternos: lleva el conteo de peticiones internas por
 *   usuario + recurso dentro de una ventana deslizante de tiempo.
 *
 * Nota: al ser en memoria, el conteo se reinicia si el backend se reinicia
 * y no se comparte entre múltiples instancias. Para un despliegue con
 * varias réplicas del backend, esto debería moverse a Redis.
 */
@Injectable()
export class RateLimitStoreService {
  private readonly intentosAuth = new Map<string, IntentoAuth>();
  private readonly contadoresInternos = new Map<string, ContadorInterno>();

  private readonly LIMITE_INTENTOS_AUTH = 5;
  private readonly DURACION_BLOQUEO_MS = 10 * 60 * 1000; // 10 minutos

  private readonly LIMITE_PETICIONES_INTERNAS = 8;
  private readonly VENTANA_INTERNA_MS = 60 * 1000; // 1 minuto (supuesto, no especificado en el issue)

  // ---------- Peticiones de autenticación ----------

  /**
   * Indica si la IP está bloqueada actualmente. Si el bloqueo ya expiró,
   * limpia el registro y la considera desbloqueada.
   */
  estaBloqueada(ip: string): { bloqueada: boolean; minutosRestantes?: number } {
    const registro = this.intentosAuth.get(ip);
    if (!registro || !registro.bloqueadoHasta) {
      return { bloqueada: false };
    }

    if (Date.now() >= registro.bloqueadoHasta) {
      this.intentosAuth.delete(ip);
      return { bloqueada: false };
    }

    const minutosRestantes = Math.ceil(
      (registro.bloqueadoHasta - Date.now()) / 60000,
    );
    return { bloqueada: true, minutosRestantes };
  }

  registrarIntentoFallido(ip: string): void {
    const registro = this.intentosAuth.get(ip) ?? {
      intentos: 0,
      bloqueadoHasta: null,
    };

    registro.intentos += 1;

    if (registro.intentos >= this.LIMITE_INTENTOS_AUTH) {
      registro.bloqueadoHasta = Date.now() + this.DURACION_BLOQUEO_MS;
    }

    this.intentosAuth.set(ip, registro);
  }

  registrarIntentoExitoso(ip: string): void {
    this.intentosAuth.delete(ip);
  }

  // ---------- Peticiones internas ----------

  /**
   * Registra una petición interna de un usuario a un recurso.
   * Retorna true si con esta petición se superó el límite permitido
   * dentro de la ventana vigente.
   */
  registrarPeticionInterna(idUsuario: number, recurso: string): boolean {
    const clave = `${idUsuario}:${recurso}`;
    const ahora = Date.now();
    const registro = this.contadoresInternos.get(clave);

    if (!registro || ahora - registro.ventanaInicio > this.VENTANA_INTERNA_MS) {
      this.contadoresInternos.set(clave, { cantidad: 1, ventanaInicio: ahora });
      return false;
    }

    registro.cantidad += 1;
    this.contadoresInternos.set(clave, registro);

    return registro.cantidad > this.LIMITE_PETICIONES_INTERNAS;
  }

  limpiarContadorInterno(idUsuario: number, recurso: string): void {
    this.contadoresInternos.delete(`${idUsuario}:${recurso}`);
  }

  // ---------- Limpieza periódica ----------

  @Cron(CronExpression.EVERY_5_MINUTES)
  limpiarExpirados(): void {
    const ahora = Date.now();

    for (const [ip, registro] of this.intentosAuth.entries()) {
      if (registro.bloqueadoHasta && ahora >= registro.bloqueadoHasta) {
        this.intentosAuth.delete(ip);
      }
    }

    for (const [clave, registro] of this.contadoresInternos.entries()) {
      if (ahora - registro.ventanaInicio > this.VENTANA_INTERNA_MS) {
        this.contadoresInternos.delete(clave);
      }
    }
  }
}
