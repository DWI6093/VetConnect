import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ArcoService } from '../arco.service';

@Injectable()
export class EliminacionProgramadaTask {
  private readonly logger = new Logger(EliminacionProgramadaTask.name);

  constructor(private readonly arcoService: ArcoService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async ejecutarEliminacionesProgramadas() {
    const pendientes = await this.arcoService.obtenerPendientesDeAnonimizar();
    if (pendientes.length === 0) return;

    this.logger.log(
      `Anonimizando ${pendientes.length} cuenta(s) con plazo vencido...`,
    );

    for (const { id_usuario } of pendientes) {
      try {
        await this.arcoService.anonimizarUsuario(id_usuario);
        this.logger.log(`Usuario ${id_usuario} anonimizado.`);
      } catch (error) {
        this.logger.error(`Error anonimizando usuario ${id_usuario}`, error);
      }
    }
  }
}
