import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsBoolean,
  Equals,
} from 'class-validator';

export class CrearClienteDto {
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

  @IsBoolean({ message: 'La aceptación del aviso debe ser un valor booleano.' })
  @Equals(true, { message: 'Debe aceptar el aviso de privacidad para registrarse.' })
  aceptoAviso: boolean;
}
