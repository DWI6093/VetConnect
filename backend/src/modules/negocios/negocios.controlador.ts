import { Controller, Get, Query } from '@nestjs/common';
import { NegociosServicio } from './negocios.servicio';
import { BuscarNegociosDto } from './dtos/buscar-negocios.dto';

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
}
