import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RectificarDatosDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  apellido?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  correo?: string;
}
