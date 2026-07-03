import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../database/prisma.service';
import { accion_auditoria } from '@prisma/client';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async logAudit(
    req: Request,
    accion: accion_auditoria,
    entidad: string,
    entidad_id: number | null,
    id_usuario?: number,
  ) {
    try {
      await this.prisma.log_auditoria.create({
        data: {
          id_usuario: id_usuario ?? entidad_id ?? undefined,
          accion,
          entidad_afectada: entidad,
          id_entidad: entidad_id,
          ip: req.ip || req.socket.remoteAddress,
          user_agent: req.headers['user-agent'],
        },
      });
    } catch (err) {
      console.error('Error al guardar auditoría:', err);
    }
  }
}
