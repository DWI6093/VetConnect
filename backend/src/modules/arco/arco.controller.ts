import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { GuardAutenticacion } from '../auth/guard/autenticacion.guard';
import { ArcoService } from './arco.service';
import { RectificarDatosDto } from './dto/rectificar-datos.dto';
import { SolicitarOposicionDto } from './dto/solicitar-oposicion.dto';

// Sin RolesGuard: todo actúa siempre sobre el propio usuario, cualquier rol
// ejerce sus propios derechos ARCO.
@Controller('arco')
@UseGuards(GuardAutenticacion)
export class ArcoController {
  constructor(private readonly arcoService: ArcoService) {}

  @Get('acceso')
  obtenerMisDatos(@Req() req: Request) {
    return this.arcoService.obtenerMisDatos((req as any).usuario.id_usuario);
  }

  @Patch('rectificacion')
  rectificarDatos(@Body() dto: RectificarDatosDto, @Req() req: Request) {
    return this.arcoService.rectificarDatos(
      (req as any).usuario.id_usuario,
      dto,
      req,
    );
  }

  @Post('cancelacion')
  solicitarCancelacion(@Req() req: Request) {
    return this.arcoService.solicitarCancelacion(
      (req as any).usuario.id_usuario,
      req,
    );
  }

  @Post('cancelacion/restaurar')
  restaurarCuenta(@Req() req: Request) {
    return this.arcoService.cancelarSolicitudEliminacion(
      (req as any).usuario.id_usuario,
      req,
    );
  }

  @Post('oposicion')
  solicitarOposicion(@Body() dto: SolicitarOposicionDto, @Req() req: Request) {
    return this.arcoService.solicitarOposicion(
      (req as any).usuario.id_usuario,
      dto,
      req,
    );
  }
}
