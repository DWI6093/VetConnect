import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CrearClienteDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
