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
  @MinLength(3)
  @MaxLength(50)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  apellido?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(50)
  correo?: string;
}
