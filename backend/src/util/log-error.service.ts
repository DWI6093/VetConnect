import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ErrorLogService {
  constructor(private readonly prisma: PrismaService) {}

  async logError(
    req: Request,
    error: any,
    modulo: string,
    id_usuario?: number,
  ) {
    try {
      await this.prisma.log_errores.create({
        data: {
          modulo,
          mensaje: error.message || 'Error desconocido',
          stacktrace: JSON.stringify(error, Object.getOwnPropertyNames(error)),
          ip: req.ip || req.socket.remoteAddress,
          id_usuario: id_usuario || null,
        },
      });
    } catch (logErr) {
      console.error('Error al guardar log:', logErr);
    }
  }
}
