import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { NegociosServicio } from './negocios.servicio';
import { BuscarNegociosDto } from './dtos/buscar-negocios.dto';
import { BuscarCatalogoDto } from './dtos/buscar-catalogo.dto';
import { CrearNegocioDto } from './dtos/crear-negocio.dto';
import { ActualizarNegocioDto } from './dtos/actualizar-negocio.dto';
import { GuardAutenticacion } from '../auth/guard/autenticacion.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('negocios')
export class NegociosControlador {
  constructor(private readonly negociosServicio: NegociosServicio) {}

  @Get('cercanos')
  async obtenerCercanos(@Query() buscarNegociosDto: BuscarNegociosDto) {
    const radio = buscarNegociosDto.radioMetros ?? 5000;
    return this.negociosServicio.obtenerNegociosCercanos(
      buscarNegociosDto.latitud,
      buscarNegociosDto.longitud,
      radio,
    );
  }

  @Get('catalogo')
  async obtenerCatalogo(@Query() buscarCatalogoDto: BuscarCatalogoDto) {
    return this.negociosServicio.obtenerCatalogo(
      buscarCatalogoDto.nombre,
      buscarCatalogoDto.pagina,
      buscarCatalogoDto.limite,
    );
  }

  @Get('mis-negocios')
  @UseGuards(GuardAutenticacion, RolesGuard)
  @Roles(Role.COLABORADOR)
  async obtenerMisNegocios(@Req() solicitud: any) {
    return this.negociosServicio.obtenerMisNegocios(solicitud.usuario.id_usuario);
  }

  @Post()
  @UseGuards(GuardAutenticacion, RolesGuard)
  @Roles(Role.COLABORADOR)
  async crearNegocio(@Req() solicitud: any, @Body() crearNegocioDto: CrearNegocioDto) {
    return this.negociosServicio.crearNegocio(solicitud.usuario.id_usuario, crearNegocioDto);
  }

  @Patch(':id')
  @UseGuards(GuardAutenticacion, RolesGuard)
  @Roles(Role.COLABORADOR)
  async actualizarNegocio(
    @Req() solicitud: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarNegocioDto: ActualizarNegocioDto,
  ) {
    return this.negociosServicio.actualizarNegocio(
      id,
      solicitud.usuario.id_usuario,
      actualizarNegocioDto,
    );
  }

  @Patch(':id/estado')
  @UseGuards(GuardAutenticacion, RolesGuard)
  @Roles(Role.COLABORADOR)
  async cambiarEstado(
    @Req() solicitud: any,
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: 'ACTIVO' | 'INACTIVO',
  ) {
    return this.negociosServicio.cambiarEstadoNegocio(id, solicitud.usuario.id_usuario, estado);
  }
}