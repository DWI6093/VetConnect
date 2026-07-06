import type { Request } from 'express';

/**
 * Extrae la IP real del cliente, considerando el header x-forwarded-for
 * cuando la aplicación está detrás de un proxy/balanceador.
 */
export function obtenerIpSolicitud(solicitud: Request): string {
  const forwardedFor = solicitud.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }
  return solicitud.ip || solicitud.socket.remoteAddress || 'desconocida';
}