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
import { Put, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { ActualizarHorariosDto } from './dtos/horario.dto';
import { CrearServicioDto } from './dtos/crear-servicio.dto';
import { CrearProductoDto } from './dtos/crear-producto.dto';

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
    return this.negociosServicio.obtenerMisNegocios(
      solicitud.usuario.id_usuario,
    );
  }

  @Post()
  @UseGuards(GuardAutenticacion, RolesGuard)
  @Roles(Role.COLABORADOR)
  async crearNegocio(
    @Req() solicitud: any,
    @Body() crearNegocioDto: CrearNegocioDto,
  ) {
    return this.negociosServicio.crearNegocio(
      solicitud.usuario.id_usuario,
      crearNegocioDto,
    );
  }
  @Get('colaborador/:id')
  @UseGuards(GuardAutenticacion, RolesGuard)
  @Roles(Role.COLABORADOR)
  async obtenerDetalleColaborador(
    @Req() solicitud: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.negociosServicio.obtenerDetalleColaborador(
      id,
      solicitud.usuario.id_usuario,
    );
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
    return this.negociosServicio.cambiarEstadoNegocio(
      id,
      solicitud.usuario.id_usuario,
      estado,
    );
  }
  // RF17 - Horarios
  @Put(':id/horarios')
  @UseGuards(GuardAutenticacion, RolesGuard)
  @Roles(Role.COLABORADOR)
  async actualizarHorarios(
    @Req() solicitud: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarHorariosDto,
  ) {
    return this.negociosServicio.actualizarHorarios(
      id,
      solicitud.usuario.id_usuario,
      dto.horarios,
    );
  }

  // RF17 - Servicios
  @Post(':id/servicios')
  @UseGuards(GuardAutenticacion, RolesGuard)
  @Roles(Role.COLABORADOR)
  async crearServicio(
    @Req() solicitud: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CrearServicioDto,
  ) {
    return this.negociosServicio.crearServicio(
      id,
      solicitud.usuario.id_usuario,
      dto,
    );
  }

  @Delete('servicios/:idServicio')
  @UseGuards(GuardAutenticacion, RolesGuard)
  @Roles(Role.COLABORADOR)
  async eliminarServicio(
    @Req() solicitud: any,
    @Param('idServicio', ParseIntPipe) idServicio: number,
  ) {
    return this.negociosServicio.eliminarServicio(
      idServicio,
      solicitud.usuario.id_usuario,
    );
  }

  // RF17 - Productos
  @Post(':id/productos')
  @UseGuards(GuardAutenticacion, RolesGuard)
  @Roles(Role.COLABORADOR)
  async crearProducto(
    @Req() solicitud: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CrearProductoDto,
  ) {
    return this.negociosServicio.crearProducto(
      id,
      solicitud.usuario.id_usuario,
      dto,
    );
  }

  @Delete('productos/:idProducto')
  @UseGuards(GuardAutenticacion, RolesGuard)
  @Roles(Role.COLABORADOR)
  async eliminarProducto(
    @Req() solicitud: any,
    @Param('idProducto', ParseIntPipe) idProducto: number,
  ) {
    return this.negociosServicio.eliminarProducto(
      idProducto,
      solicitud.usuario.id_usuario,
    );
  }

  // RF15, RF28 - Imágenes (máximo 4, plan Básico)
  @Post(':id/imagenes')
  @UseGuards(GuardAutenticacion, RolesGuard)
  @Roles(Role.COLABORADOR)
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: diskStorage({
        destination: './uploads/negocios',
        filename: (_req, file, callback) => {
          const sufijo = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `negocio-${sufijo}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return callback(
            new BadRequestException(
              'Solo se permiten imágenes JPG, PNG o WEBP',
            ),
            false,
          );
        }
        callback(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async agregarImagen(
    @Req() solicitud: any,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() archivo: Express.Multer.File,
  ) {
    if (!archivo) {
      throw new BadRequestException('No se recibió ningún archivo.');
    }
    return this.negociosServicio.agregarImagen(
      id,
      solicitud.usuario.id_usuario,
      archivo,
    );
  }

  @Delete('imagenes/:idImagen')
  @UseGuards(GuardAutenticacion, RolesGuard)
  @Roles(Role.COLABORADOR)
  async eliminarImagen(
    @Req() solicitud: any,
    @Param('idImagen', ParseIntPipe) idImagen: number,
  ) {
    return this.negociosServicio.eliminarImagen(
      idImagen,
      solicitud.usuario.id_usuario,
    );
  }
}
