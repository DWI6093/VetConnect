import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { ColaboradoresService } from './colaboradores.service';
import { CrearColaboradorDto } from './dto/crear-colaborador.dto';
import { ActualizarColaboradorDto } from './dto/actualizar-colaborador.dto';
import { GuardAutenticacion } from '../auth/guard/autenticacion.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RolesGuard } from '../auth/guard/roles.guard';

@Controller('colaboradores')
@UseGuards(GuardAutenticacion, RolesGuard)
@Roles(Role.COLABORADOR)
export class ColaboradoresController {
  constructor(private readonly colaboradoresService: ColaboradoresService) {}

  @Post()
  crear(@Body() crearColaboradorDto: CrearColaboradorDto) {
    return this.colaboradoresService.crear(crearColaboradorDto);
  }

  @Get()
  obtenerTodos() {
    return this.colaboradoresService.obtenerTodos();
  }

  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    this.validarPropietario(id, req);
    return this.colaboradoresService.obtenerPorId(id);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarColaboradorDto: ActualizarColaboradorDto,
    @Req() req: Request,
  ) {
    this.validarPropietario(id, req);
    return this.colaboradoresService.actualizar(id, actualizarColaboradorDto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    this.validarPropietario(id, req);
    return this.colaboradoresService.eliminar(id);
  }

  /** Solo el dueño del perfil puede acceder, editar o eliminar su propio recurso. */
  private validarPropietario(idRuta: number, req: Request) {
    const idUsuarioToken = (req as any).usuario?.id_usuario;
    if (idUsuarioToken !== idRuta) {
      throw new ForbiddenException('Sin permiso para acceder a este recurso.');
    }
  }
}
