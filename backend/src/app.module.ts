import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './database/prisma.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { AuthModule } from './modules/auth/auth.module';
import { LegalModule } from './modules/legal/legal.module';
import { LogsModule } from './modules/logs/logs.module';
import { ArcoModule } from './modules/arco/arco.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    UsuariosModule,
    AuthModule,
    LegalModule,
    LogsModule,
    ArcoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
