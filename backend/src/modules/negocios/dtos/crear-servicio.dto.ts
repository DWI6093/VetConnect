import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CrearServicioDto {
  @IsNotEmpty({ message: 'El nombre del servicio es requerido' })
  @IsString()
  @MaxLength(50)
  nombre!: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  descripcion?: string;

  @IsNotEmpty({ message: 'El precio es requerido' })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0)
  @Type(() => Number)
  precio!: number;
}