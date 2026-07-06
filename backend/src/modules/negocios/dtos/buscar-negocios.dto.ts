import { IsNotEmpty, IsNumber, Max, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class BuscarNegociosDto {
  @IsNotEmpty({ message: 'La latitud es requerida' })
  @IsNumber({}, { message: 'La latitud debe ser un número decimal' })
  @Min(-90, { message: 'La latitud mínima permitida es -90' })
  @Max(90, { message: 'La latitud máxima permitida es 90' })
  @Type(() => Number)
  latitud: number;

  @IsNotEmpty({ message: 'La longitud es requerida' })
  @IsNumber({}, { message: 'La longitud debe ser un número decimal' })
  @Min(-180, { message: 'La longitud mínima permitida es -180' })
  @Max(180, { message: 'La longitud máxima permitida es 180' })
  @Type(() => Number)
  longitud: number;

  @IsOptional()
  @IsNumber({}, { message: 'El radio debe ser un número entero' })
  @Min(1, { message: 'El radio debe ser mayor a 0 metros' })
  @Type(() => Number)
  radioMetros?: number;
}
