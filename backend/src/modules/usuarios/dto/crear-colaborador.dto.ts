import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CrearColaboradorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @MinLength(3)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @MinLength(3)
  apellido: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(50)
  @MinLength(5)
  correo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @MinLength(6)
  password: string;
}
