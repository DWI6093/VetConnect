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
} from '@nestjs/common';
import { ColaboradoresService } from './colaboradores.service';
import { CrearColaboradorDto } from './dto/crear-colaborador.dto';
import { ActualizarColaboradorDto } from './dto/actualizar-colaborador.dto';
import { GuardAutenticacion } from '../auth/guard/autenticacion.guard';

@Controller('colaboradores')
export class ColaboradoresController {
  constructor(private readonly colaboradoresService: ColaboradoresService) {}

  @Post()
  crear(@Body() crearColaboradorDto: CrearColaboradorDto) {
    return this.colaboradoresService.crear(crearColaboradorDto);
  }

  @Get()
  @UseGuards(GuardAutenticacion)
  obtenerTodos() {
    return this.colaboradoresService.obtenerTodos();
  }

  @Get(':id')
  @UseGuards(GuardAutenticacion)
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.colaboradoresService.obtenerPorId(id);
  }

  @Patch(':id')
  @UseGuards(GuardAutenticacion)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarColaboradorDto: ActualizarColaboradorDto,
  ) {
    return this.colaboradoresService.actualizar(id, actualizarColaboradorDto);
  }

  @Delete(':id')
  @UseGuards(GuardAutenticacion)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.colaboradoresService.eliminar(id);
  }
}
