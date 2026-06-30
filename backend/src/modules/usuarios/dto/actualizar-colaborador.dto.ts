import { PartialType } from '@nestjs/mapped-types';
import { CrearColaboradorDto } from './crear-colaborador.dto';
import { IsOptional, IsEnum } from 'class-validator';

export class ActualizarColaboradorDto extends PartialType(CrearColaboradorDto) {
  @IsOptional()
  @IsEnum(['ACTIVO', 'BLOQUEADO', 'PENDIENTE_ELIMINACION', 'ELIMINADO'])
  estado?: 'ACTIVO' | 'BLOQUEADO' | 'PENDIENTE_ELIMINACION' | 'ELIMINADO';
}
