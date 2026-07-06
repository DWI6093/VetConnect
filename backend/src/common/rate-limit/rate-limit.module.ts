import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../../modules/auth/auth.module';
import { RateLimitStoreService } from './rate-limit-store.service';
import { LimiteAutenticacionGuard } from './limite-autenticacion.guard';
import { LimiteInternoInterceptor } from './limite-interno.interceptor';

/**
 * Módulo global para RNF-02 (Límite de peticiones).
 * Se marca como @Global para que RateLimitStoreService y
 * LimiteAutenticacionGuard puedan inyectarse en cualquier módulo
 * (p. ej. AuthController) sin tener que importar este módulo en cada uno.
 */
@Global()
@Module({
  imports: [AuthModule],
  providers: [
    RateLimitStoreService,
    LimiteAutenticacionGuard,
    LimiteInternoInterceptor,
  ],
  exports: [
    RateLimitStoreService,
    LimiteAutenticacionGuard,
    LimiteInternoInterceptor,
  ],
})
export class RateLimitModule {}