import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import type { Request } from 'express';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { AuditLogService } from 'src/util/log-audit.service';
import { RectificarDatosDto } from './dto/rectificar-datos.dto';
import { SolicitarOposicionDto } from './dto/solicitar-oposicion.dto';

/** Días de gracia antes de anonimizar definitivamente tras una solicitud de cancelación. */
const DIAS_GRACIA_ELIMINACION = Number(
  process.env.DIAS_GRACIA_ELIMINACION_CUENTA ?? 30,
);

@Injectable()
export class ArcoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async obtenerMisDatos(idUsuario: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario: idUsuario },
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        correo: true,
        rol: true,
        estado: true,
        fecha_registro: true,
        fecha_actualizacion: true,
        fecha_solicitud_eliminacion: true,
        fecha_eliminacion_programada: true,
      },
    });

    if (!usuario) throw new NotFoundException('Usuario no encontrado.');
    return usuario;
  }

  async rectificarDatos(
    idUsuario: number,
    dto: RectificarDatosDto,
    req: Request,
  ) {
    if (dto.correo) {
      const correoUsado = await this.prisma.usuario.findFirst({
        where: { correo: dto.correo, id_usuario: { not: idUsuario } },
      });
      if (correoUsado) {
        throw new ConflictException(
          'El correo ya está en uso por otro usuario.',
        );
      }
    }

    const actualizado = await this.prisma.usuario.update({
      where: { id_usuario: idUsuario },
      data: { ...dto, fecha_actualizacion: new Date() },
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        correo: true,
        fecha_actualizacion: true,
      },
    });

    await this.auditLog.logAudit(
      req,
      'SOLICITAR_RECTIFICACION',
      'usuario',
      idUsuario,
      idUsuario,
    );

    return actualizado;
  }

  /** Bloqueo temporal: pasa a PENDIENTE_ELIMINACION. Desde ahí no puede loguear
   *  (AuthService.iniciarSesion exige estado === 'ACTIVO') y su refresh token
   *  queda invalidado de inmediato. La anonimización definitiva la hace el cron. */
  async solicitarCancelacion(idUsuario: number, req: Request) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario: idUsuario },
    });

    if (!usuario || usuario.estado === 'ELIMINADO') {
      throw new NotFoundException('Usuario no encontrado.');
    }
    if (usuario.estado === 'PENDIENTE_ELIMINACION') {
      throw new BadRequestException(
        'Ya existe una solicitud de cancelación en curso.',
      );
    }

    const ahora = new Date();
    const fechaProgramada = new Date(ahora);
    fechaProgramada.setDate(
      fechaProgramada.getDate() + DIAS_GRACIA_ELIMINACION,
    );

    await this.prisma.usuario.update({
      where: { id_usuario: idUsuario },
      data: {
        estado: 'PENDIENTE_ELIMINACION',
        refresh_token_hash: null,
        fecha_solicitud_eliminacion: ahora,
        fecha_eliminacion_programada: fechaProgramada,
      },
    });

    await this.auditLog.logAudit(
      req,
      'SOLICITAR_ELIMINACION_CUENTA',
      'usuario',
      idUsuario,
      idUsuario,
    );

    return {
      mensaje: `Solicitud registrada. Tus datos se eliminarán de forma definitiva el ${fechaProgramada.toISOString()} salvo que canceles la solicitud antes.`,
      fecha_eliminacion_programada: fechaProgramada,
    };
  }

  /** Revierte la solicitud de cancelación dentro del plazo de gracia. */
  async cancelarSolicitudEliminacion(idUsuario: number, req: Request) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario: idUsuario },
    });

    if (!usuario || usuario.estado !== 'PENDIENTE_ELIMINACION') {
      throw new BadRequestException(
        'No existe una solicitud de cancelación activa.',
      );
    }
    if (
      usuario.fecha_eliminacion_programada &&
      usuario.fecha_eliminacion_programada <= new Date()
    ) {
      throw new BadRequestException(
        'El plazo para revertir la cancelación ya venció.',
      );
    }

    await this.prisma.usuario.update({
      where: { id_usuario: idUsuario },
      data: {
        estado: 'ACTIVO',
        fecha_solicitud_eliminacion: null,
        fecha_eliminacion_programada: null,
      },
    });

    await this.auditLog.logAudit(
      req,
      'RESTAURAR_CUENTA',
      'usuario',
      3,
      idUsuario,
    );

    return {
      mensaje:
        'La solicitud de cancelación fue revertida. Tu cuenta está activa de nuevo.',
    };
  }

  async solicitarOposicion(
    idUsuario: number,
    dto: SolicitarOposicionDto,
    req: Request,
  ) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario: idUsuario },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado.');

    await this.auditLog.logAudit(
      req,
      'SOLICITAR_OPOSICION',
      'usuario',
      4,
      idUsuario,
    );

    return {
      mensaje:
        'Tu solicitud de oposición fue registrada y será atendida en un plazo máximo de 20 días hábiles.',
      motivo: dto.motivo,
    };
  }

  anonimizarUsuario(idUsuario: number) {
    const sufijo = crypto.randomBytes(4).toString('hex');
    return this.prisma.usuario.update({
      where: { id_usuario: idUsuario },
      data: {
        nombre: 'Usuario',
        apellido: 'Eliminado',
        correo: `eliminado_${idUsuario}_${sufijo}@anonimizado.local`,
        password_hash: crypto.randomBytes(32).toString('hex'), // login imposible
        refresh_token_hash: null,
        estado: 'ELIMINADO',
      },
    });
  }

  obtenerPendientesDeAnonimizar() {
    return this.prisma.usuario.findMany({
      where: {
        estado: 'PENDIENTE_ELIMINACION',
        fecha_eliminacion_programada: { lte: new Date() },
      },
      select: { id_usuario: true },
    });
  }
}
