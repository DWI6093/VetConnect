import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CrearClienteDto } from '../usuarios/dto/crear-cliente.dto';
import { InicioSesionDto } from '../usuarios/dto/inicio-sesion.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro-cliente')
  registrarCliente(@Body() crearClienteDto: CrearClienteDto) {
    return this.authService.registrarCliente(crearClienteDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  iniciarSesion(@Body() inicioSesionDto: InicioSesionDto) {
    return this.authService.iniciarSesion(inicioSesionDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refrescarTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refrescarTokens(refreshTokenDto.refresh_token);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  cerrarSesion(@Body('id_usuario') idUsuario: number) {
    if (!idUsuario) {
      throw new UnauthorizedException(
        'ID de usuario requerido para cerrar sesión.',
      );
    }
    return this.authService.cerrarSesion(idUsuario);
  }
}
