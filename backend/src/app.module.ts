import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { AuthModule } from './modules/auth/auth.module';
import { LegalModule } from './modules/legal/legal.module';
import { LogsModule } from './modules/logs/logs.module';

@Module({
  imports: [PrismaModule, UsuariosModule, AuthModule, LegalModule, LogsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
