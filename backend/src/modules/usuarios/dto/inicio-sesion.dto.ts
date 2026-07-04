import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class InicioSesionDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(50)
  @MinLength(3)
  correo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @MinLength(3)
  password: string;
}
