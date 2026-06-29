import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GuardAutenticacion } from './guard/autenticacion.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, GuardAutenticacion],
  exports: [AuthService, GuardAutenticacion],
})
export class AuthModule {}
