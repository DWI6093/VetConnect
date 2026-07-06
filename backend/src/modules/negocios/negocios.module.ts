import { Module } from '@nestjs/common';
import { NegociosControlador } from './negocios.controlador';
import { NegociosServicio } from './negocios.servicio';
import { NegociosRepositorio } from './negocios.repositorio';

@Module({
  controllers: [NegociosControlador],
  providers: [NegociosServicio, NegociosRepositorio],
  exports: [NegociosServicio],
})
export class NegociosModule {}
