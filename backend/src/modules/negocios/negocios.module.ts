import { Module } from '@nestjs/common';
import { NegociosControlador } from './negocios.controlador';
import { NegociosServicio } from './negocios.servicio';
import { NegociosRepositorio } from './negocios.repositorio';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [NegociosControlador],
  providers: [NegociosServicio, NegociosRepositorio],
  exports: [NegociosServicio],
})
export class NegociosModule {}
