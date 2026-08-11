import {
  IsOptional,
  IsString,
  MaxLength,
  IsNumber,
  Min,
  Max,
  Matches,
} from 'class-validator';

export class ActualizarNegocioDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser un texto' })
  @MaxLength(150, { message: 'La dirección no puede exceder 150 caracteres' })
  direccion?: string;

  @IsOptional()
  @Matches(/^\d{10}$/, { message: 'El teléfono debe tener 10 dígitos' })
  telefono?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  descripcion?: string;

  @IsOptional()
  @IsNumber({}, { message: 'La latitud debe ser un número decimal' })
  @Min(-90, { message: 'La latitud mínima permitida es -90' })
  @Max(90, { message: 'La latitud máxima permitida es 90' })
  latitud?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La longitud debe ser un número decimal' })
  @Min(-180, { message: 'La longitud mínima permitida es -180' })
  @Max(180, { message: 'La longitud máxima permitida es 180' })
  longitud?: number;
}
