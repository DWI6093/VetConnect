import { Controller, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { RateLimitModule } from 'src/common/rate-limit/rate-limit.module';

@Controller('usuarios')
@UseGuards(RateLimitModule)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}
}
