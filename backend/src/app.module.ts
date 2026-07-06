import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './database/prisma.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { AuthModule } from './modules/auth/auth.module';
import { LegalModule } from './modules/legal/legal.module';
import { LogsModule } from './modules/logs/logs.module';
import { ArcoModule } from './modules/arco/arco.module';
import { NegociosModule } from './modules/negocios/negocios.module';
import { RateLimitModule } from './common/rate-limit/rate-limit.module';
import { LimiteInternoInterceptor } from './common/rate-limit/limite-interno.interceptor';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    UsuariosModule,
    AuthModule,
    LegalModule,
    LogsModule,
    ArcoModule,
    NegociosModule,
    RateLimitModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: LimiteInternoInterceptor },
  ],
})
export class AppModule {}
