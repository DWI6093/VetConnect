import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../../database/prisma.service';
import { CrearClienteDto } from '../usuarios/dto/crear-cliente.dto';
import { CrearColaboradorDto } from '../usuarios/dto/crear-colaborador.dto';
import { InicioSesionDto } from '../usuarios/dto/inicio-sesion.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AuditLogService } from 'src/util/log-audit.service';
import { ErrorLogService } from 'src/util/log-error.service';

interface CargaUtilToken {
  id_usuario: number;
  correo: string;
  rol: string;
  nombre: string;
  apellido: string;
}

export interface ParDeTokens {
  token: string;
  refresh_token: string;
}

@Injectable()
export class AuthService {
  private readonly claveSecretaJwt: string;
  private readonly claveSecretaRefresh: string;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly auditLog: AuditLogService,
    private readonly errorLog: ErrorLogService,
  ) {
    const jwt = process.env.JWT_SECRET;
    const refresh = process.env.REFRESH_SECRET;
    if (!jwt) throw new Error('Variable de entorno JWT_SECRET no configurada');
    if (!refresh) throw new Error('Variable de entorno REFRESH_SECRET no configurada');
    this.claveSecretaJwt = jwt;
    this.claveSecretaRefresh = refresh;
  }

  /**
   * Genera un token firmado con un tiempo de expiración determinado.
   */
  private generarTokenFirma(cargaUtil: any, duracionSegundos: number, secreto: string): string {
    const cabecera = Buffer.from(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
    ).toString('base64url');

    const tiempoActual = Math.floor(Date.now() / 1000);
    const payloadCompleto = {
      ...cargaUtil,
      iat: tiempoActual,
      exp: tiempoActual + duracionSegundos,
    };

    const carga = Buffer.from(JSON.stringify(payloadCompleto)).toString(
      'base64url',
    );

    const firma = crypto
      .createHmac('sha256', secreto)
      .update(`${cabecera}.${carga}`)
      .digest('base64url');

    return `${cabecera}.${carga}.${firma}`;
  }

  /**
   * Verifica la validez y expiración de un token JWT firmado.
   */
  private verificarToken(token: string, secreto: string): any {
    try {
      const partes = token.split('.');
      if (partes.length !== 3) {
        throw new UnauthorizedException('Token malformado');
      }

      const [cabecera, carga, firma] = partes;
      const firmaEsperada = crypto
        .createHmac('sha256', secreto)
        .update(`${cabecera}.${carga}`)
        .digest('base64url');

      if (firma !== firmaEsperada) {
        throw new UnauthorizedException('Token modificado');
      }

      const payload = JSON.parse(
        Buffer.from(carga, 'base64url').toString('utf8'),
      );
      const tiempoActual = Math.floor(Date.now() / 1000);

      if (payload.exp && tiempoActual > payload.exp) {
        throw new UnauthorizedException('El token ha expirado');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token inválido');
    }
  }

  /**
   * Valida el token de acceso provisto (usado por el guardián).
   */
  validarTokenAcceso(token: string): any {
    return this.verificarToken(token, this.claveSecretaJwt);
  }

  /**
   * Genera el par de tokens de acceso (10 minutos) y refresco (7 días).
   */
  private generarParDeTokens(carga: CargaUtilToken): ParDeTokens {
    const token = this.generarTokenFirma(carga, 10 * 60, this.claveSecretaJwt); // 10 minutos
    const refresh_token = this.generarTokenFirma(
      { id_usuario: carga.id_usuario },
      7 * 24 * 60 * 60,
      this.claveSecretaRefresh,
    ); // 7 días
    return { token, refresh_token };
  }

  /**
   * Registra un nuevo cliente e inicia sesión generando los tokens correspondientes.
   * El controlador es responsable de establecer las cookies HttpOnly.
   */
  async registrarCliente(
    crearClienteDto: CrearClienteDto,
  ): Promise<ParDeTokens> {
    const { nombre, apellido, correo, password } = crearClienteDto;

    const correoExiste = await this.prismaService.usuario.findUnique({
      where: { correo },
    });

    if (correoExiste) {
      throw new ConflictException('El correo electrónico ya está registrado.');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const nuevoUsuario = await this.prismaService.usuario.create({
      data: {
        nombre,
        apellido,
        correo,
        password_hash: passwordHash,
        rol: 'CLIENTE',
        estado: 'ACTIVO',
      },
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        correo: true,
        rol: true,
      },
    });

    const tokens = this.generarParDeTokens({
      id_usuario: nuevoUsuario.id_usuario,
      correo: nuevoUsuario.correo,
      rol: nuevoUsuario.rol,
      nombre: nuevoUsuario.nombre,
      apellido: nuevoUsuario.apellido,
    });

    // Guardar el hash del refresh token en la bd
    const refreshTokenHash = await bcrypt.hash(tokens.refresh_token, salt);
    await this.prismaService.usuario.update({
      where: { id_usuario: nuevoUsuario.id_usuario },
      data: { refresh_token_hash: refreshTokenHash },
    });

    return tokens;
  }

  /**
   * Registra un nuevo colaborador e inicia sesión generando los tokens correspondientes.
   * El controlador es responsable de establecer las cookies HttpOnly.
   */
  async registrarColaborador(
    crearColaboradorDto: CrearColaboradorDto,
  ): Promise<ParDeTokens> {
    const { nombre, apellido, correo, password } = crearColaboradorDto;

    const correoExiste = await this.prismaService.usuario.findUnique({
      where: { correo },
    });

    if (correoExiste) {
      throw new ConflictException('El correo electrónico ya está registrado.');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const nuevoUsuario = await this.prismaService.usuario.create({
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
      },
    });

    const tokens = this.generarParDeTokens({
      id_usuario: nuevoUsuario.id_usuario,
      correo: nuevoUsuario.correo,
      rol: nuevoUsuario.rol,
      nombre: nuevoUsuario.nombre,
      apellido: nuevoUsuario.apellido,
    });

    // Guardar el hash del refresh token en la bd
    const refreshTokenHash = await bcrypt.hash(tokens.refresh_token, salt);
    await this.prismaService.usuario.update({
      where: { id_usuario: nuevoUsuario.id_usuario },
      data: { refresh_token_hash: refreshTokenHash },
    });

    return tokens;
  }

  /**
   * Inicia sesión validando credenciales y guardando el hash del refresh token.
   * El controlador es responsable de establecer las cookies HttpOnly.
   */
  async iniciarSesion(
    req: Request,
    inicioSesionDto: InicioSesionDto,
  ): Promise<ParDeTokens> {
    const { correo, password } = inicioSesionDto;

    const usuario = await this.prismaService.usuario.findUnique({
      where: { correo },
    });

    if (!usuario || usuario.estado !== 'ACTIVO') {
      throw new UnauthorizedException(
        'Credenciales incorrectas o usuario inactivo.',
      );
    }

    const contrasenaValida = await bcrypt.compare(
      password,
      usuario.password_hash,
    );

    if (!contrasenaValida) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    const tokens = this.generarParDeTokens({
      id_usuario: usuario.id_usuario,
      correo: usuario.correo,
      rol: usuario.rol,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
    });

    // Hash y guardar refresh token
    const salt = await bcrypt.genSalt();
    const refreshTokenHash = await bcrypt.hash(tokens.refresh_token, salt);

    await this.prismaService.usuario.update({
      where: { id_usuario: usuario.id_usuario },
      data: { refresh_token_hash: refreshTokenHash },
    });

    await this.auditLog.logAudit(
      req,
      'LOGIN',
      'usuario',
      1,
      usuario.id_usuario,
    );

    return tokens;
  }

  /**
   * Valida el refresh token provisto, comprueba su hash en la bd y emite nuevos tokens.
   * El controlador es responsable de establecer las cookies HttpOnly.
   */
  async refrescarTokens(refreshToken: string): Promise<ParDeTokens> {
    // Validar firma y expiración del refresh token
    const payload = this.verificarToken(refreshToken, this.claveSecretaRefresh);

    const usuario = await this.prismaService.usuario.findUnique({
      where: { id_usuario: payload.id_usuario },
    });

    if (
      !usuario ||
      usuario.estado !== 'ACTIVO' ||
      !usuario.refresh_token_hash
    ) {
      throw new UnauthorizedException('Acceso no autorizado o token inválido.');
    }

    // Comparar con el hash almacenado
    const tokenValido = await bcrypt.compare(
      refreshToken,
      usuario.refresh_token_hash,
    );
    if (!tokenValido) {
      throw new UnauthorizedException('Token de refresco inválido.');
    }

    // Generar nuevo par de tokens (Rotación de Refresh Tokens)
    const tokens = this.generarParDeTokens({
      id_usuario: usuario.id_usuario,
      correo: usuario.correo,
      rol: usuario.rol,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
    });

    const salt = await bcrypt.genSalt();
    const nuevoRefreshTokenHash = await bcrypt.hash(tokens.refresh_token, salt);

    await this.prismaService.usuario.update({
      where: { id_usuario: usuario.id_usuario },
      data: { refresh_token_hash: nuevoRefreshTokenHash },
    });

    return tokens;
  }

  /**
   * Elimina el refresh token de la base de datos al cerrar sesión.
   */
  async cerrarSesion(
    req: Request,
    idUsuario: number,
  ): Promise<{ mensaje: string }> {
    await this.prismaService.usuario.update({
      where: { id_usuario: idUsuario },
      data: { refresh_token_hash: null },
    });

    await this.auditLog.logAudit(req, 'LOGOUT', 'usuario', 2, idUsuario);

    return { mensaje: 'Sesión cerrada exitosamente.' };
  }

  /**
   * Retorna información del perfil del usuario (nombre, apellido, correo, rol y password enmascarado) para el frontend.
   */
  async obtenerInfoUsuario(idUsuario: number): Promise<{
    rol: string;
    nombre: string;
    apellido: string;
    correo: string;
    password?: string;
  }> {
    const usuario = await this.prismaService.usuario.findUnique({
      where: { id_usuario: idUsuario },
      select: {
        rol: true,
        estado: true,
        nombre: true,
        apellido: true,
        correo: true,
      },
    });

    if (!usuario || usuario.estado !== 'ACTIVO') {
      throw new UnauthorizedException('Usuario no encontrado o inactivo.');
    }

    return {
      rol: usuario.rol,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      password: '********',
    };
  }
}
