import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export enum RolUsuario {
  CLIENTE = 'CLIENTE',
  COLABORADOR = 'COLABORADOR',
}

export class CreateUserDto {

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({
    message: 'El nombre debe ser una cadena de texto.',
  })
  @IsNotEmpty({
    message: 'El nombre es obligatorio.',
  })
  @Length(2, 50, {
    message: 'El nombre debe tener entre 2 y 50 caracteres.',
  })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(?:[ '-][A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)*$/, {
    message:
      'El nombre solo puede contener letras, espacios internos, apóstrofes y guiones.',
  })
  nombre!: string;


  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({
    message: 'El apellido debe ser una cadena de texto.',
  })
  @IsNotEmpty({
    message: 'El apellido es obligatorio.',
  })
  @Length(2, 50, {
    message: 'El apellido debe tener entre 2 y 50 caracteres.',
  })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(?:[ '-][A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)*$/, {
    message:
      'El apellido solo puede contener letras, espacios internos, apóstrofes y guiones.',
  })
  apellido!: string;


  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value,
  )
  @IsNotEmpty({
    message: 'El correo es obligatorio.',
  })
  @IsEmail({}, {
    message: 'Debe ingresar un correo electrónico válido.',
  })
  @Length(5, 254, {
    message: 'El correo debe tener entre 5 y 254 caracteres.',
  })
  correo!: string;


  @IsString({
    message: 'La contraseña debe ser texto.',
  })
  @IsNotEmpty({
    message: 'La contraseña es obligatoria.',
  })
  @Length(8, 64, {
    message: 'La contraseña debe tener entre 8 y 64 caracteres.',
  })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&()_\-+=.,;:])[A-Za-z\d@$!%*?#&()_\-+=.,;:]{8,64}$/,
    {
      message:
        'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial.',
    },
  )
  password!: string;
  

  @IsEnum(RolUsuario, {
    message:
      'El rol únicamente puede ser CLIENTE o COLABORADOR.',
  })
  rol!: RolUsuario;

}