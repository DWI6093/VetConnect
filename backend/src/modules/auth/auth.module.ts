import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GuardAutenticacion } from './guard/autenticacion.guard';
import { RolesGuard } from './guard/roles.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, GuardAutenticacion, RolesGuard],
  exports: [AuthService, GuardAutenticacion, RolesGuard],
})
export class AuthModule {}
