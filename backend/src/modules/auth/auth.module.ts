import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GuardAutenticacion } from './guard/autenticacion.guard';
import { RolesGuard } from './guard/roles.guard';
import { AuditLogService } from '../../util/log-audit.service';
import { ErrorLogService } from '../../util/log-error.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    GuardAutenticacion,
    RolesGuard,
    AuditLogService,
    ErrorLogService,
  ],
  exports: [
    AuthService,
    GuardAutenticacion,
    RolesGuard,
    AuditLogService,
    ErrorLogService,
  ],
})
export class AuthModule {}
