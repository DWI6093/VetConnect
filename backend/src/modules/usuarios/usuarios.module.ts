import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { ColaboradoresController } from './colaboradores.controller';
import { ColaboradoresService } from './colaboradores.service';

@Module({
  controllers: [UsuariosController, ColaboradoresController],
  providers: [UsuariosService, ColaboradoresService],
  exports: [UsuariosService, ColaboradoresService],
})
export class UsuariosModule {}
