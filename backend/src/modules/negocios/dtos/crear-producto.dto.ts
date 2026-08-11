import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CrearProductoDto {
  @IsNotEmpty({ message: 'El nombre del producto es requerido' })
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

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  disponible?: boolean;
}
