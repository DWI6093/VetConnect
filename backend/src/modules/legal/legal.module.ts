import { Module } from '@nestjs/common';
import { LegalController } from './legal.controller';
import { LegalService } from './legal.service';
import { AuthModule } from '../auth/auth.module';
@Module({
  controllers: [LegalController],
  imports:[AuthModule],
  providers: [LegalService],
})
export class LegalModule {}
