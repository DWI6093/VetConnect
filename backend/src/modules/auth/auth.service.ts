import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CrearClienteDto } from '../usuarios/dto/crear-cliente.dto';
import { InicioSesionDto } from '../usuarios/dto/inicio-sesion.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

interface CargaUtilToken {
  id_usuario: number;
  correo: string;
  rol: string;
  nombre: string;
  apellido: string;
}

@Injectable()
export class AuthService {
  private readonly claveSecretaJwt =
    process.env.JWT_SECRET || 'VetConnectClaveSecretaParaFirmarTokensJWT2026';

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Genera un token firmado de forma nativa con un tiempo de expiración determinado.
   */
  private generarTokenFirma(cargaUtil: any, duracionSegundos: number): string {
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
      .createHmac('sha256', this.claveSecretaJwt)
      .update(`${cabecera}.${carga}`)
      .digest('base64url');

    return `${cabecera}.${carga}.${firma}`;
  }

  /**
   * Verifica la validez y expiración de un token JWT firmado de forma nativa.
   */
  private verificarToken(token: string): any {
    try {
      const partes = token.split('.');
      if (partes.length !== 3) {
        throw new Error('Formato de token no válido');
      }

      const [cabecera, carga, firma] = partes;
      const firmaEsperada = crypto
        .createHmac('sha256', this.claveSecretaJwt)
        .update(`${cabecera}.${carga}`)
        .digest('base64url');

      if (firma !== firmaEsperada) {
        throw new Error('Firma no coincide');
      }

      const payload = JSON.parse(
        Buffer.from(carga, 'base64url').toString('utf8'),
      );
      const tiempoActual = Math.floor(Date.now() / 1000);

      if (payload.exp && tiempoActual > payload.exp) {
        throw new Error('El token ha expirado');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado.');
    }
  }

  /**
   * Genera el par de tokens de acceso (10 minutos) y refresco (7 días).
   */
  private generarParDeTokens(carga: CargaUtilToken): {
    token: string;
    refresh_token: string;
  } {
    const token = this.generarTokenFirma(carga, 10 * 60); // 10 minutos
    const refresh_token = this.generarTokenFirma(
      { id_usuario: carga.id_usuario },
      7 * 24 * 60 * 60,
    ); // 7 días
    return { token, refresh_token };
  }

  /**
   * Registra un nuevo cliente e inicia sesión generando los tokens correspondientes.
   */
  async registrarCliente(crearClienteDto: CrearClienteDto) {
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
        estado: true,
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

    return {
      usuario: nuevoUsuario,
      ...tokens,
    };
  }

  /**
   * Inicia sesión validando credenciales y guardando el hash del refresh token.
   */
  async iniciarSesion(inicioSesionDto: InicioSesionDto) {
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

    return {
      ...tokens,
    };
  }

  /**
   * Valida el refresh token provisto, comprueba su hash en la bd y emite nuevos tokens.
   */
  async refrescarTokens(refresh_token: string) {
    // Validar firma y expiración del refresh token
    const payload = this.verificarToken(refresh_token);

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
      refresh_token,
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
  async cerrarSesion(idUsuario: number) {
    await this.prismaService.usuario.update({
      where: { id_usuario: idUsuario },
      data: { refresh_token_hash: null },
    });
    return { mensaje: 'Sesión cerrada exitosamente.' };
  }
}
