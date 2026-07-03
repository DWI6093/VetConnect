import { Module } from '@nestjs/common';
import { ArcoController } from './arco.controller';
import { ArcoService } from './arco.service';
import { EliminacionProgramadaTask } from './tasks/eliminacion-programada.task';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ArcoController],
  providers: [ArcoService, EliminacionProgramadaTask],
})
export class ArcoModule {}
