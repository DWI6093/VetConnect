import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CrearColaboradorDto } from './dto/crear-colaborador.dto';
import { ActualizarColaboradorDto } from './dto/actualizar-colaborador.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ColaboradoresService {
  constructor(private readonly prismaService: PrismaService) {}

  async crear(crearColaboradorDto: CrearColaboradorDto) {
    const { nombre, apellido, correo, password } = crearColaboradorDto;

    const correoExiste = await this.prismaService.usuario.findUnique({
      where: { correo },
    });

    if (correoExiste) {
      throw new ConflictException('El correo ya está registrado.');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    return this.prismaService.usuario.create({
      data: {
        nombre,
        apellido,
        correo,
        password_hash: passwordHash,
        rol: 'COLABORADOR',
        estado: 'ACTIVO',
      },
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        correo: true,
        rol: true,
        estado: true,
        fecha_registro: true,
      },
    });
  }

  async obtenerTodos() {
    return this.prismaService.usuario.findMany({
      where: {
        rol: 'COLABORADOR',
        estado: {
          not: 'ELIMINADO',
        },
      },
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        correo: true,
        rol: true,
        estado: true,
        fecha_registro: true,
      },
    });
  }

  async obtenerPorId(id_usuario: number) {
    const colaborador = await this.prismaService.usuario.findFirst({
      where: {
        id_usuario,
        rol: 'COLABORADOR',
        estado: {
          not: 'ELIMINADO',
        },
      },
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        correo: true,
        rol: true,
        estado: true,
        fecha_registro: true,
      },
    });

    if (!colaborador) {
      throw new NotFoundException(
        `Colaborador con ID ${id_usuario} no encontrado.`,
      );
    }

    return colaborador;
  }

  async actualizar(
    id_usuario: number,
    actualizarColaboradorDto: ActualizarColaboradorDto,
  ) {
    // Validar existencia
    await this.obtenerPorId(id_usuario);

    const { nombre, apellido, correo, password, estado } =
      actualizarColaboradorDto;

    if (correo) {
      const correoExiste = await this.prismaService.usuario.findFirst({
        where: {
          correo,
          id_usuario: { not: id_usuario },
        },
      });
      if (correoExiste) {
        throw new ConflictException('El correo ya ha sido registrado.');
      }
    }

    const datosActualizados: any = {};
    if (nombre !== undefined) datosActualizados.nombre = nombre;
    if (apellido !== undefined) datosActualizados.apellido = apellido;
    if (correo !== undefined) datosActualizados.correo = correo;
    if (estado !== undefined) datosActualizados.estado = estado;

    if (password) {
      const salt = await bcrypt.genSalt();
      datosActualizados.password_hash = await bcrypt.hash(password, salt);
    }

    datosActualizados.fecha_actualizacion = new Date();

    return this.prismaService.usuario.update({
      where: { id_usuario },
      data: datosActualizados,
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        correo: true,
        rol: true,
        estado: true,
        fecha_registro: true,
        fecha_actualizacion: true,
      },
    });
  }

  async eliminar(id_usuario: number) {
    await this.obtenerPorId(id_usuario);

    // soft delete
    return this.prismaService.usuario.update({
      where: { id_usuario },
      data: {
        estado: 'ELIMINADO',
        fecha_eliminacion_programada: new Date(),
      },
      select: {
        id_usuario: true,
        estado: true,
      },
    });
  }
}
