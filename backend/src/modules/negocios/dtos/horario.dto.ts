import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';

export enum DiaSemana {
  LUNES = 'LUNES',
  MARTES = 'MARTES',
  MIERCOLES = 'MIERCOLES',
  JUEVES = 'JUEVES',
  VIERNES = 'VIERNES',
  SABADO = 'SABADO',
  DOMINGO = 'DOMINGO',
}

export class HorarioItemDto {
  @IsEnum(DiaSemana, { message: 'Día inválido' })
  dia!: DiaSemana;

  // Formato esperado "HH:mm" en 24h, ej "09:00"
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'horaApertura debe tener formato HH:mm',
  })
  horaApertura!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'horaCierre debe tener formato HH:mm',
  })
  horaCierre!: string;
}

export class ActualizarHorariosDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => HorarioItemDto)
  horarios!: HorarioItemDto[];
}
