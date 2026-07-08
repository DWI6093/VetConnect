import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CrearClienteDto } from '../usuarios/dto/crear-cliente.dto';
import { CrearColaboradorDto } from '../usuarios/dto/crear-colaborador.dto';
import { InicioSesionDto } from '../usuarios/dto/inicio-sesion.dto';
import { GuardAutenticacion } from './guard/autenticacion.guard';

/**
 * Duración en milisegundos de cada cookie.
 * jwt_token: 10 minutos | refresh_token: 7 días
 */
const DURACION_JWT_MS = 10 * 60 * 1000;
const DURACION_REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Opciones base para las cookies HttpOnly.
 * HttpOnly → no accesible por JavaScript (mitiga XSS).
 * SameSite Strict → no se envían en peticiones cross-site (mitiga CSRF).
 */
const opcionesCookieBase = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Establece las cookies HttpOnly en la respuesta.
   */
  private establecerCookiesAuth(
    res: Response,
    token: string,
    refreshToken: string,
  ): void {
    res.cookie('jwt_token', token, {
      ...opcionesCookieBase,
      maxAge: DURACION_JWT_MS,
    });
    res.cookie('refresh_token', refreshToken, {
      ...opcionesCookieBase,
      maxAge: DURACION_REFRESH_MS,
    });
  }

  /**
   * Limpia las cookies de autenticación.
   */
  private limpiarCookiesAuth(res: Response): void {
    res.clearCookie('jwt_token', opcionesCookieBase);
    res.clearCookie('refresh_token', opcionesCookieBase);
  }

  @Post('registro-cliente')
  async registrarCliente(
    @Req() req: Request,
    @Body() crearClienteDto: CrearClienteDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const direccionIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const tokens = await this.authService.registrarCliente(crearClienteDto, direccionIp);
    this.establecerCookiesAuth(res, tokens.token, tokens.refresh_token);
    return { mensaje: 'Registro exitoso.' };
  }

  @Post('registro-colaborador')
  async registrarColaborador(
    @Req() req: Request,
    @Body() crearColaboradorDto: CrearColaboradorDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const direccionIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const tokens =
      await this.authService.registrarColaborador(crearColaboradorDto, direccionIp);
    this.establecerCookiesAuth(res, tokens.token, tokens.refresh_token);
    return { mensaje: 'Registro exitoso.' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async iniciarSesion(
    @Body() inicioSesionDto: InicioSesionDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.iniciarSesion(req, inicioSesionDto);
    this.establecerCookiesAuth(res, tokens.token, tokens.refresh_token);
    return { mensaje: 'Sesión iniciada.' };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refrescarTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('Token de refresco no encontrado.');
    }
    const tokens = await this.authService.refrescarTokens(refreshToken);
    this.establecerCookiesAuth(res, tokens.token, tokens.refresh_token);
    return { mensaje: 'Tokens renovados.' };
  }

  @UseGuards(GuardAutenticacion)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async cerrarSesion(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const idUsuario = (req as any).usuario?.id_usuario;
    if (!idUsuario) {
      throw new UnauthorizedException('No se pudo identificar al usuario.');
    }
    const resultado = await this.authService.cerrarSesion(req, idUsuario);
    this.limpiarCookiesAuth(res);
    return resultado;
  }

  /**
   * Endpoint protegido que retorna únicamente el rol del usuario autenticado.
   * No expone datos sensibles como correo, nombre o apellido.
   */
  @UseGuards(GuardAutenticacion)
  @Get('me')
  async obtenerInfoSesion(@Req() req: Request) {
    const idUsuario = (req as any).usuario?.id_usuario;
    return this.authService.obtenerInfoUsuario(idUsuario);
  }
}
